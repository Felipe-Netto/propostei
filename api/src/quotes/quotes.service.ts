import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, QuoteStatus } from '../generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompaniesService } from 'src/companies/companies.service';
import type { JwtPayload } from 'src/auth/types/jwt-payload';
import { CreateQuoteDto } from './dtos/create-quote.dto';
import { UpdateQuoteDto } from './dtos/update-quote.dto';

@Injectable()
export class QuotesService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly companiesService: CompaniesService,
    ) {}

    private getQuoteItemSelect() {
        return {
            id: true,
            quoteId: true,
            description: true,
            quantity: true,
            unitPrice: true,
            total: true,
            createdAt: true,
            updatedAt: true,
        };
    }

    private getQuoteListSelect() {
        return {
            id: true,
            companyId: true,
            clientId: true,
            title: true,
            description: true,
            status: true,
            subtotal: true,
            discount: true,
            total: true,
            validUntil: true,
            approvedAt: true,
            rejectedAt: true,
            createdAt: true,
            updatedAt: true,
            client: {
                select: {
                    id: true,
                    name: true,
                    document: true,
                },
            },
        };
    }

    private getQuoteDetailSelect() {
        return {
            id: true,
            companyId: true,
            clientId: true,
            title: true,
            description: true,
            status: true,
            subtotal: true,
            discount: true,
            total: true,
            validUntil: true,
            approvedAt: true,
            rejectedAt: true,
            createdAt: true,
            updatedAt: true,
            client: {
                select: {
                    id: true,
                    name: true,
                    document: true,
                    phone: true,
                    email: true,
                },
            },
            items: {
                select: this.getQuoteItemSelect(),
                orderBy: { createdAt: 'asc' as const },
            },
        };
    }

    private buildItemsWithTotals(items: Array<{ description: string; quantity: number; unitPrice: number }>) {
        return items.map((item) => ({
            description: item.description,
            quantity: new Prisma.Decimal(item.quantity),
            unitPrice: new Prisma.Decimal(item.unitPrice),
            total: new Prisma.Decimal(item.quantity).times(new Prisma.Decimal(item.unitPrice)),
        }));
    }

    private sumItemTotals(items: Array<{ total: Prisma.Decimal }>): Prisma.Decimal {
        return items.reduce((acc, item) => acc.plus(item.total), new Prisma.Decimal(0));
    }

    async createQuote(companyId: string, data: CreateQuoteDto, user: JwtPayload) {
        await this.companiesService.ensureUserCanManageCompany(companyId, user.id);

        const client = await this.prismaService.client.findFirst({
            where: { id: data.clientId, companyId },
            select: { id: true },
        });

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        const itemsWithTotals = this.buildItemsWithTotals(data.items);
        const subtotal = this.sumItemTotals(itemsWithTotals);
        const discount = new Prisma.Decimal(data.discount ?? 0);

        if (discount.greaterThan(subtotal)) {
            throw new BadRequestException('Discount cannot be greater than subtotal');
        }

        const total = subtotal.minus(discount);

        return this.prismaService.quote.create({
            data: {
                companyId,
                clientId: data.clientId,
                title: data.title,
                description: data.description,
                discount,
                subtotal,
                total,
                validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
                items: {
                    create: itemsWithTotals,
                },
            },
            select: this.getQuoteDetailSelect(),
        });
    }

    async getQuotes(companyId: string, user: JwtPayload) {
        await this.companiesService.ensureUserIsCompanyMember(companyId, user.id);

        return this.prismaService.quote.findMany({
            where: { companyId },
            select: this.getQuoteListSelect(),
            orderBy: { createdAt: 'desc' },
        });
    }

    async getClientQuotes(companyId: string, clientId: string, user: JwtPayload) {
        await this.companiesService.ensureUserIsCompanyMember(companyId, user.id);

        return this.prismaService.quote.findMany({
            where: { companyId, clientId },
            select: this.getQuoteListSelect(),
            orderBy: { createdAt: 'desc' },
        });
    }

    async getQuote(companyId: string, quoteId: string, user: JwtPayload) {
        await this.companiesService.ensureUserIsCompanyMember(companyId, user.id);

        const quote = await this.prismaService.quote.findFirst({
            where: { id: quoteId, companyId },
            select: this.getQuoteDetailSelect(),
        });

        if (!quote) {
            throw new NotFoundException('Quote not found');
        }

        return quote;
    }

    async updateQuote(companyId: string, quoteId: string, data: UpdateQuoteDto, user: JwtPayload) {
        await this.companiesService.ensureUserCanManageCompany(companyId, user.id);

        const existing = await this.prismaService.quote.findFirst({
            where: { id: quoteId, companyId },
            select: { id: true, subtotal: true, discount: true },
        });

        if (!existing) {
            throw new NotFoundException('Quote not found');
        }

        let newSubtotal: Prisma.Decimal | undefined;
        let newDiscount: Prisma.Decimal | undefined;
        let newTotal: Prisma.Decimal | undefined;
        let newItems: ReturnType<typeof this.buildItemsWithTotals> | undefined;

        if (data.items !== undefined || data.discount !== undefined) {
            if (data.items !== undefined) {
                newItems = this.buildItemsWithTotals(data.items);
                newSubtotal = this.sumItemTotals(newItems);
            }

            if (data.discount !== undefined) {
                newDiscount = new Prisma.Decimal(data.discount);
            }

            const effectiveSubtotal = newSubtotal ?? existing.subtotal;
            const effectiveDiscount = newDiscount ?? existing.discount;

            if (effectiveDiscount.greaterThan(effectiveSubtotal)) {
                throw new BadRequestException('Discount cannot be greater than subtotal');
            }

            newTotal = effectiveSubtotal.minus(effectiveDiscount);
        }

        let approvedAt: Date | undefined;
        let rejectedAt: Date | undefined;

        if (data.status === QuoteStatus.APPROVED) {
            approvedAt = new Date();
        } else if (data.status === QuoteStatus.REJECTED) {
            rejectedAt = new Date();
        }

        return this.prismaService.$transaction(async (tx) => {
            if (newItems !== undefined) {
                await tx.quoteItem.deleteMany({ where: { quoteId: existing.id } });
            }

            return tx.quote.update({
                where: { id: existing.id },
                data: {
                    title: data.title,
                    description: data.description,
                    validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
                    status: data.status,
                    approvedAt,
                    rejectedAt,
                    subtotal: newSubtotal,
                    discount: newDiscount,
                    total: newTotal,
                    items: newItems !== undefined
                        ? { create: newItems }
                        : undefined,
                },
                select: this.getQuoteDetailSelect(),
            });
        });
    }

    private async updateQuoteStatus(
        companyId: string,
        quoteId: string,
        user: JwtPayload,
        status: QuoteStatus,
        extraData?: { approvedAt?: Date; rejectedAt?: Date },
    ) {
        await this.companiesService.ensureUserCanManageCompany(companyId, user.id);

        const quote = await this.prismaService.quote.findFirst({
            where: { id: quoteId, companyId },
            select: { id: true },
        });

        if (!quote) {
            throw new NotFoundException('Quote not found');
        }

        return this.prismaService.quote.update({
            where: { id: quote.id },
            data: { status, ...extraData },
            select: this.getQuoteDetailSelect(),
        });
    }

    async sendQuote(companyId: string, quoteId: string, user: JwtPayload) {
        return this.updateQuoteStatus(companyId, quoteId, user, QuoteStatus.SENT);
    }

    async approveQuote(companyId: string, quoteId: string, user: JwtPayload) {
        return this.updateQuoteStatus(companyId, quoteId, user, QuoteStatus.APPROVED, {
            approvedAt: new Date(),
        });
    }

    async rejectQuote(companyId: string, quoteId: string, user: JwtPayload) {
        return this.updateQuoteStatus(companyId, quoteId, user, QuoteStatus.REJECTED, {
            rejectedAt: new Date(),
        });
    }

    async cancelQuote(companyId: string, quoteId: string, user: JwtPayload) {
        return this.updateQuoteStatus(companyId, quoteId, user, QuoteStatus.CANCELED);
    }
}
