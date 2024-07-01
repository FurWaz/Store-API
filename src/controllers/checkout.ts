import HTTPError from 'errors/HTTPError.ts';
import { prisma } from 'index.ts';
import { Checkout } from 'models/Checkout.ts';
import { User } from 'models/User.ts';
import Stripe from 'stripe';
import { CheckoutStatus, CheckoutStatuses } from 'tools/CheckoutStatus.ts';
import Config from 'tools/Config.ts';
import { removeAllCartProducts } from './cartProducts.ts';

const stripe = new Stripe(Config.security.stripeKey, {
    appInfo: {
        name: 'FurWaz API',
        version: '1.0.0',
        url: 'https://main.apis.furwaz.fr'
    }
});

type PersonalInfos = {firstName: string, lastName: string, address: string, city: string, country: string, postalCode: string};
export async function createPayementIntent(userId: number, infos: PersonalInfos, saveInfos: boolean) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new HTTPError(
            User.MESSAGES.NOT_FOUND.status,
            User.MESSAGES.NOT_FOUND.message
        );
    const cartProducts = await prisma.cartProduct.findMany({
        where: { userId },
        include: { product: true }
    });

    if (saveInfos) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: infos.firstName,
                lastName: infos.lastName,
                address: infos.address,
                city: infos.city,
                postalCode: infos.postalCode
            }
        });
    }

    const price = cartProducts.reduce((acc, product) => acc + product.product.price * product.quantity, 0);
    const paymentIntent = await stripe.paymentIntents.create({
        amount: price * 100, // convert to cents (stripe format)
        currency: 'eur',
        automatic_payment_methods: { enabled: false },
        payment_method_types: ['card', 'paypal']
    });
    await prisma.checkout.create({
        data: {
            intentId: paymentIntent.id,
            status: { connect: { id: CheckoutStatuses.PENDING.id } },
            user: { connect: { id: userId } },
            products: { create: cartProducts.map(p => ({
                productId: p.productId,
                quantity: p.quantity,
                price: p.product.price
            })) },
            email: user.email,
            amount: price,
            firstName: infos.firstName,
            lastName: infos.lastName,
            address: infos.address,
            city: infos.city,
            postalCode: infos.postalCode,
            country: infos.country
        }
    });

    return paymentIntent;
}

export async function stripeWebhook(key: string, rawBody: string) {
    const secret = Config.security.stripeWebhookSecret;
    const event = stripe.webhooks.constructEvent(rawBody, key, secret);

    let status = CheckoutStatuses.PENDING;
    switch (event.type) {
        case 'payment_intent.succeeded':
            status = CheckoutStatuses.SUCCEEDED;
            break;
        case 'payment_intent.payment_failed':
            status = CheckoutStatuses.FAILED;
            break;
        default: return;
    }

    const checkout = await prisma.checkout.update({
        where: { intentId: event.data.object.id },
        data: {
            status: { connect: { id: status.id } }
        }
    });
    if (checkout === null)
        throw new HTTPError(
            Checkout.MESSAGES.NOT_FOUND.status,
            Checkout.MESSAGES.NOT_FOUND.message
        );

    if (status === CheckoutStatuses.SUCCEEDED) {
        removeAllCartProducts(checkout.userId);
    }
    
    return checkout;
}

export async function getCheckoutStatus(intentId: string): Promise<CheckoutStatus> {
    const checkout = await prisma.checkout.findFirst({ where: { intentId }, include: { status: true } });
    if (checkout === null)
        throw new HTTPError(
            Checkout.MESSAGES.NOT_FOUND.status,
            Checkout.MESSAGES.NOT_FOUND.message
        );
    
    return (CheckoutStatuses as any)[checkout.status.name.toUpperCase()].name;
}
