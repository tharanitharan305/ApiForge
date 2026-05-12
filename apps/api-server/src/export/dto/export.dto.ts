import { IsArray, IsString } from 'class-validator';

export class ExportDto {
  @IsArray()
  @IsString({ each: true })
  languages: string[];
}
