import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dtos/create-quote.dto';
import { UpdateQuoteDto } from './dtos/update-quote.dto';

@UseGuards(AuthGuard)
@Controller('companies/:companyId/quotes')
export class QuotesController {
    constructor(private readonly quotesService: QuotesService) {}

    @Post()
    async createQuote(
        @Param('companyId') companyId: string,
        @Body() body: CreateQuoteDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.quotesService.createQuote(companyId, body, user);
    }

    @Get()
    async getQuotes(
        @Param('companyId') companyId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.quotesService.getQuotes(companyId, user);
    }

    @Get(':quoteId')
    async getQuote(
        @Param('companyId') companyId: string,
        @Param('quoteId') quoteId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.quotesService.getQuote(companyId, quoteId, user);
    }

    @Patch(':quoteId')
    async updateQuote(
        @Param('companyId') companyId: string,
        @Param('quoteId') quoteId: string,
        @Body() body: UpdateQuoteDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.quotesService.updateQuote(companyId, quoteId, body, user);
    }

    @Patch(':quoteId/send')
    async sendQuote(
        @Param('companyId') companyId: string,
        @Param('quoteId') quoteId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.quotesService.sendQuote(companyId, quoteId, user);
    }

    @Patch(':quoteId/approve')
    async approveQuote(
        @Param('companyId') companyId: string,
        @Param('quoteId') quoteId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.quotesService.approveQuote(companyId, quoteId, user);
    }

    @Patch(':quoteId/reject')
    async rejectQuote(
        @Param('companyId') companyId: string,
        @Param('quoteId') quoteId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.quotesService.rejectQuote(companyId, quoteId, user);
    }

    @Patch(':quoteId/cancel')
    async cancelQuote(
        @Param('companyId') companyId: string,
        @Param('quoteId') quoteId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.quotesService.cancelQuote(companyId, quoteId, user);
    }
}
