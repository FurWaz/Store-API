import express from 'express';
import { prisma } from 'index.ts';
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


export default router;