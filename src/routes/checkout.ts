import express from 'express';
import * as controller from '../controllers/checkout.ts';
import { respond, respondError } from 'tools/Responses.ts';
import Lang from 'tools/Lang.ts';
import Joi from 'joi';
import { Checkout } from 'models/Checkout.ts';
import { auth } from 'middleware/auth.ts';
const router = express.Router();

// Start checkout process
router.post('/', auth, async (req, res) => {
    /**
     * #swagger.tags = ['Checkout']
     * #swagger.description = 'Start a checkout process with user infos'
     * #swagger.operationId = 'startCheckoutProcess'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        postalCode: Joi.string().required(),
        country: Joi.string().required(),
        saveInfos: Joi.boolean().required()
    });
    const { error } = schema.validate(req.body);
    if (error) return respondError(res, error);

    try {
        const userId = res.locals.token.id;
        const intent = await controller.createPayementIntent(
            userId,
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
                city: req.body.city,
                postalCode: req.body.postalCode,
                country: req.body.country
            },
            req.body.saveInfos as boolean
        );
        respond(res, {
            message: Lang.GetText(Lang.CreateTranslationContext('responses', 'PayementIntentCreated')),
            status: 200
        }, {
            clientSecret: intent.client_secret
        });
    } catch (err) {
        respondError(res, err);
    }
});

// Get checkout status
router.get('/:id', auth, async (req, res) => {
    /**
     * #swagger.tags = ['Checkout']
     * #swagger.description = 'Get the checkout status'
     * #swagger.operationId = 'getCheckoutStatus'
     * #swagger.security = [{ ApiKeyAuth: [] }]
     */
    const schema = Joi.object({
        id: Joi.string().required()
    });
    const { error } = schema.validate(req.params);
    if (error) return respondError(res, error);

    const id = req.params.id;
        
    try {
        const status = await controller.getCheckout(id);
        respond(res, Checkout.MESSAGES.FETCHED(), status);
    } catch (err) {
        respondError(res, err);
    }
});

router.post('/webhook', async (req, res) => {
    /**
     * #swagger.ignore = true
     */
    const key = req.headers['stripe-signature'] as string;
    const rawBody = (req as any).rawBody;

    try {
        await controller.stripeWebhook(key, rawBody);
        res.status(200).end();
    } catch (err) {
        respondError(res, err);
    }
});

export default router;
