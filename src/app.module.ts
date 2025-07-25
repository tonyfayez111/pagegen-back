import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; // ✅ Import this
import { SectionsModule } from './sections/sections.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // ✅ Must come BEFORE MongooseModule
    MongooseModule.forRoot(process.env.MONGO_URI ?? 'mongodb://localhost:27017/sections'),
    SectionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
