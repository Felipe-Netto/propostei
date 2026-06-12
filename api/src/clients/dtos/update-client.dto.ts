import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateClientDto {
    @IsString()
    @IsOptional()
    @MaxLength(120)
    name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(30)
    document?: string;

    @IsString()
    @IsOptional()
    @MaxLength(30)
    phone?: string;

    @IsEmail()
    @IsOptional()
    @MaxLength(120)
    email?: string;

    @IsString()
    @IsOptional()
    @MaxLength(255)
    address?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    notes?: string;
}
