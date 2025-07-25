import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SectionDto {
  @ApiProperty({
    description: 'Name of the section (e.g., Hero, About, Contact)',
    example: 'Hero',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'TypeScript React component code for the section',
    example: 'import React from "react";\nexport default function Hero() { return <section>...</section>; }',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
} 