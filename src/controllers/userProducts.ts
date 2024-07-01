import { prisma } from "index.ts";
import { PrivateUserProduct, UserProduct } from "models/UserProduct.ts";
import { PaginationInfos, getPrismaPagination } from "tools/Pagination.ts";

export async function addUserProduct(userId: number, productId: number, quantity: number = 1): Promise<PrivateUserProduct> {
    const existingUserProduct = await prisma.userProduct.findUnique({
        where: { userId_productId: { userId, productId } }
    });
    if (existingUserProduct !== null) {
        return UserProduct.makePrivate(await prisma.userProduct.update({
            where: { userId_productId: { userId, productId } },
            data: { quantity: existingUserProduct.quantity + quantity },
            include: UserProduct.privateIncludes
        }));
    }
    return UserProduct.makePrivate(await prisma.userProduct.create({
        data: { userId, productId, quantity: 1 },
        include: UserProduct.privateIncludes
    }));
}

export async function removeUserProduct(userId: number, productId: number, quantity: number = 1): Promise<PrivateUserProduct|null> {
    const existingUserProduct = await prisma.userProduct.findUnique({
        where: { userId_productId: { userId, productId } }
    });
    if (existingUserProduct === null) return null;
    if (existingUserProduct.quantity > 1) {
        return UserProduct.makePrivate(await prisma.userProduct.update({
            where: { userId_productId: { userId, productId } },
            data: { quantity: existingUserProduct.quantity - quantity }
        }))
    }
    await prisma.userProduct.delete({ where: { userId_productId: { userId, productId } } });
    return null;
}

export async function setUserProductQuantity(userId: number, productId: number, quantity: number): Promise<PrivateUserProduct|null> {
    if (quantity <= 0) return null;
    const existingUserProduct = await prisma.userProduct.findUnique({
        where: { userId_productId: { userId, productId } }
    });
    if (existingUserProduct === null) return null;
    return UserProduct.makePrivate(await prisma.userProduct.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity }
    }));
}

export async function removeAllUserProduct(userId: number, productId: number): Promise<boolean> {
    return (await prisma.userProduct.delete({ where: { userId_productId: { userId, productId } } })) !== null;
}

export async function removeAllUserProducts(userId: number): Promise<boolean> {
    return (await prisma.userProduct.deleteMany({ where: { userId } })).count > 0;
}

export async function getUserProducts(userId: number, paginationInfos: PaginationInfos): Promise<PrivateUserProduct[]> {
    const products = await prisma.userProduct.findMany({
        where: { userId },
        ...getPrismaPagination(paginationInfos),
        include: UserProduct.privateIncludes
    });
    return products.map(UserProduct.makePrivate);
}

export async function getUserProduct(userId: number, productId: number): Promise<PrivateUserProduct|null> {
    const product = await prisma.userProduct.findUnique({
        where: { userId_productId: { userId, productId } },
        include: UserProduct.privateIncludes
    });
    if (product === null) return null;
    return UserProduct.makePrivate(product);
}
