/* eslint-disable prettier/prettier */
// src/shops/shop.entity.ts
import { Inventory } from '../inventory/inventory.entity';
import { User } from '../users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from '../orders/order.entity'; // <-- Import Order entity

@Entity({ name: 'shops' })
export class Shop {
  // ... (id, name, location, employees, inventory are here)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  location: string;

  @OneToMany(() => User, (user) => user.shop)
  employees: User[];

  @OneToMany(() => Inventory, (inventory) => inventory.shop)
  inventory: Inventory[];

  @OneToMany(() => Order, (order) => order.shop)
  orders: Order[];
}