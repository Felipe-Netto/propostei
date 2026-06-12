import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CompaniesModule } from 'src/companies/companies.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
    imports: [AuthModule, PrismaModule, CompaniesModule],
    controllers: [ClientsController],
    providers: [ClientsService],
})
export class ClientsModule {}
