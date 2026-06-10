import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dtos/auth';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}
    
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
    async me(@Request() request) {
        return request.user;
    }
}