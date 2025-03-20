'use client';

import { trpc } from '@/utils/trpc';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { type ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export interface PaymentMethod {
  id: number;
  name: string;
  images: string;
  code: string;
  keterangan: string;
  type: string;
  paymentType: string | null;
  paymentCodeMidtrans: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DialogMethodPaymentProps {
  amount: number;
  children: ReactNode;
  onSelectMethod?: (methodCode: string) => void;
}
async function Post(amount: number, code: string) {
  try {
    const data = {
      amount,
      code,
    };
    const req = await axios.post('/api/payment/deposit', data);
    return req.data;
  } catch (error) {
    console.log(error);
  }
}
export function DialogMethodPayment({
  amount,
  children,
  onSelectMethod,
}: DialogMethodPaymentProps) {
  const { data, isLoading } = trpc.methods.getMethods.useQuery();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { push } = useRouter();

  const handleSelectMethod = (code: string) => {
    setSelectedCode(code);
    if (onSelectMethod) {
      onSelectMethod(code);
    }
  };
  console.log(selectedCode);

  // In the DialogMethodPayment component
  const handleConfirm = async () => {
    if (selectedCode) {
      try {
        const response = await Post(amount, selectedCode);

        // Check if the response has a payment URL
        if (response && response.paymentUrl) {
          push(response.paymentUrl);
        } else {
          console.error('No payment URL received:', response);
        }

        setOpen(false);
      } catch (error) {
        console.error('Payment error:', error);
      }
    }
  };
  // Group payment methods by type
  const groupedMethods =
    data?.data.reduce((acc, method) => {
      if (!acc[method.type]) {
        acc[method.type] = [];
      }
      acc[method.type].push(method);
      return acc;
    }, {} as Record<string, PaymentMethod[]>) || {};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {Object.entries(groupedMethods).map(([type, methods]) => (
              <div key={type} className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase">
                  {type}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {methods.map((method) => (
                    <Card
                      key={method.code}
                      className={`cursor-pointer transition-all ${
                        selectedCode === method.code ? 'border-primary' : ''
                      }`}
                      onClick={() => handleSelectMethod(method.code)}
                    >
                      <CardContent className="p-3 flex items-center justify-center relative">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                          <Image
                            width={100}
                            height={200}
                            src={method.images || '/placeholder.svg'}
                            alt={method.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        {selectedCode === method.code && (
                          <div className="absolute top-2 right-2">
                            <Check className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Total Pembayaran</span>
            <span className="font-bold">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(amount)}
            </span>
          </div>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full"
          >
            Konfirmasi Pembayaran
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
