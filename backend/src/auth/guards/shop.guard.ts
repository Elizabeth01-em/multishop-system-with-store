/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/auth/guards/shop.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class ShopGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If the user is an OWNER, they are granted access immediately.
    if (user?.role === UserRole.OWNER) {
      return true;
    }

    // If the user is an EMPLOYEE, compare their shopId with the one in the request
    const paramsShopId = request.params.shopId;
    const userShopId = user?.shopId;

    // The employee must be assigned to a shop and that shopId must match the request
    console.log('ShopGuard - user:', user); // <-- Add this line for debugging
    return !!userShopId && userShopId === paramsShopId;
  }
}