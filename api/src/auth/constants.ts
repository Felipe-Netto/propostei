import type { StringValue } from 'ms';

export const JWT_CONSTANTS = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN as StringValue,
};