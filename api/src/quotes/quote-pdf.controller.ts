import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { QuotesService } from './quotes.service';
import { PdfService } from './pdf.service';

@Controller('propostas')
export class QuotePdfController {
    constructor(
        private readonly quotesService: QuotesService,
        private readonly pdfService: PdfService,
    ) {}

    @Get(':token/pdf')
    async getQuotePdf(@Param('token') token: string, @Res() res: Response) {
        const quote = await this.quotesService.getQuoteByToken(token);
        const pdf = await this.pdfService.generatePdf(quote);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="proposta-${token.slice(0, 8)}.pdf"`,
            'Content-Length': pdf.length,
        });

        res.end(pdf);
    }
}
