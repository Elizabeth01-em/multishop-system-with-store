/* eslint-disable prettier/prettier */
// src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Creates a new user and hashes their password.
   * @param createUserDto The user data
   * @returns The created user object without the password.
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Check if user with this email already exists
    const existingUser = await this.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(newUser);
    
    // Don't return the password
    delete savedUser.password;
    return savedUser;
  }

  /**
   * Retrieves all users from the database.
   * @returns An array of user objects.
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
  
  /**
   * Finds a user by their email address, including the password field.
   * This method is used internally by the AuthService.
   */
  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // Explicitly select the password
      .where('user.email = :email', { email })
      .getOne();
    return user ?? undefined;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Using preload to safely update by merging the DTO with the found entity
    const user = await this.usersRepository.preload({
        id: id,
        ...updateUserDto,
    });
    if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.usersRepository.save(user);
  }

  async deactivate(id: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.isActive = false;
    await this.usersRepository.save(user);
  }

  /**
   * Finds a user by ID, explicitly including the password hash.
   * This is used for password verification in the ProfileService.
   */
  async findOneByIdWithPassword(id: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'shopId', 'isActive', 'password'],
    });
    return user || undefined;
  }
}
