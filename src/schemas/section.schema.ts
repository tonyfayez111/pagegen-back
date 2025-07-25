import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SectionDocument = Section & Document;

@Schema()
export class SectionItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;
}

@Schema()
export class Section {
  @Prop()
  prompt: string;

  @Prop([SectionItem])
  sections: SectionItem[];
}

export const SectionSchema = SchemaFactory.createForClass(Section);
