/* eslint-disable prettier/prettier */
 
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './auth/dto/create-user.dto';
import { UserRole } from './common/enums/user-role.enum';
import { SettingsService } from './settings/settings.service';
import { Setting } from './settings/setting.entity';
import { SettingType } from './common/enums/setting-type.enum';
import { INestApplication } from '@nestjs/common';

/**
 * A seeder function to create the initial OWNER user if one doesn't exist.
 */
async function bootstrapOwner(app: INestApplication) {
  const usersService = app.get(UsersService);

  const ownerEmail = 'owner@test.com';
 
  const ownerExists = await usersService.findOneByEmail(ownerEmail);

  if (!ownerExists) {
    console.log('--- Seeding Database: Owner user not found, creating one... ---');
    const ownerDto: CreateUserDto = {
      email: ownerEmail,
      firstName: 'Main',
      lastName: 'Owner',
      password: 'password123',
      role: UserRole.OWNER,
    };
    try {
       
      await usersService.create(ownerDto);
      console.log('--- Seeding Database: Owner user created successfully! ---');
    } catch (error) {
      console.error('--- Seeding Database: Error creating owner user ---', error);
    }
  } else {
    console.log('--- Seeding Database: Owner user already exists. Skipping. ---');
  }
}

/**
 * Seeder for System Settings
 */
async function bootstrapSettings(app: INestApplication) {
  const settingsService = app.get(SettingsService);
  const settingsRepo = settingsService.getRepository();

  const defaultSettings: Setting[] = [
    {
      key: 'TAX_RATE', value: '0.18', name: 'Company-Wide Tax Rate',
      description: 'Enter a decimal value, e.g., 0.18 for 18% tax. This will be applied to all future orders.',
      type: SettingType.NUMBER, group: 'financial'
    },
    {
      key: 'SHIPPING_FEE', value: '5.00', name: 'Flat Rate Shipping Fee',
      description: 'The standard shipping fee applied to all e-commerce orders.',
      type: SettingType.NUMBER, group: 'financial'
    },
    {
      key: 'ENABLE_EMAIL_NOTIFICATIONS', value: 'true', name: 'Send Email on New Order',
      description: 'If enabled, the system will send an email notification to the shop when a new order is routed to them.',
      type: SettingType.BOOLEAN, group: 'notifications'
    }
  ];

  for (const defaultSetting of defaultSettings) {
    const settingExists = await settingsRepo.findOneBy({ key: defaultSetting.key });
    if (!settingExists) {
      console.log(`--- Seeding: Creating setting "${defaultSetting.key}" ---`);
      await settingsRepo.save(defaultSetting);
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  
  // ==========================================================
  //                ADD THIS LINE HERE
  // ==========================================================
  app.enableCors();
  // ==========================================================
  
  // Run our seeder function after the app is initialized
  await bootstrapOwner(app);
  await bootstrapSettings(app); // <-- Add this call

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();