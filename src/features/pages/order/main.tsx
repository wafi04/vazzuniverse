'use client';
import { useParams } from 'next/navigation';
import DetailsCategories from './details-categories';
import { useEffect } from 'react';
import { usePlansStore } from '@/hooks/use-select-plan';
import { User } from '@/types/schema/user';

export function OrderMainPage() {
  const { name } = useParams();

  // mengguankan use effect untuk component relaod halaman supaay stateny ake rest begitu
  useEffect(() => {
    usePlansStore.setState(
      {
        selectPlans: null,
        userID: null,
        serverID: null,
        categories: null,
        voucher: '',
        noWa: null,
        selectPayment: null,
      },
      false
    );
  }, [name]);

  return (
    <>
      <DetailsCategories name={name as string} />
    </>
  );
}
