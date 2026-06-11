import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JWT_CONSTANTS } from './constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: JWT_CONSTANTS.secret,
            signOptions: { expiresIn: JWT_CONSTANTS.expiresIn }
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthGuard],
    exports: [AuthGuard]
})
export class AuthModule {}
