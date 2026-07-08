import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  company?: string;
}
