import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, SignupDto } from './dtos/auth';

@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService, private readonly jwtService: JwtService) { }

    async signup(data: SignupDto) {
        const userAlreadyExists = await this.prismaService.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (userAlreadyExists) {
            throw new UnauthorizedException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const { password, ...userData } = data;

        const user = await this.prismaService.user.create({
            data: {
                ...userData,
                passwordHash: hashedPassword
            }
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }

    async login(data: LoginDto) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);

        if (!passwordMatch) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const token = await this.jwtService.signAsync({
            id: user.id,
            name: user.name,
            email: user.email
        })

        return {
            token
        };
    }
}
