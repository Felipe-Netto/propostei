import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
    imports: [AuthModule, PrismaModule, CompaniesModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}
