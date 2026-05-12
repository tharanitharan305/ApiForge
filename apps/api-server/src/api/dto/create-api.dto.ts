import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsArray,
  IsNumber,
  IsBoolean,
  ValidateNested,
  MaxLength,
  MinLength,
  Min,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

class QueryParamDto {
  @IsString()
  key: string;

  @IsString()
  type: string;

  @IsBoolean()
  required: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}

class RequestFieldDto {
  @IsString()
  key: string;

  @IsEnum(['string', 'number', 'boolean', 'object', 'array'])
  type: string;

  @IsBoolean()
  required: boolean;

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

class ResponseMappingDto {
  @IsString()
  successPath: string;

  @IsString()
  messagePath: string;

  @IsString()
  dataPath: string;

  @IsString()
  @IsOptional()
  statusCodePath?: string;
}

export class CreateApiDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  overrideBaseUrl?: string;

  @IsString()
  @MinLength(1)
  endpoint: string;

  @IsEnum(HttpMethod)
  method: HttpMethod;

  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QueryParamDto)
  queryParams?: QueryParamDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RequestFieldDto)
  requestBody?: RequestFieldDto[];

  @ValidateNested()
  @Type(() => ResponseMappingDto)
  responseMapping: ResponseMappingDto;

  @IsNumber()
  @IsOptional()
  @Min(1000)
  timeout?: number;

  @IsBoolean()
  @IsOptional()
  authRequired?: boolean;
}
