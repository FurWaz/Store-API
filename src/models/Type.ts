import { prisma } from "index.ts";
import Lang from "tools/Lang.ts";
import { buildResourceMessages } from "tools/Model.ts";

export interface PrivateType {
    id: number;
    name: string;
}

export interface PublicType {
    id: number;
    name: string;
}

export class Type {
    public static privateIncludes = {
        
    };
    public static publicIncludes = {
        
    };

    public static MESSAGES = {
        ...buildResourceMessages(Lang.GetText(
            Lang.CreateTranslationContext('models', 'Type')
        ))
    };

    public static makePublic(obj: any): PublicType {
        if (!obj) return obj;

        return {
            id: obj.id,
            name: obj.name
        };
    }

    public static makePrivate(obj: any): PrivateType {
        if (!obj) return obj;

        return {
            id: obj.id,
            name: obj.name
        };
    }

    id?: number = undefined;
    name: string;
    listeners: any[] = [];

    constructor(name: string) {
        this.name = name;

        this.loadType();
    }

    private async loadType() {
        try {
            const type = await prisma.productType.findFirst({ where: { name: this.name } })
                ?? await prisma.productType.create({ data: { name: this.name } });
            this.id = type.id;
            this.listeners.forEach(l => l(this));
        } catch (err) {
            console.error("Error : Cannot load product type " + this.name + "\n" + err);
        }
    }

    public async get() {
        return new Promise<Type>((resolve) => {
            if (this.id !== undefined) resolve(this);
            else this.listeners.push(resolve);
        });
    }
}

export const Types = {
    PHYSICAL: new Type('physical'),
    SOFTWARE: new Type('software'),
    SERVICE: new Type('service'),
    SUBSCRIPTION: new Type('subscription'),
}