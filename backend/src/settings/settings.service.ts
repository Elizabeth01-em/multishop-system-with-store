/* eslint-disable prettier/prettier */
// src/settings/settings.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';
import { Setting } from './setting.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingType } from '../common/enums/setting-type.enum';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting) private readonly settingRepository: Repository<Setting>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(): Promise<Setting[]> {
    return this.settingRepository.find();
  }

  async update(updateSettingsDto: UpdateSettingsDto) {
    const { settings } = updateSettingsDto;
    const settingKeys = settings.map(s => s.key);
    
    // Fetch all settings to be updated in one query
    const existingSettings = await this.settingRepository.find({
      where: { key: In(settingKeys) },
    });
    
    // Create a map for easy lookup
    const settingsMap = new Map(existingSettings.map(s => [s.key, s]));

    for (const settingDto of settings) {
        const setting = settingsMap.get(settingDto.key);
        if (!setting) continue; // Ignore if a key from DTO doesn't exist in DB

        // Validate value based on type
        this.validateSettingValue(setting.type, settingDto.value, setting.name);

        setting.value = settingDto.value;
    }

    // Save all updated entities in a single transaction
    await this.dataSource.transaction(async manager => {
        await manager.save(existingSettings);
    });

    return { message: 'Settings updated successfully' };
  }
  
  // This helper function is used by the seeder in main.ts
  getRepository(): Repository<Setting> {
      return this.settingRepository;
  }
  
  private validateSettingValue(type: SettingType, value: string, name: string) {
    if (type === SettingType.NUMBER) {
        if (isNaN(parseFloat(value))) {
            throw new BadRequestException(`Value for "${name}" must be a valid number.`);
        }
    } else if (type === SettingType.BOOLEAN) {
        if (value !== 'true' && value !== 'false') {
            throw new BadRequestException(`Value for "${name}" must be either "true" or "false".`);
        }
    }
  }
}