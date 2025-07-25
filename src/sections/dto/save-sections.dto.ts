import { Type } from 'class-transformer';
import { ValidateNested, ArrayNotEmpty, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SectionDto } from './section.dto';

export class SaveSectionsDto {
  @ApiProperty({
    description: 'Prompt describing the website idea',
    example: 'landing page for a bakery',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty({
    description: 'Array of sections with their TypeScript React component code',
    type: [SectionDto],
    example: [
      {
        name: 'Hero',
        code: 'import React from "react";\nexport default function Hero() { return <section>...</section>; }'
      },
      {
        name: 'About',
        code: 'import React from "react";\nexport default function About() { return <section>...</section>; }'
      },
      {
        name: 'Contact',
        code: 'import React from "react";\nexport default function Contact() { return <section>...</section>; }'
      }
    ]
  })
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  @ArrayNotEmpty()
  sections: SectionDto[];
} 