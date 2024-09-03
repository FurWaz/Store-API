import { respondError, respond } from 'tools/Responses.ts';
import * as controller from '../controllers/auth.ts';
import { Token } from 'models/Token.ts';
import { Portal } from 'models/Portal.ts';
const router = express.Router();
import express from 'express';
import HTTPError from 'errors/HTTPError.ts';
import { TokenUtils } from 'tools/Token.ts';
import { generateToken, getUserInfos } from 'tools/Portal.ts'
import { PrivateUser } from 'models/User.ts';

router.post('/generate', async (req, res) => {
    /**
     * #swagger.tags = ['Authentication']
     * #swagger.description = 'Generated a FurWaz Portal token to log in'
     * #swagger.operationId = 'GeneratePortalToken'
     */
    try {
        const token = await generateToken();
        respond(res, Portal.MESSAGES.CREATED(), token);
    } catch (err) { respondError(res, err); }
});

router.get('/token', async (req, res) => {
    /**
     * #swagger.tags = ['Authentication']
     * #swagger.description = 'Refresh a user access token with its refresh token'
     * #swagger.operationId = 'refreshToken'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    try {
        const portalToken = req.query.portalToken as string;
        const authHeader = req.headers.authorization;
        if (!portalToken && !authHeader) throw HTTPError.BadRequest();

        if (portalToken) {
            const portalUserInfos = await getUserInfos(portalToken);
            const userInfos = await controller.getOrCreate(portalUserInfos.id);
            const token = await controller.createUserToken(userInfos);
            return respond(res, Token.MESSAGES.CREATED(), {token, user: userInfos});
        }

        if (!authHeader) throw HTTPError.Unauthorized();
    
        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer') throw HTTPError.Unauthorized();
    
        const data = await TokenUtils.decode(token);
        const newToken = await controller.createUserToken(data as PrivateUser);
        respond(res, Token.MESSAGES.CREATED(), newToken);
    } catch (err) { respondError(res, err); }
});

export default router;
