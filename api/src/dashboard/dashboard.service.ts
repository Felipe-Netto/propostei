import { Injectable } from '@nestjs/common';
import { QuoteStatus } from '../generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompaniesService } from 'src/companies/companies.service';
import type { JwtPayload } from 'src/auth/types/jwt-payload';

@Injectable()
export class DashboardService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly companiesService: CompaniesService,
    ) {}

    async getDashboard(companyId: string, user: JwtPayload) {
        await this.companiesService.ensureUserIsCompanyMember(companyId, user.id);

        const [clientCount, quoteCounts, approvedAggregate, recentQuotes] = await Promise.all([
            this.prismaService.client.count({
                where: { companyId },
            }),
            this.prismaService.quote.groupBy({
                by: ['status'],
                where: { companyId },
                _count: { _all: true },
            }),
            this.prismaService.quote.aggregate({
                where: { companyId, status: QuoteStatus.APPROVED },
                _sum: { total: true },
            }),
            this.prismaService.quote.findMany({
                where: { companyId },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    total: true,
                    createdAt: true,
                    client: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
        ]);

        const statusCounts = Object.fromEntries(
            quoteCounts.map((g) => [g.status, g._count._all]),
        ) as Partial<Record<QuoteStatus, number>>;

        return {
            clientCount,
            quoteCounts: statusCounts,
            approvedTotal: approvedAggregate._sum.total?.toString() ?? '0',
            recentQuotes,
        };
    }
}
