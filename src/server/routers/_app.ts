import { router } from '../trpc';
import { ConfigWeb } from './config';
import { Deposits } from './deposits';
import { invoiceRouter } from './invoices';
import { Layanans } from './layanans';
import { mainRouter } from './main';
import { member } from './member';
import { methods } from './method';
import { order } from './order';
import { subCategory } from './sub-category';
import { transaction } from './transaction';
import { voucher } from './voucher';

export const appRouter = router({
  main: mainRouter,
  methods: methods,
  layanans: Layanans,
  transaction,
  sub: subCategory,
  order: order,
  voucher: voucher,
  deposits: Deposits,
  setting: ConfigWeb,
  member : member,
  inv : invoiceRouter
});

export type AppRouter = typeof appRouter;
