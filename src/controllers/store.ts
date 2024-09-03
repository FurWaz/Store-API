import { prisma } from "index.ts";
import { Product } from "models/Product.ts";
import { PaginationInfos, getPrismaPagination } from "tools/Pagination.ts";

export async function addProduct(name: string, description: string, price: number, appId: number|undefined = undefined): Promise<Product> {
    const product = Product.makePrivate(await prisma.product.create({
        data: {
            name,
            description,
            price,
            appId
        },
        include: Product.privateIncludes
    }));
    return product;
}

export async function removeProduct(id: number): Promise<boolean> {
    return (await prisma.product.delete({ where: { id } })) !== null;
}

export async function getProducts(paginationInfos: PaginationInfos): Promise<Product[]> {
    const products = await prisma.product.findMany({
        ...getPrismaPagination(paginationInfos),
        include: Product.publicIncludes
    });
    return products.map(Product.makePublic);
}
