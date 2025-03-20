'use client';
import { trpc } from '@/utils/trpc';
import FlowProgress from './flow-number';
import { HeaderPaymentStatus } from './header';
import { useSearchParams } from 'next/navigation';
import { FLOWTRANSACTION, TransactionDetailsType } from '@/types/transaction';
import { TransactionDetails } from './transaction';
import { Category } from '@/types/category';

export function PaymentStatus() {
  const searchParams = useSearchParams();
  const merchantOrderId = searchParams.get('merchantOrderId') ?? '';
  const { data } = trpc.transaction.getTransaction.useQuery({
    merchantOrderId,
  });
  console.log(data);
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:p-8 max-w-7xl">
      <HeaderPaymentStatus status={data?.data.paymentStatus as string} />
      <FlowProgress status={data?.data.paymentStatus as FLOWTRANSACTION} />
      {data && (
        <TransactionDetails
          data={data.data as TransactionDetailsType}
          category={data.category as Category}
        />
      )}
    </main>
  );
}
