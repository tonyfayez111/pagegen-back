// src/sections/dto/create-sections.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionsDto {
  @ApiProperty({
    description: 'Prompt describing the website idea',
    example: 'make me landing page for bakery',
  })
  @IsString()
  prompt: string;
}
