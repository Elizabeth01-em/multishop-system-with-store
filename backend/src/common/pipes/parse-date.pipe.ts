/* eslint-disable prettier/prettier */
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date | undefined> {
  constructor(private options: { optional?: boolean } = {}) {}
  transform(value: string): Date | undefined {
    if (this.options.optional && !value) {
      return undefined;
    }
    const val = new Date(value);
    if (isNaN(val.getTime())) {
      throw new BadRequestException('Invalid date format');
    }
    return val;
  }
}