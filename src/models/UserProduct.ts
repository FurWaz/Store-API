import Lang from "tools/Lang.ts";
import { buildResourceMessages } from "tools/Model.ts";

export interface PrivateUserProduct {
    userId: number;
    productId: number;
    product: any;
    quantity: number;
}

export class UserProduct {
    public static privateIncludes = {
        product: true
    };

    public static MESSAGES = {
        ...buildResourceMessages(Lang.GetText(
            Lang.CreateTranslationContext('models', 'UserProduct')
        ))
    };

    public static makePrivate(obj: any): PrivateUserProduct {
        if (!obj) return obj;

        return {
            userId: obj.userId,
            productId: obj.productId,
            product: obj.product,
            quantity: obj.quantity
        };
    }
}
