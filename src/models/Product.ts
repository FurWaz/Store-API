import Lang from "tools/Lang.ts";
import { buildResourceMessages } from "tools/Model.ts";

export interface PrivateProduct {
    id: number;
    title: string;
    description: string;
    price: number;
    category: number;
    categoryId: number;
    type: string;
    typeId: number;
    available?: boolean;
    image: string;
    usersCartProducts: number[];
    usersProducts: number[];
}

export interface PublicProduct {
    id: number;
    title: string;
    description: string;
    price: number;
    category: string;
    categoryId: number;
    type: string;
    typeId: number;
    available?: boolean;
    image: string;
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
            title: obj.title,
            description: obj.description,
            price: obj.price,
            category: typeof(obj.category) === 'string'? obj.category : obj.category?.name,
            categoryId: obj.categoryId || obj.category?.id,
            type: typeof(obj.type) === 'string'? obj.type : obj.type?.name,
            typeId: obj.typeId || obj.type?.id,
            image: obj.image,
            available: obj.available
        };
    }

    public static makePrivate(obj: any): PrivateProduct {
        if (!obj) return obj;

        return {
            id: obj.id,
            title: obj.title,
            description: obj.description,
            price: obj.price,
            category: typeof(obj.category) === 'string'? obj.category : obj.category?.name,
            categoryId: obj.categoryId || obj.category?.id,
            type: typeof(obj.type) === 'string'? obj.type : obj.type?.name,
            typeId: obj.typeId || obj.type?.id,
            image: obj.image,
            available: obj.available,
            usersCartProducts: obj.usersCartProducts?.map((c: any) => (typeof(c) === 'object')? c.id: c) as number[] || [],
            usersProducts: obj.usersProducts?.map((p: any) => (typeof(p) === 'object')? p.id: p) as number[] || []
        };
    }
}
