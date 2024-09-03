import { prisma } from 'index.ts';
import express from 'express';
import Joi from 'joi';
import * as controller from '../controllers/userProducts.ts';
import { respondError, respond } from 'tools/Responses.ts';
import { getPaginationResult, getRequestPagination } from 'tools/Pagination.ts';
import { UserProduct } from 'models/UserProduct.ts';
const router = express.Router();

// Get all user products
router.get('/', async (req, res) => {
    /**
     * #swagger.tags = ['UserProduct']
     * #swagger.description = 'Get all user products'
     * #swagger.operationId = 'getAllUserProducts'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    try {
        const userId = res.locals.token.id;
        const pag = getRequestPagination(req);
        const products = await controller.getUserProducts(userId, pag);
        const pagination = await getPaginationResult(pag, async () => await prisma.userProduct.count({ where: { userId } }));
        respond(res, UserProduct.MESSAGES.FETCHED(), { products, pagination });
    } catch (err) {
        respondError(res, err);
        return;
    }
});

// Add a user product
// NOTE : No adding route, because adding a user product is done through the checkout validation
// See src/routes/checkout.ts

// Get a user product
router.get('/:productId', async (req, res) => {
    /**
     * #swagger.tags = ['UserProduct']
     * #swagger.description = 'Get a user product'
     * #swagger.operationId = 'getUserProduct'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const schema = Joi.object({
        id: Joi.number().required()
    });
    const { error } = schema.validate(req.params);
    if (error) return respondError(res, error);

    const productId = parseInt(req.params.productId);
    const userId = res.locals.token.id;

    try {
        const product = await controller.getUserProduct(userId, productId);
        if (!product) return respondError(res, UserProduct.MESSAGES.NOT_FOUND());
        respond(res, UserProduct.MESSAGES.FETCHED(), product);
    } catch (err) {
        respondError(res, err);
        return;
    }
});

// Update a user product
router.patch('/:productId', async (req, res) => {
    /**
     * #swagger.tags = ['UserProduct']
     * #swagger.description = 'Update a user product'
     * #swagger.operationId = 'updateUserProduct'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const schema = Joi.object({
        productId: Joi.number().required(),
        quantity: Joi.number().min(1).required()
    });
    const { error } = schema.validate({ ...req.params, ...req.body });
    if (error) return respondError(res, error);

    const { quantity } = req.body;
    const productId = parseInt(req.params.productId);
    const userId = res.locals.token.id;

    try {
        const product = await controller.setUserProductQuantity(userId, productId, quantity);
        if (!product) return respondError(res, UserProduct.MESSAGES.NOT_FOUND());
        respond(res, UserProduct.MESSAGES.UPDATED(), product);
    } catch (err) {
        respondError(res, err);
        return;
    }
});

// Delete a user product
router.delete('/:productId', async (req, res) => {
    /**
     * #swagger.tags = ['UserProduct']
     * #swagger.description = 'Delete a user product'
     * #swagger.operationId = 'deleteUserProduct'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const schema = Joi.object({
        productId: Joi.number().required()
    });
    const { error } = schema.validate(req.params);
    if (error) return respondError(res, error);

    const productId = parseInt(req.params.productId);
    const userId = res.locals.token.id;

    try {
        // one at a time
        const removed = await controller.removeUserProduct(userId, productId);
        if (!removed) return respondError(res, UserProduct.MESSAGES.NOT_FOUND());
        respond(res, UserProduct.MESSAGES.DELETED());
    } catch (err) {
        respondError(res, err);
        return;
    }
});

export default router;
