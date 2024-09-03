import Lang from "tools/Lang.ts";
import { buildResourceMessages } from "tools/Model.ts";

export interface PrivateUser {
    id: number;
    furwazId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
}

export class User {
    public static privateIncludes = {
        // nothing
    };

    public static MESSAGES = {
        ...buildResourceMessages(Lang.GetText(
            Lang.CreateTranslationContext('models', 'User')
        ))
    };

    public static makePrivate(obj: any): PrivateUser {
        if (!obj) return obj;

        return {
            id: obj.id as number,
            furwazId: obj.furwazId as number,
            firstName: obj.firstName as string,
            lastName: obj.lastName as string,
            email: obj.email as string,
            phone: obj.phone as string,
            address: obj.address as string,
            city: obj.city as string,
            postalCode: obj.postalCode as string,
            country: obj.country as string
        } as PrivateUser;
    }
}
