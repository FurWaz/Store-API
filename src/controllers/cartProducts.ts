import { prisma } from "index.ts";
import { PrivateCartProduct, CartProduct } from "models/CartProduct.ts";
import { PaginationInfos, getPrismaPagination } from "tools/Pagination.ts";
import { findBestTranslation } from "tools/Translation.ts";

export async function addCartProduct(userId: number, productId: number, quantity: number = 1): Promise<PrivateCartProduct> {
    const existingCartProduct = await prisma.cartProduct.findUnique({
        where: { userId_productId: { userId, productId } }
    });
    if (existingCartProduct !== null) {
        return CartProduct.makePrivate(await prisma.cartProduct.update({
            where: { userId_productId: { userId, productId } },
            data: { quantity: existingCartProduct.quantity + quantity },
            include: CartProduct.privateIncludes
        }));
    }
    return CartProduct.makePrivate(await prisma.cartProduct.create({
        data: { userId, productId, quantity: 1 },
        include: CartProduct.privateIncludes
    }));
}

export async function removeCartProduct(userId: number, productId: number) {
    return await prisma.cartProduct.delete({ where: { userId_productId: { userId, productId } } });
}

export async function setCartProductQuantity(userId: number, productId: number, quantity: number): Promise<PrivateCartProduct|null> {
    if (quantity <= 0) return null;
    const existingCartProduct = await prisma.cartProduct.findUnique({
        where: { userId_productId: { userId, productId } }
    });
    if (existingCartProduct === null) return null;
    return CartProduct.makePrivate(await prisma.cartProduct.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity }
    }));
}

export async function removeAllCartProduct(userId: number, productId: number): Promise<boolean> {
    return (await prisma.cartProduct.delete({ where: { userId_productId: { userId, productId } } })) !== null;
}

export async function removeAllCartProducts(userId: number): Promise<boolean> {
    return (await prisma.cartProduct.deleteMany({ where: { userId } })).count > 0;
}

export async function getCartProducts(userId: number, paginationInfos: PaginationInfos): Promise<PrivateCartProduct[]> {
    const products = await prisma.cartProduct.findMany({
        where: { userId },
        ...getPrismaPagination(paginationInfos),
        include: CartProduct.privateIncludes
    });
    return products.map((product) => {
        const title = findBestTranslation<string>(lang => product.product.titles.find((obj: any) => obj.language === lang)?.text ?? null) ?? '';
        const description = findBestTranslation<string>(lang => product.product.descriptions.find((obj: any) => obj.language === lang)?.text ?? null) ?? '';
        return CartProduct.makePrivate({ ...product, product: { ...product.product, title, description } });
    });
}

export async function getCartProduct(userId: number, productId: number): Promise<PrivateCartProduct|null> {
    const product = await prisma.cartProduct.findUnique({
        where: { userId_productId: { userId, productId } },
        include: CartProduct.privateIncludes
    });
    if (product === null) return null;

    const title = findBestTranslation<string>(lang => product.product.titles.find((obj: any) => obj.language === lang)?.text ?? null) ?? '';
    const description = findBestTranslation<string>(lang => product.product.descriptions.find((obj: any) => obj.language === lang)?.text ?? null) ?? '';
    return CartProduct.makePrivate({ ...product, product: { ...product.product, title, description } });
}
