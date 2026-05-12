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
} from 'class-validator';
import { Type } from 'class-transformer';

enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

class EnvironmentDto {
  @IsString()
  local: string;

  @IsString()
  production: string;
}

class QueryParamDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

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
  description?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RequestFieldDto)
  children?: RequestFieldDto[];
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

  @ValidateNested()
  @Type(() => EnvironmentDto)
  environments: EnvironmentDto;

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
