import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QuotesController } from './quotes.controller';
import { QuotePdfController } from './quote-pdf.controller';
import { QuotesService } from './quotes.service';
import { PdfService } from './pdf.service';

@Module({
    imports: [AuthModule, PrismaModule, CompaniesModule],
    controllers: [QuotesController, QuotePdfController],
    providers: [QuotesService, PdfService],
    exports: [QuotesService],
})
export class QuotesModule {}
