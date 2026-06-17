import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/types/jwt-payload';
import { DashboardService } from './dashboard.service';

@UseGuards(AuthGuard)
@Controller('companies/:companyId/dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get()
    async getDashboard(
        @Param('companyId') companyId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.dashboardService.getDashboard(companyId, user);
    }
}
