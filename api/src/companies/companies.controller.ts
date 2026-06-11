import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dtos/companies';
import { AuthGuard } from 'src/auth/auth.guard';
import type { JwtPayload } from 'src/auth/types/jwt-payload';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@UseGuards(AuthGuard)
@Controller('companies')
export class CompaniesController {

    constructor(private readonly companiesService: CompaniesService) { }

    @Post()
    async createCompany(@Body() body: CreateCompanyDto, @CurrentUser() user: JwtPayload) {
        return await this.companiesService.createCompany(body, user);
    }

    @Get()
    async getCompanies(@CurrentUser() user: JwtPayload) {
        return await this.companiesService.getCompanies(user);
    }

    @Get(':id')
    async getCompany(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
        return await this.companiesService.getCompany(id, user);
    }

    @Patch(':id')
    async updateCompany(@Param('id') id: string, @Body() body: UpdateCompanyDto, @CurrentUser() user: JwtPayload) {
        return await this.companiesService.updateCompany(id, body, user);
    }

}
