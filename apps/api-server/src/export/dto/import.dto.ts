import { IsObject } from 'class-validator';

export class ImportDto {
  @IsObject()
  config: any;
}
