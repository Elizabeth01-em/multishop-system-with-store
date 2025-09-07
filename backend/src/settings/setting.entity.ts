/* eslint-disable prettier/prettier */
// src/settings/setting.entity.ts
import { Entity, Column, PrimaryColumn } from 'typeorm';
import { SettingType } from '../common/enums/setting-type.enum';

@Entity({ name: 'settings' })
export class Setting {
  @PrimaryColumn()
  key: string; // e.g., 'TAX_RATE'

  @Column({ type: 'text' })
  value: string; // Stored as a string for flexibility

  @Column()
  name: string; // User-friendly name, e.g., "Company-Wide Tax Rate"

  @Column({ type: 'text' })
  description: string; // Helper text

  @Column({ type: 'enum', enum: SettingType, default: SettingType.STRING })
  type: SettingType;

  @Column()
  group: string; // e.g., 'financial', 'notification'
}