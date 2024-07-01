import express from 'express';
import { User } from 'models/User.ts';
import { respond } from 'tools/Responses.ts';
const router = express.Router();

// Delete my user
router.delete('/', async (req, res) => {
    /**
     * #swagger.tags = ['Users']
     * #swagger.description = 'Delete a user account'
     * #swagger.operationId = 'deleteUser'
     */

    // TODO : Implement (note : should be able to ask delete from main api)
    respond(res, User.MESSAGES.DELETED);
});

// Delete my user profile
router.delete('/profile', async (req, res) => {
    /**
     * #swagger.tags = ['Users']
     * #swagger.description = 'Delete my user profile'
     * #swagger.operationId = 'deleteUserProfile'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */

    // TODO : Implement
    respond(res, User.MESSAGES.DELETED);
});

export default router;