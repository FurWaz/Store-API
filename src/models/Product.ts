import Lang from "tools/Lang.ts";
import { buildResourceMessages } from "tools/Model.ts";

export interface PrivateProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    app: number;
    appId: number;
    usersCartProducts: number[];
    usersProducts: number[];
}

export interface PublicProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    app: number;
    appId: number;
}

export class Product {
    public static privateIncludes = {
        usersCartProducts: true,
        usersProducts: true,
        checkouts: true
    };
    public static publicIncludes = {
        
    };

    public static MESSAGES = {
        ...buildResourceMessages(Lang.GetText(
            Lang.CreateTranslationContext('models', 'Product')
        ))
    };

    public static makePublic(obj: any): PublicProduct {
        if (!obj) return obj;

        return {
            id: obj.id,
            name: obj.name,
            description: obj.description,
            price: obj.price,
            app: typeof(obj.app) === 'number'? obj.app : obj.app?.id,
            appId: obj.appId
        };
    }

    public static makePrivate(obj: any): PrivateProduct {
        if (!obj) return obj;

        return {
            id: obj.id,
            name: obj.name,
            description: obj.description,
            price: obj.price,
            app: typeof(obj.app) === 'number'? obj.app : obj.app?.id,
            appId: obj.appId,
            usersCartProducts: obj.usersCartProducts?.map((c: any) => (typeof(c) === 'object')? c.id: c) as number[] || [],
            usersProducts: obj.usersProducts?.map((p: any) => (typeof(p) === 'object')? p.id: p) as number[] || []
        };
    }
}
