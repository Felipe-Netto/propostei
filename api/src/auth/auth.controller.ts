import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto, SignupDto } from './dtos/auth';
import type { JwtPayload } from './types/jwt-payload';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signup(@Body() body: SignupDto) {
        return await this.authService.signup(body);
    }

    @Post('login')
    async login(@Body() body: LoginDto) {
        return await this.authService.login(body);
    }

    @UseGuards(AuthGuard)
    @Get('me')
    async me(@CurrentUser() user: JwtPayload) {
        return user;
    }
}