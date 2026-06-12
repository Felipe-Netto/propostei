import { Type } from 'class-transformer';
import { IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class CreateQuoteItemDto {
    @IsString()
    @MaxLength(255)
    description: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0.01)
    quantity: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    unitPrice: number;
}
