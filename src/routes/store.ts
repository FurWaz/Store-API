import { prisma } from 'index.ts';
import express from 'express';
import Joi from 'joi';
import { respond, respondError } from 'tools/Responses.ts';
import * as controller from '../controllers/store.ts';
import { Product } from 'models/Product.ts';
import { getPaginationResult, getRequestPagination } from 'tools/Pagination.ts';
import { verifyAdmin } from 'middleware/verifyAdmin.ts';
import { auth } from 'middleware/auth.ts';
const router = express.Router();

// Create a store product
router.post('/products', auth, verifyAdmin, async (req, res) => {
    /**
     * #swagger.tags = ['Store']
     * #swagger.description = 'Create a store product'
     * #swagger.operationId = 'createStoreProduct'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
        appId: Joi.number().optional()
    });
    const { error } = schema.validate(req.body);
    if (error) return respondError(res, error);

    const { name, description, price, appId } = req.body;

    try {
        const product = await controller.addProduct(name, description, price, appId);
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
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    try {
        const pag = getRequestPagination(req);
        const products = await controller.getProducts(pag);
        const pagination = await getPaginationResult(pag, async () => await prisma.product.count());
        respond(res, Product.MESSAGES.FETCHED(), { products, pagination });
    } catch (err) { respondError(res, err); }
});

export default router;