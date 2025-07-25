import {
    Injectable,
    BadRequestException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { Section } from 'src/schemas/section.schema';
  import { SectionDto } from './dto/section.dto';
  import axios from 'axios';
  import { SaveSectionsDto } from './dto/save-sections.dto';
  
  @Injectable()
  export class SectionsService {
    constructor(
      @InjectModel(Section.name) private sectionModel: Model<Section>,
    ) {}
  
    private async callOpenRouterAPI(prompt: string): Promise<string> {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            {
              role: 'user',
              content: `SYSTEM: You are a professional UI/UX component generator .

CLIENT BRIEF: Design a landing page for a "${prompt}"
You are a professional UI/UX component generator.

🎯 TASK:
Generate 3 modern, styled sections for a landing page:
- "Hero": a bold welcome section with heading, subheading, and button.
- "About": a brief description of the company or idea.
- "Contact": a simple form with inputs and button.

🎨 DESIGN RULES:
- Use unique and modern color combinations (not just gray or white).
- Apply clear visual hierarchy, alignment, and spacing.
- Use only inline styles inside style={{ ... }}.
- Ensure full responsiveness using only vh, vw, %, and px.
- Use bold buttons, clean forms, and centered layout.
- Use real-looking content (e.g. “Welcome to GymPro”, “Submit”).

🚫 ABSOLUTELY DO NOT:
- ❌ Include any markdown like json
- ❌ Include explanations, labels, or extra text
- ❌ Include any comments like {/* ... */} or <!-- ... -->
- ❌ Use media queries (@media, min-width, max-width, etc.)
- ❌ Use CSS class names, styled-components, or external styles
- ❌ Use any JavaScript variables (e.g. vh, theme, styles, etc.)
- ❌ Use dynamic expressions inside JSX like {variable}
- ❌ Use ReactDOM.render or anything outside arrow functions

✅ FINAL FORMAT EXAMPLE:

{
  "Hero": () => (<section style={{...}}>...</section>),
  "About": () => (<section style={{...}}>...</section>),
  "Contact": () => (<section style={{...}}>...</section>)
}

Do not include anything else.




}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const raw = response.data.choices?.[0]?.message?.content;

      if (!raw) {
        throw new InternalServerErrorException('AI returned no response');
      }

      return raw;
    }

    private cleanAndParseAIResponse(response: string): any {
      try {
        // Remove any leading/trailing whitespace
        let cleanedResponse = response.trim();


        // Remove markdown code block formatting if present
        if (cleanedResponse.startsWith('```json') && cleanedResponse.endsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/^```json\s*|\s*```$/g, '');
        }

        // Manually extract sections using a more flexible regex
        const sections: Record<string, string> = {};
        const sectionNames = ['Hero', 'About', 'Contact'];

        sectionNames.forEach(name => {
          // More flexible regex to find the section content
          const sectionRegex = new RegExp(`"${name}":\\s*()\\s*=>\\s*\\(.*?<section[^>]*>.*?</section>.*?\\)`, 's');
          const match = cleanedResponse.match(sectionRegex);
          
          if (match) {
            // Extract the entire section definition
            sections[name] = match[0];
          } else {
            console.error(`Missing ${name} section`);
          }
        });

        // Validate the parsed response
        const missingKeys = sectionNames.filter(key => !sections[key]);

        if (missingKeys.length > 0) {
          // If sections are missing, try a more aggressive extraction
          sectionNames.forEach(name => {
            const fallbackRegex = new RegExp(`${name}.*?<section[^>]*>.*?</section>`, 's');
            const fallbackMatch = cleanedResponse.match(fallbackRegex);
            
            if (fallbackMatch) {
              sections[name] = fallbackMatch[0];
            }
          });

          // Recheck missing keys
          const stillMissingKeys = sectionNames.filter(key => !sections[key]);
          if (stillMissingKeys.length > 0) {
            throw new Error(`Missing sections: ${stillMissingKeys.join(', ')}`);
          }
        }

        // Construct a valid JSON object
        const parsedResponse = {
          Hero: sections.Hero,
          About: sections.About,
          Contact: sections.Contact
        };

        return parsedResponse;
      } catch (error) {
        console.error('Parsing Error:', error);
        console.error('Original Response:', response);
        throw new InternalServerErrorException(`Failed to parse AI JSON output: ${error.message}`);
      }
    }

    async generateSections(prompt: string): Promise<Section> {
      if (!process.env.OPENROUTER_API_KEY) {
        throw new BadRequestException('OPENROUTER_API_KEY is not set.');
      }
    
      try {
        // 1. Generate content
        const aiResponse = await this.callOpenRouterAPI(prompt);
        const parsedSections = this.cleanAndParseAIResponse(aiResponse);
    
        // 2. Prepare new content
        const updatedData = {
          prompt,
          sections: [
            { name: 'Hero', code: parsedSections.Hero },
            { name: 'About', code: parsedSections.About },
            { name: 'Contact', code: parsedSections.Contact }
          ]
        };
    
        // 3. Replace (upsert) in DB
        const updatedSection = await this.sectionModel.findOneAndUpdate(
          {},             // match any (or scope by user later)
          updatedData,     // new data
          { upsert: true, new: true } // create if not exists, return new
        );
    
        return updatedSection;
      } catch (error) {
        console.error('Section Generation Error:', error);
        throw new InternalServerErrorException(`Failed to generate sections: ${error.message}`);
      }
    }
    
  
    async getAllSections(): Promise<Section[]> {
      return this.sectionModel.find().exec();
    }
  
    async saveSections(prompt: string, sections: SaveSectionsDto['sections']): Promise<Section> {
      const heroSection = sections[0];
      
      const newSection = new this.sectionModel({
        prompt,
        sections: [heroSection]
      });

      return newSection.save();
    }
  }
  