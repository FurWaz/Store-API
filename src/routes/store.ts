import { prisma } from 'index.ts';
import express from 'express';
import Joi from 'joi';
import { respond, respondError } from 'tools/Responses.ts';
import * as controller from '../controllers/store.ts';
import { Product } from 'models/Product.ts';
import { getPaginationResult, getRequestPagination } from 'tools/Pagination.ts';
import { verifyAdmin } from 'middleware/verifyAdmin.ts';
import { auth } from 'middleware/auth.ts';
import { Category } from 'models/Category.ts';
import { Type } from 'models/Type.ts';
import { translatedTextSchema } from 'tools/Translation.ts';
const router = express.Router();

// Create a category
router.post('/categories', auth, verifyAdmin, async (req, res) => {
    /**
     * #swagger.tags = ['Store']
     * #swagger.description = 'Create a category'
     * #swagger.operationId = 'createCategory'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const schema = Joi.object({
        name: Joi.string().required(),
        furwazId: Joi.number().required()
    });
    const { error } = schema.validate(req.body);
    if (error) return respondError(res, error);

    const { name, furwazId } = req.body;

    try {
        const category = await controller.addCategory(name, furwazId);
        respond(res, Category.MESSAGES.CREATED(), { category });
    } catch (err) { respondError(res, err); }
});

// Get all categories
router.get('/categories', async (req, res) => {
    /**
     * #swagger.tags = ['Store']
     * #swagger.description = 'Get all categories'
     * #swagger.operationId = 'getCategories'
     */
    const schema = Joi.object({
        page: Joi.number().optional(),
        limit: Joi.number().optional()
    });
    const { error } = schema.validate(req.query);
    if (error) return respondError(res, error);

    try {
        const pag = getRequestPagination(req);
        const categories = await controller.getCategories(pag);
        const pagination = await getPaginationResult(pag, async () => await prisma.productCategory.count());
        respond(res, Category.MESSAGES.FETCHED(), { categories, pagination });
    } catch (err) { respondError(res, err); }
});

// Remove a category
router.delete('/categories/:id', auth, verifyAdmin, async (req, res) => {
    /**
     * #swagger.tags = ['Store']
     * #swagger.description = 'Remove a category'
     * #swagger.operationId = 'removeCategory'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const schema = Joi.object({
        id: Joi.number().required()
    });
    const { error } = schema.validate(req.params);
    if (error) return respondError(res, error);

    const { id } = req.params;

    try {
        const removed = await controller.removeCategory(parseInt(id));
        if (!removed) return respondError(res, Product.MESSAGES.NOT_FOUND());
        respond(res, Category.MESSAGES.DELETED());
    } catch (err) { respondError(res, err); }
});

// Create a store product
router.post('/products', auth, verifyAdmin, async (req, res) => {
    /**
     * #swagger.tags = ['Store']
     * #swagger.description = 'Create a store product'
     * #swagger.operationId = 'createStoreProduct'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const schema = Joi.object({
        titles: translatedTextSchema.required(),
        descriptions: translatedTextSchema.required(),
        price: Joi.number().required(),
        categoryId: Joi.number().required(),
        typeId: Joi.number().required(),
        image: Joi.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error) return respondError(res, error);

    const { titles, descriptions, price, categoryId, typeId, image } = req.body;

    try {
        const product = await controller.addProduct(titles, descriptions, price, categoryId, typeId, image);
        respond(res, Product.MESSAGES.CREATED(), { product });
    } catch (err) { respondError(res, err); }
});

// Remove a store product
router.delete('/products/:id', auth, verifyAdmin, async (req, res) => {
    /**
     * #swagger.tags = ['Store']
     * #swagger.description = 'Remove a store product'
     * #swagger.operationId = 'removeStoreProduct'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const schema = Joi.object({
        id: Joi.number().required()
    });
    const { error } = schema.validate(req.params);
    if (error) return respondError(res, error);

    const { id } = req.params;

    try {
        const removed = await controller.removeProduct(parseInt(id));
        if (!removed) return respondError(res, Product.MESSAGES.NOT_FOUND());
        respond(res, Product.MESSAGES.DELETED());
    } catch (err) { respondError(res, err); }
});

// Get all store products
router.get('/products', async (req, res) => {
    /**
     * #swagger.tags = ['Store']
     * #swagger.description = 'Get all store products'
     * #swagger.operationId = 'getStoreProducts'
     */
    const schema = Joi.object({
        page: Joi.number().optional(),
        limit: Joi.number().optional(),
        category: Joi.string().optional(),
        order: Joi.string().optional(),
    });
    const { error } = schema.validate(req.query);
    if (error) return respondError(res, error);

    try {
        const pag = getRequestPagination(req);
        const category = req.query.category ? parseInt(req.query.category as string) : undefined;
        const order = req.query.order ? req.query.order as string : undefined;
        const products = await controller.getProducts(pag, category, order);
        const pagination = await getPaginationResult(pag, async () => await prisma.product.count());
        respond(res, Product.MESSAGES.FETCHED(), { products, pagination });
    } catch (err) { respondError(res, err); }
});

// Get a store product
router.get('/products/:id', async (req, res) => {
    /**
     * #swagger.tags = ['Store']
     * #swagger.description = 'Get a store product'
     * #swagger.operationId = 'getStoreProduct'
     */
    const schema = Joi.object({
        id: Joi.number().required()
    });
    const { error } = schema.validate(req.params);
    if (error) return respondError(res, error);

    const { id } = req.params;

    try {
        const product = await controller.getProduct(parseInt(id));
        if (!product) return respondError(res, Product.MESSAGES.NOT_FOUND());
        respond(res, Product.MESSAGES.FETCHED(), { product });
    } catch (err) { respondError(res, err); }
});

// Get all store products types
router.get('/types', async (req, res) => {
    /**
     * #swagger.tags = ['Store']
     * #swagger.description = 'Get all store products types'
     * #swagger.operationId = 'getStoreProductsTypes'
     */
    try {
        const types = await controller.getTypes();
        respond(res, Type.MESSAGES.FETCHED(), { types });
    } catch (err) { respondError(res, err); }
});

export default router;