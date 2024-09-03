import express from 'express';
import { prisma } from 'index.ts';
import { getPaginationResult, getRequestPagination } from 'tools/Pagination.ts';
import { respond, respondError } from 'tools/Responses.ts';
import * as controller from '../controllers/cartProducts.ts';
import { CartProduct } from 'models/CartProduct.ts';
import Joi from 'joi';

const router = express.Router();

// Get all user cart products 
router.get('/', async (req, res) => {
    /**
     * #swagger.tags = ['Cart']
     * #swagger.description = 'Get all user cart products'
     * #swagger.operationId = 'getCartProducts'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    try {
        const userId = res.locals.token.id;
        const pag = getRequestPagination(req);
        const products = await controller.getCartProducts(userId, pag);
        const pagination = await getPaginationResult(pag, async () => await prisma.cartProduct.count({ where: { userId } }));
        respond(res, CartProduct.MESSAGES.FETCHED(), { products, pagination });
    } catch (err) {
        respondError(res, err);
        return;
    }
});

// Remove all user cart products
router.delete('/', async (req, res) => {
    /**
     * #swagger.tags = ['Cart']
     * #swagger.description = 'Remove all user cart products'
     * #swagger.operationId = 'removeCartProducts'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    try {
        const userId = res.locals.token.id;
        const removed = await controller.removeAllCartProducts(userId);
        if (!removed) return respondError(res, CartProduct.MESSAGES.NOT_FOUND());
        respond(res, CartProduct.MESSAGES.DELETED());
    } catch (err) {
        respondError(res, err);
        return;
    }
});

// Get a user cart product
router.get('/:productId', async (req, res) => {
    /**
     * #swagger.tags = ['Cart']
     * #swagger.description = 'Get a user cart product'
     * #swagger.operationId = 'getCartProduct'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const schema = Joi.object({
        productId: Joi.number().required()
    });
    const { error } = schema.validate(req.params);
    if (error) return respondError(res, error);

    try {
        const userId = res.locals.token.id;
        const productId = parseInt(req.params.productId);
        const product = await controller.getCartProduct(userId, productId);
        if (!product) return respondError(res, CartProduct.MESSAGES.NOT_FOUND());
        respond(res, CartProduct.MESSAGES.FETCHED(), CartProduct);
    } catch (err) {
        respondError(res, err);
        return;
    }
});

// Add a user cart product
router.post('/:productId', async (req, res) => {
    /**
     * #swagger.tags = ['Cart']
     * #swagger.description = 'Add a user cart product'
     * #swagger.operationId = 'addCartProduct'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const schema = Joi.object({
        productId: Joi.number().required(),
        quantity: Joi.number().min(1).optional()
    });
    const { error } = schema.validate({...req.params, ...req.body});
    if (error) return respondError(res, error);

    try {
        const userId = res.locals.token.id;
        const productId = parseInt(req.params.productId);
        const quantity = req.body.quantity;

        const product = await controller.addCartProduct(userId, productId, quantity);
        if (!product) return respondError(res, CartProduct.MESSAGES.NOT_FOUND());
        respond(res, CartProduct.MESSAGES.FETCHED(), product);
    } catch (err) {
        respondError(res, err);
        return;
    }
});

// Update a user cart product
router.patch('/:productId', async (req, res) => {
    /**
     * #swagger.tags = ['Cart']
     * #swagger.description = 'Update a user cart product'
     * #swagger.operationId = 'updateCartProduct'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const schema = Joi.object({
        productId: Joi.number().required(),
        quantity: Joi.number().min(1).required()
    });
    const { error } = schema.validate({...req.params, ...req.body});
    if (error) return respondError(res, error);

    try {
        const userId = res.locals.token.id;
        const productId = parseInt(req.params.productId);
        const quantity = req.body.quantity;
        const product = await controller.setCartProductQuantity(userId, productId, quantity);
        if (!product) return respondError(res, CartProduct.MESSAGES.NOT_FOUND());
        respond(res, CartProduct.MESSAGES.UPDATED(), product);
    } catch (err) {
        respondError(res, err);
        return;
    }
});

// Delete a user cart product
router.delete('/:productId', async (req, res) => {
    /**
     * #swagger.tags = ['Cart']
     * #swagger.description = 'Delete a user cart product'
     * #swagger.operationId = 'deleteUserProduct'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const schema = Joi.object({
        productId: Joi.number().required()
    });
    const { error } = schema.validate(req.params);
    if (error) return respondError(res, error);

    try {
        const userId = res.locals.token.id;
        const productId = parseInt(req.params.productId);
        const product = await controller.removeCartProduct(userId, productId);
        if (!product) return respondError(res, CartProduct.MESSAGES.NOT_FOUND());
        respond(res, CartProduct.MESSAGES.DELETED());
    } catch (err) {
        respondError(res, err);
        return;
    }
});

export default router;
