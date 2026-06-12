import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import { QuoteStatus } from '../../generated/prisma/client';
import { CreateQuoteItemDto } from './create-quote-item.dto';

export class UpdateQuoteDto {
    @IsString()
    @IsOptional()
    @MaxLength(120)
    title?: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(0)
    discount?: number;

    @IsDateString()
    @IsOptional()
    validUntil?: string;

    @IsEnum(QuoteStatus)
    @IsOptional()
    status?: QuoteStatus;

    @IsArray()
    @ArrayMinSize(1)
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateQuoteItemDto)
    items?: CreateQuoteItemDto[];
}
