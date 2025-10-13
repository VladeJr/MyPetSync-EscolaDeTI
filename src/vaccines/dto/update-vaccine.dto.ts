import { PartialType } from '@nestjs/swagger';
import { CreateVaccineDto } from './create-vaccine.dto';

export class UpdateVaccineDto extends PartialType(CreateVaccineDto) {}
