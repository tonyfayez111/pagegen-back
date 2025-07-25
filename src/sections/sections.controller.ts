// src/sections/sections.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionsDto } from './dto/createsections.dto';
import { SaveSectionsDto } from './dto/save-sections.dto';
import { Section } from 'src/schemas/section.schema';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Generate website sections using AI',
    description: 'Uses AI to generate 3 section names for a website based on the provided prompt. Requires OPENROUTER_API_KEY environment variable to be set.'
  })
  @ApiBody({ type: CreateSectionsDto })
  @ApiResponse({ status: 201, description: 'Sections generated successfully', type: Section })
  @ApiResponse({ status: 400, description: 'Bad request - missing API key or invalid prompt' })
  @ApiResponse({ status: 500, description: 'Internal server error - AI service error' })
  async create(@Body() createDto: CreateSectionsDto): Promise<Section> {
    return this.sectionsService.generateSections(createDto.prompt);
  }

  @Post('save')
  @ApiOperation({ 
    summary: 'Save custom sections',
    description: 'Save custom sections with duplicate detection. Validates that no duplicate section names exist.'
  })
  @ApiBody({ type: SaveSectionsDto })
  @ApiResponse({ status: 201, description: 'Sections saved successfully', type: Section })
  @ApiResponse({ status: 400, description: 'Bad request - duplicate section names or validation errors' })
  async saveSections(@Body() saveDto: SaveSectionsDto): Promise<Section> {
    return this.sectionsService.saveSections(saveDto.prompt, saveDto.sections);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all generated sections',
    description: 'Retrieves all previously generated website sections from the database'
  })
  @ApiResponse({ status: 200, description: 'Sections retrieved successfully', type: [Section] })
  async findAll(): Promise<Section[]> {
    return this.sectionsService.getAllSections();
  }
}
