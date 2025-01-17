import HTTPError from "errors/HTTPError.ts";
import { prisma } from "index.ts";
import { Category, PrivateCategory, PublicCategory } from "models/Category.ts";
import { PrivateProduct, Product, PublicProduct } from "models/Product.ts";
import { PaginationInfos, getPrismaPagination } from "tools/Pagination.ts";
import { PublicType, Type, Types } from "models/Type.ts";

export async function addCategory(name: string, furwazId: number): Promise<PrivateCategory> {
    const category = Category.makePrivate(await prisma.productCategory.create({
        data: {
            name,
            furwazId
        }
    }));
    return category;
}

export async function removeCategory(id: number): Promise<boolean> {
    return (await prisma.productCategory.delete({ where: { id } })) !== null;
}

export async function getCategories(paginationInfos: PaginationInfos): Promise<PublicCategory[]> {
    const categories = await prisma.productCategory.findMany({
        ...getPrismaPagination(paginationInfos),
        include: Category.publicIncludes
    });
    return categories.map(Category.makePublic);
}


export async function addProduct(title: string, description: string, price: number, categoryId: number, typeId: number, image: string): Promise<PrivateProduct> {
    // check if category exists
    const category = await prisma.productCategory.findUnique({ where: { id: categoryId } });
    if (!category) throw new HTTPError(
        Category.MESSAGES.NOT_FOUND().status,
        Category.MESSAGES.NOT_FOUND().message
    )

    const product = Product.makePrivate(await prisma.product.create({
        data: {
            title,
            description,
            price,
            categoryId,
            typeId,
            image
        },
        include: Product.privateIncludes
    }));
    return product;
}

export async function removeProduct(id: number): Promise<boolean> {
    return (await prisma.product.delete({ where: { id } })) !== null;
}

export async function getProducts(paginationInfos: PaginationInfos, categoryId: number|undefined, order: string|undefined): Promise<PublicProduct[]> {
    const products = await prisma.product.findMany({
        ...getPrismaPagination(paginationInfos),
        include: Product.publicIncludes,
        where: categoryId ? { categoryId } : undefined,
        orderBy: order ? { [order.replace('!', '')]: order.charAt(0)==='!'? 'desc' : 'asc' } : undefined
    });
    return products.map(Product.makePublic);
}

export async function getProduct(id: number): Promise<PublicProduct> {
    return Product.makePublic(await prisma.product.findUnique({ where: { id } }));
}

export async function getTypes(): Promise<PublicType[]> {
    return (await prisma.productType.findMany()).map(Type.makePublic);
}
