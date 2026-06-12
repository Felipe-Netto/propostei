import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompaniesService } from 'src/companies/companies.service';
import { JwtPayload } from 'src/auth/types/jwt-payload';
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto } from './dtos/update-client.dto';

@Injectable()
export class ClientsService {
    private readonly clientSelect = {
        id: true,
        companyId: true,
        name: true,
        document: true,
        phone: true,
        email: true,
        address: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
    };

    constructor(
        private readonly prismaService: PrismaService,
        private readonly companiesService: CompaniesService,
    ) {}

    async createClient(companyId: string, data: CreateClientDto, user: JwtPayload) {
        await this.companiesService.ensureUserCanManageCompany(companyId, user.id);

        return this.prismaService.client.create({
            data: {
                companyId,
                name: data.name,
                document: data.document,
                phone: data.phone,
                email: data.email,
                address: data.address,
                notes: data.notes,
            },
            select: this.clientSelect,
        });
    }

    async getClients(companyId: string, user: JwtPayload) {
        await this.companiesService.ensureUserIsCompanyMember(companyId, user.id);

        return this.prismaService.client.findMany({
            where: { companyId },
            select: this.clientSelect,
            orderBy: { createdAt: 'desc' },
        });
    }

    async getClient(companyId: string, clientId: string, user: JwtPayload) {
        await this.companiesService.ensureUserIsCompanyMember(companyId, user.id);

        const client = await this.prismaService.client.findFirst({
            where: { id: clientId, companyId },
            select: this.clientSelect,
        });

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        return client;
    }

    async updateClient(companyId: string, clientId: string, data: UpdateClientDto, user: JwtPayload) {
        await this.companiesService.ensureUserCanManageCompany(companyId, user.id);

        const existing = await this.prismaService.client.findFirst({
            where: { id: clientId, companyId },
            select: { id: true },
        });

        if (!existing) {
            throw new NotFoundException('Client not found');
        }

        return this.prismaService.client.update({
            where: { id: clientId },
            data: {
                name: data.name,
                document: data.document,
                phone: data.phone,
                email: data.email,
                address: data.address,
                notes: data.notes,
            },
            select: this.clientSelect,
        });
    }
}
