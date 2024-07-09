import Lang from "tools/Lang.ts";
import { buildResourceMessages } from "tools/Model.ts";

export interface PrivateUser {
    id: number;
    furwazId: number;
    products: number[];
    cart: number[];
    checkouts: number[];
}

export class User {
    public static privateIncludes = {
        cartProducts: true,
        userProducts: true
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
            products: obj.userProducts?.map((p: any) => (typeof(p) === 'object')? p.id: p) as number[] || [],
            cart: obj.cartProducts?.map((p: any) => (typeof(p) === 'object')? p.id: p) as number[] || [],
            checkouts: obj.checkouts?.map((c: any) => (typeof(c) === 'object')? c.id: c) as number[] || []
        } as PrivateUser;
    }
}
