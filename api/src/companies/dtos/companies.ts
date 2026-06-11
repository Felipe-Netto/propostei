import { Transform } from "class-transformer";
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
} from "class-validator";

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    name: string;

    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() || undefined : value,
    )
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

    @IsUrl()
    @IsOptional()
    @MaxLength(500)
    logoUrl?: string;
}

export class UpdateCompanyDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(120)
    name?: string;

    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() || undefined : value,
    )
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

    @IsUrl()
    @IsOptional()
    @MaxLength(500)
    logoUrl?: string;
}