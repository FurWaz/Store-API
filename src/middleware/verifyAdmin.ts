import { type Request, type Response, type NextFunction } from 'express';
import HTTPError from 'errors/HTTPError.ts';
import { respondError } from 'tools/Responses.ts';
import { prisma } from 'index.ts';
import Config from 'tools/Config.ts';

/**
 * admin middleware, verifies that the user is an admin (note : should be after auth middleware)
 * @param {Request} req The request object
 * @param {Response} res The response object
 * @param {NextFunction} next The next function
 */
export async function verifyAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = res.locals.token.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            console.debug("Rejecting admin request : user not found")
            throw HTTPError.Unauthorized();
        }

        fetch(`https://${Config.mainAPIHost}/users/${user.furwazId}`).then(async (res) => {
            const json: any = await res.json();
            if (json.error) {
                console.debug("Rejecting admin request : user not found in furwaz")
                throw HTTPError.Unauthorized();
            }

            console.log("User roles : ", json.roles)

            if (!json.roles.includes(1)) { // admin role
                console.debug("Rejecting admin request : user is not an admin")
                throw HTTPError.Forbidden();
            }

            next();
        });
    } catch (err) {
        respondError(res, err);
        return;
    }
}
