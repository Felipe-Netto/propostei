import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload';
import { ClientsService } from './clients.service';
import { QuotesService } from 'src/quotes/quotes.service';
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto } from './dtos/update-client.dto';

@UseGuards(AuthGuard)
@Controller('companies/:companyId/clients')
export class ClientsController {
    constructor(
        private readonly clientsService: ClientsService,
        private readonly quotesService: QuotesService,
    ) { }

    @Post()
    async createClient(
        @Param('companyId') companyId: string,
        @Body() body: CreateClientDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.clientsService.createClient(companyId, body, user);
    }

    @Get()
    async getClients(
        @Param('companyId') companyId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.clientsService.getClients(companyId, user);
    }

    @Get(':clientId')
    async getClient(
        @Param('companyId') companyId: string,
        @Param('clientId') clientId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.clientsService.getClient(companyId, clientId, user);
    }

    @Get(':clientId/quotes')
    async getClientQuotes(
        @Param('companyId') companyId: string,
        @Param('clientId') clientId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.quotesService.getClientQuotes(companyId, clientId, user);
    }

    @Patch(':clientId')
    async updateClient(
        @Param('companyId') companyId: string,
        @Param('clientId') clientId: string,
        @Body() body: UpdateClientDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.clientsService.updateClient(companyId, clientId, body, user);
    }
}
