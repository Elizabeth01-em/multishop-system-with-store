/* eslint-disable prettier/prettier */
// src/settings/dto/update-settings.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class SettingDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  value: string; // Allow empty strings, but must be present
}

export class UpdateSettingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingDto)
  settings: SettingDto[];
}