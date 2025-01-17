import HTTPError from "errors/HTTPError.ts";
import { prisma } from "index.ts";
import { Category, PrivateCategory, PublicCategory } from "models/Category.ts";
import { PrivateProduct, Product, PublicProduct } from "models/Product.ts";
import { PaginationInfos, getPrismaPagination } from "tools/Pagination.ts";
import { PublicType, Type, Types } from "models/Type.ts";
import Lang from "tools/Lang.ts";
import { findBestTranslation, findBestTranslationAsync } from "tools/Translation.ts";

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

type TranslatedText = { [key: string]: string };

export async function addProduct(titles: TranslatedText, descriptions: TranslatedText, price: number, categoryId: number, typeId: number, image: string): Promise<PrivateProduct> {
    // check if category exists
    const category = await prisma.productCategory.findUnique({ where: { id: categoryId } });
    if (!category) throw new HTTPError(
        Category.MESSAGES.NOT_FOUND().status,
        Category.MESSAGES.NOT_FOUND().message
    )

    // check if type exists
    const type = await prisma.productType.findUnique({ where: { id: typeId } });
    if (!type) throw new HTTPError(
        Type.MESSAGES.NOT_FOUND().status,
        Type.MESSAGES.NOT_FOUND().message
    );

    const product = Product.makePrivate(await prisma.product.create({
        data: {
            price,
            categoryId,
            typeId,
            image
        },
        include: Product.privateIncludes
    }));

    // Add all titles and descriptions
    const titleLangs = Object.keys(titles);
    const descriptionLangs = Object.keys(descriptions);

    for (const lang of titleLangs) {
        await prisma.productTitle.create({
            data: {
                language: lang,
                text: titles[lang],
                productId: product.id
            }
        });
    }
    for (const lang of descriptionLangs) {
        await prisma.productDescription.create({
            data: {
                language: lang,
                text: descriptions[lang],
                productId: product.id
            }
        });
    }
    
    const title = findBestTranslation<string>(lang => titleLangs.includes(lang) ? titles[lang] : null);
    const description = findBestTranslation<string>(lang => descriptionLangs.includes(lang) ? descriptions[lang] : null);

    return Product.makePrivate({ ...product, title, description });
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
    return products.map((product) => {
        const title = findBestTranslation<string>(lang => product.titles.find((obj: any) => obj.language === lang)?.text ?? null) ?? '';
        const description = findBestTranslation<string>(lang => product.descriptions.find((obj: any) => obj.language === lang)?.text ?? null) ?? '';
        return Product.makePublic({ ...product, title, description });
    });
}

export async function getProduct(id: number): Promise<PublicProduct> {
    const product = await prisma.product.findUnique({ where: { id }, include: Product.publicIncludes });
    if (!product) throw new HTTPError(
        Product.MESSAGES.NOT_FOUND().status,
        Product.MESSAGES.NOT_FOUND().message
    );

    const title = findBestTranslation<string>(lang => product.titles.find((obj: any) => obj.language === lang)?.text ?? null) ?? '';
    const description = findBestTranslation<string>(lang => product.descriptions.find((obj: any) => obj.language === lang)?.text ?? null) ?? '';

    return Product.makePublic({ ...product, title, description });
}

export async function getTypes(): Promise<PublicType[]> {
    return (await prisma.productType.findMany()).map(Type.makePublic);
}
