import { IsString, IsOptional, IsObject, MaxLength, MinLength } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @MinLength(1)
  basePath: string;

  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;
}
