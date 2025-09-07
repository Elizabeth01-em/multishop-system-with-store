/* eslint-disable prettier/prettier */
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TransferStatus } from '../../common/enums/transfer-status.enum';

export class UpdateTransferStatusDto {
  @IsEnum(TransferStatus)
  @IsNotEmpty()
  status: TransferStatus;
}