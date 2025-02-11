import Lang from "tools/Lang.ts";
import { buildResourceMessages } from "tools/Model.ts";
import { Product } from "./Product.ts";

export interface PrivateCartProduct {
    userId: number;
    productId: number;
    product: any;
    quantity: number;
}

export class CartProduct {
    public static privateIncludes = {
        product: {
            include: {
                titles: true,
                descriptions: true
            }
        }
    };

    public static MESSAGES = {
        ...buildResourceMessages(Lang.GetText(
            Lang.CreateTranslationContext('models', 'CartProduct')
        ))
    };

    public static makePrivate(obj: any): PrivateCartProduct {
        if (!obj) return obj;

        return {
            userId: obj.userId,
            productId: obj.productId,
            product: Product.makePublic(obj.product),
            quantity: obj.quantity
        };
    }
}
