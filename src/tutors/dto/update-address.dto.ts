import { PartialType } from '@nestjs/swagger';
import { AddressDto } from './address.dto';

export class UpdateAddressDto extends PartialType(AddressDto) {}