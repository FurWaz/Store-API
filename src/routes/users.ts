import express from 'express';
import { prisma } from 'index.ts';
import Joi from 'joi';
import { User } from 'models/User.ts';
import { respond, respondError } from 'tools/Responses.ts';
const router = express.Router();

// Get my user
router.get('/', async (req, res) => {
    /**
     * #swagger.tags = ['Users']
     * #swagger.description = 'Get my user account'
     * #swagger.operationId = 'getMyUser'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const userId = res.locals.token.id;
    try {
        const user = await prisma.user.findUnique({ where: { id: userId }, include: User.privateIncludes });
        if (!user) throw User.MESSAGES.NOT_FOUND();
        respond(res, User.MESSAGES.FETCHED(), User.makePrivate(user));
    } catch (err) { respondError(res, err); }
});

// Delete my user
router.delete('/', async (req, res) => {
    /**
     * #swagger.tags = ['Users']
     * #swagger.description = 'Delete a user account'
     * #swagger.operationId = 'deleteUser'
     */
    const userId = res.locals.token.id;
    try {
        const deleted = await prisma.user.delete({ where: { id: userId } });
        if (!deleted) throw User.MESSAGES.NOT_FOUND();
        respond(res, User.MESSAGES.DELETED(), deleted);
    } catch (err) { respondError(res, err); }
});

// Delete user informations
router.delete('/infos', async (req, res) => {
    /**
     * #swagger.tags = ['Users']
     * #swagger.description = 'Delete user informations'
     * #swagger.operationId = 'deleteUserInfos'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const userId = res.locals.token.id;
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: null,
                lastName: null,
                email: null,
                phone: null,
                address: null,
                city: null,
                postalCode: null,
                country: null
            }
        });
        respond(res, User.MESSAGES.UPDATED(), User.makePrivate(user));
    } catch (err) { respondError(res, err); }
});

// Update user informations
router.patch('/infos', async (req, res) => {
    /**
     * #swagger.tags = ['Users']
     * #swagger.description = 'Update user informations'
     * #swagger.operationId = 'updateUserInfos'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const userId = res.locals.token.id;
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        postalCode: Joi.string().required(),
        country: Joi.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error) return respondError(res, error);

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: req.body
        });
        respond(res, User.MESSAGES.UPDATED(), User.makePrivate(user));
    } catch (err) { respondError(res, err); }
});

export default router;