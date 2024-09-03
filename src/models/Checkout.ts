import Lang from "tools/Lang.ts";
import { buildResourceMessages } from "tools/Model.ts";
import { Product, PublicProduct } from "./Product.ts";

export interface PrivateCheckout {
    id: number;
    userId: number;
    intentId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    amount: number;
    products: PublicProduct[];
    status: string;
}

export class Checkout {
    public static MESSAGES = {
        ...buildResourceMessages(Lang.GetText(
            Lang.CreateTranslationContext('models', 'Checkout')
        ))
    };

    public static privateIncludes = {
        products: true,
        status: true
    };

    public static makePrivate(obj: any): PrivateCheckout {
        if (!obj) return obj;

        console.log(obj);

        return {
            id: obj.id,
            userId: obj.userId,
            intentId: obj.intentId,
            firstName: obj.firstName,
            lastName: obj.lastName,
            email: obj.email,
            phone: obj.phone,
            address: obj.address,
            city: obj.city,
            country: obj.country,
            postalCode: obj.postalCode,
            amount: obj.amount,
            products: obj.products?.map((p: any) => Product.makePublic(p)),
            status: obj.status
        };
    }
}
