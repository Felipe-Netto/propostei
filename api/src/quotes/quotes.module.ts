import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
    imports: [AuthModule, PrismaModule, CompaniesModule],
    controllers: [QuotesController],
    providers: [QuotesService],
    exports: [QuotesService],
})
export class QuotesModule {}
