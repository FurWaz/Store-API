import Lang from "tools/Lang.ts";
import { buildResourceMessages } from "tools/Model.ts";

export interface PrivateCategory {
    id: number;
    name: string;
    furwazId: number;
}

export interface PublicCategory {
    id: number;
    name: string;
    furwazId: number;
}

export class Category {
    public static privateIncludes = {
        
    };
    public static publicIncludes = {
        
    };

    public static MESSAGES = {
        ...buildResourceMessages(Lang.GetText(
            Lang.CreateTranslationContext('models', 'Category')
        ))
    };

    public static makePublic(obj: any): PublicCategory {
        if (!obj) return obj;

        return {
            id: obj.id,
            name: obj.name,
            furwazId: obj.furwazId
        };
    }

    public static makePrivate(obj: any): PrivateCategory {
        if (!obj) return obj;

        return {
            id: obj.id,
            name: obj.name,
            furwazId: obj.furwazId
        };
    }
}
