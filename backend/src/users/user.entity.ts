/* eslint-disable prettier/prettier */
// src/users/user.entity.ts
import { Shop } from '../shops/shop.entity';
import { UserRole } from '../common/enums/user-role.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) 
  password?: string; 

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  zipCode?: string;

  @ManyToOne(() => Shop, (shop) => shop.employees, { nullable: true })
  @JoinColumn({ name: 'shopId' })
  shop: Shop;

  @Column({ nullable: true })
  shopId: string;
}