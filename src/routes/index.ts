import type { Request, Response } from 'express';
import express from 'express';

import { auth } from 'middleware/auth.ts';
import routerDocs from './docs.ts';
import routerAuth from './auth.ts';
import routerCartProducts from './cartProducts.ts';
import routerCheckout from './checkout.ts';
import routerUserProducts from './userProducts.ts';
import routerUser from './users.ts';
import routerStore from './store.ts';


const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    /* #swagger.ignore = true */
    res.redirect('/docs');
});

router.use('/docs', routerDocs);
router.use('/auth', routerAuth);
router.use('/user', routerUser);
router.use('/cart', auth, routerCartProducts);
router.use('/checkout', auth, routerCheckout);
router.use('/products', auth, routerUserProducts);
router.use('/store', auth, routerStore);

export default router;
