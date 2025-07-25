import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; // ✅ Import this
import { SectionsModule } from './sections/sections.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // ✅ Must come BEFORE MongooseModule
    MongooseModule.forRoot('mongodb+srv://tonyfayez111:fmatlfmatl@cluster0.ca6ucyv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'),
    SectionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
