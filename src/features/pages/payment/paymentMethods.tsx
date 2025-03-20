import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PaymentMethod } from "@/types/payment";
import { cn } from "@/lib/utils";
import { CreditCard, CheckCircle2, LockIcon, Coins } from "lucide-react";
import Image from "next/image";
import { PaymentMethodUsingDeposit } from "./payment-deposit";
import { FormatPrice } from "@/utils/formatPrice";
import { Method } from "@/hooks/use-select-plan";

interface PaymentMethodsProps {
  amount: number;
  paymentTypes: string[];
  groupedMethods: Record<string, PaymentMethod[]>;
  onSelectMethod: (method: Method) => void;
  selectedMethod: Method | null;
}

export function PaymentMethods({
  amount,
  paymentTypes,
  groupedMethods,
  onSelectMethod,
  selectedMethod
}: PaymentMethodsProps) {
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const displayAmount = amount > 0 ? amount : null
  const typeIcons: Record<string, React.ReactNode> = {
    BANK: <CreditCard className="h-5 w-5 text-blue-300" />,
    EWALLET: <CreditCard className="h-5 w-5 text-blue-300" />,
    BALANCE: <Coins className="h-5 w-5 text-yellow-400" />
  };

  const typeLabels: Record<string, string> = {
    BANK: "Transfer Bank",
    EWALLET: "E-Wallet",
    BALANCE: "Koin / Saldo"
  };

  const isAmountValid = (method: PaymentMethod, amount?: number): boolean => {
    // If amount is undefined or null, check if method has min and max values
    if (!amount) return false;
    
    // check  values from minimal if not  return 0 and max values if not exist return infinity
    const minValue = method?.min ?? 0;
    const maxValue = method?.max ?? Infinity;
    
    return amount >= minValue && amount <= maxValue;
  };
  // Handler untuk perubahan accordion
  const handleAccordionChange = (value: string) => {
    setExpandedType(value);
  };

  // Handler untuk memilih metode pembayaran
  const handleSelectMethod = (method: Method) => {
    onSelectMethod(method);
  };

  // Set expanded type to first valid type on mount
  useEffect(() => {
    if (amount && paymentTypes.length > 0 && !expandedType) {
      setExpandedType(paymentTypes[0]);
    }
  }, [amount, paymentTypes, expandedType]);

  return (
    <div className="space-y-4">
      {/* Opsi pembayaran dengan Koin */}
      <div className={cn(!amount && 'opacity-60 pointer-events-none')}>
        <div className="border border-blue-800 rounded-lg mb-4 overflow-hidden">
          <div className="px-4 py-4 bg-blue-900/50 text-blue-100">
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-yellow-400" />
              <span className="font-medium">Bayar dengan Koin</span>
              {displayAmount && <span>{FormatPrice(displayAmount)}</span>}
              {!amount && (
                <span className="ml-2 text-xs text-red-300 flex items-center gap-1">
                  <LockIcon className="h-3 w-3" />
                  Pilih Paket Dahulu
                </span>
              )}
            </div>
          </div>
          <div className="px-4 pt-3 pb-5 bg-blue-950/40">
            <PaymentMethodUsingDeposit
              amount={amount}
              selectedMethod={selectedMethod}
              onSelect={handleSelectMethod}
            />
          </div>
        </div>
      </div>

      {/* Metode pembayaran lainnya */}
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={expandedType || undefined}
        onValueChange={handleAccordionChange}
      >
        {paymentTypes.map((type) => (
          <div
            key={type}
            className={cn(!amount && 'opacity-60 pointer-events-none')}
          >
            <AccordionItem
              value={type}
              className="border border-blue-800 rounded-lg mb-4 overflow-hidden"
            >
              <AccordionTrigger
                className="px-4 py-4 bg-blue-900/50 hover:bg-blue-900/70 hover:no-underline text-blue-100 transition-all duration-200"
                disabled={!amount}
              >
                <div className="flex items-center gap-3">
                  {typeIcons[type] || (
                    <CreditCard className="h-5 w-5 text-blue-300" />
                  )}
                  <span className="font-medium">
                    {typeLabels[type] || type}
                  </span>
                  {displayAmount && <span>{FormatPrice(displayAmount)}</span>}
                  {!amount && (
                    <span className="ml-2 text-xs text-red-300 flex items-center gap-1">
                      <LockIcon className="h-3 w-3" />
                      Pilih Paket Dahulu
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-3 pb-5 bg-blue-950/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupedMethods[type]?.map((method) => {
                    const isValid = isAmountValid(method, amount);
                    
                    return (
                      <div
                        key={method.id}
                        className={cn(
                          'cursor-pointer border border-blue-800 hover:border-blue-400 rounded-lg w-full h-24 overflow-hidden relative bg-blue-950/20 transition-all duration-200',
                          selectedMethod?.code === method.code &&
                            'border-blue-400 bg-blue-900/30',
                          !isValid && 'opacity-60 pointer-events-none'
                        )}
                        onClick={() => isValid && handleSelectMethod({
                          code: method.code as string,
                          name: method.name,
                          price: amount || 0,
                          type: method.type
                        })}
                      >
                        <div className="h-full flex flex-row items-center p-3">
                          <div className="flex-shrink-0 flex items-center justify-center mr-3">
                            <Image
                              width={300}
                              height={300}
                              src={method.images}
                              alt={method.name}
                              className="size-12 object-contain"
                            />
                          </div>
                          <div className="flex-grow space-y-1">
                            <p className="text-sm font-medium text-blue-100">
                              {method.name}
                            </p>
                            {method.keterangan && (
                              <p className="text-xs text-blue-300">
                                {method.keterangan}
                              </p>
                            )}
                          </div>
                          {selectedMethod?.code === method.code && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle2 className="h-5 w-5 text-blue-400" />
                            </div>
                          )}
                          {!isValid && (
                            <div className="absolute top-2 right-2">
                              <span className="text-xs text-red-400">
                                Tidak Tersedia
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </div>
        ))}
      </Accordion>
    </div>
  );
}