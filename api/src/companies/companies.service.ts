import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dtos/companies';
import { JwtPayload } from 'src/auth/types/jwt-payload';

@Injectable()
export class CompaniesService {

    constructor(private readonly prismaService: PrismaService) { }

    async createCompany(data: CreateCompanyDto, user: JwtPayload) {
        return this.prismaService.$transaction(async (tx) => {
            // Lock the user row to avoid creating multiple free companies in concurrent requests.
            await tx.$executeRaw`SELECT id FROM "User" WHERE id = ${user.id} FOR UPDATE`;

            const freeCompanyOwned = await tx.company.findFirst({
                where: {
                    members: {
                        some: {
                            userId: user.id,
                            role: 'OWNER',
                        },
                    },
                    subscription: {
                        plan: 'FREE',
                        status: 'ACTIVE',
                    },
                },
                select: {
                    id: true,
                },
            });

            if (freeCompanyOwned) {
                throw new ForbiddenException('Usuários com plano grátis podem criar apenas uma empresa');
            }

            if (data.document) {
                const companyWithSameDocument = await tx.company.findFirst({
                    where: {
                        document: data.document,
                    },
                    select: {
                        id: true,
                    },
                });

                if (companyWithSameDocument) {
                    throw new ConflictException('Documento já registrado');
                }
            }

            return tx.company.create({
                data: {
                    ...data,
                    members: {
                        create: {
                            userId: user.id,
                            role: 'OWNER',
                        },
                    },
                    subscription: {
                        create: {
                            plan: 'FREE',
                            status: 'ACTIVE',
                        },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    subscription: {
                        select: {
                            plan: true,
                            status: true,
                        },
                    },
                },
            });
        });
    }

    async getCompanies(user: JwtPayload) {
        return await this.prismaService.company.findMany({
            where: {
                members: {
                    some: {
                        userId: user.id,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                members: {
                    select: {
                        role: true,
                    },
                },
                subscription: {
                    select: {
                        plan: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }

    async getCompany(id: string, user: JwtPayload) {
        const company = await this.prismaService.company.findFirst({
            where: {
                id: id,
                members: {
                    some: {
                        userId: user.id,
                    }
                }
            },
            select: {
                id: true,
                name: true,
                members: {
                    where: {
                        userId: user.id,
                    },
                    select: {
                        role: true,
                    },
                },
                subscription: {
                    select: {
                        plan: true,
                        status: true,
                    },
                },
            },
        })

        if (!company) {
            throw new NotFoundException('Empresa não encontrada');
        }

        return company;
    }

    async updateCompany(id: string, data: UpdateCompanyDto, user: JwtPayload) {
        const company = await this.getCompany(id, user);

        const role = company.members[0]?.role;

        if (role !== 'OWNER' && role !== 'ADMIN') {
            throw new ForbiddenException('Você não tem permissão para atualizar esta empresa');
        }

        try {
            if (data.document) {
                const existing = await this.prismaService.company.findFirst({
                    where: {
                        document: data.document,
                        NOT: {
                            id: company.id,
                        },
                    },
                    select: {
                        id: true,
                    },
                });

                if (existing) {
                    throw new ConflictException('Documento já registrado');
                }
            }

            return await this.prismaService.company.update({
                where: {
                    id: company.id,
                },
                data,
                select: {
                    id: true,
                    name: true,
                    document: true,
                    phone: true,
                    email: true,
                    address: true,
                    logoUrl: true,
                    subscription: {
                        select: {
                            plan: true,
                            status: true,
                        },
                    },
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Documento já registrado');
            }

            throw error;
        }
    }

}
