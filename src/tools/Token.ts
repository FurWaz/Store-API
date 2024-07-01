import jwt from "jsonwebtoken";
import Config from "./Config.ts";
import HTTPError from "errors/HTTPError.ts";
import HTTP from "./HTTP.ts";
import Lang from "./Lang.ts";

export interface TokenData {
    id: number;
    furwazId: number;
}

export class TokenUtils {
    private static invalidTokenContext = Lang.CreateTranslationContext('errors', 'InvalidToken');
    private static errUnauthorized = new HTTPError(HTTP.UNAUTHORIZED, Lang.GetText(this.invalidTokenContext));

    private static isValidData(data: TokenData): boolean {
        return data.id !== undefined && data.furwazId !== undefined;
    }

    static async encode(data: TokenData): Promise<string> {
        const payload: any = {
            id: data.id,
            furwazId: data.furwazId
        };
        return await this.encodePayload(payload);
    }

    static async decode(token: string): Promise<TokenData> {
        const data = await this.decodePayload(token) as TokenData;
        if (!this.isValidData(data))
            throw this.errUnauthorized;
        return data;
    }

    static async encodePayload(payload: object): Promise<string> {
        return new Promise((resolve, reject) => {
            const exp = Config.security.expiration;
            jwt.sign(
                payload,
                Config.security.jwtSecret,
                exp ? { expiresIn: exp } : {},
                (err, token) => {
                if (err) reject(err);
                else if (!token?.trim()) reject('Empty token');
                else resolve(token ?? '');
            });
        });
    }

    static async decodePayload(token: string): Promise<object> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, Config.security.jwtSecret, (err, decoded) => {
                if (err) reject(new HTTPError(HTTP.INVALID_TOKEN, Lang.GetText(this.invalidTokenContext)));
                else if (!decoded) reject(this.errUnauthorized);
                else resolve(decoded as object);
            });
        });
    }
}
