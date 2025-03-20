'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Clock, ArrowUpRight, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, FormatPrice } from '@/utils/formatPrice';
import { trpc } from '@/utils/trpc';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SelectPayment } from './components/selectPayment';
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';


interface Deposit  {
  amount: number
createdAt: string
id: number
method: string
status: string
updatedAt: string
userId: string
username: string
}

export function UserTopUp() {
  const [amount, setAmount] = useState<string>('');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [code, setCode] = useState<string>("");
  const [loading, setIsLoading] = useState(false);
  const { push } = useRouter();
  
  const HandleTopUp = async(data: { code: string, amount: number }) => {
    setIsLoading(true);
    try {
      const req = await axios.post('/api/payment/deposit', data);
      const res = req.data;
      toast.success("Deposit berhasil");
      push(res.paymentUrl);
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };
  
  const { data: depositsData, isLoading: depositsLoading } = trpc.deposits.getByUsername.useQuery();
  // Fix: Properly access the data structure
  const deposits = depositsData?.data?.deposit || [];
  const user = depositsData?.data?.user;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(value);
  };

  const handleTopUp = () => {
    if (amount && parseInt(amount) > 0) {
      setShowPaymentMethods(true);
    }
  };

  const handleMethodSelect = (methodId: number, code: string) => {
    setSelectedMethodId(methodId);
    setCode(code);
  };

  const handleBackToAmount = () => {
    setShowPaymentMethods(false);
    setSelectedMethodId(null);
  };

  // Predefined top-up amounts
  const predefinedAmounts = [10000, 20000, 50000, 100000, 200000, 500000];
  console.log(deposits)
  return (
    <main className="container mx-auto px-4 py-10 min-h-screen max-w-7xl relative">
      {/* Loading Overlay */}
      {(loading || depositsLoading) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Sedang Memproses...</p>
          </div>
        </div>
      )}
      
      {/* Saldo */}
      <section className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              Saldo Anda
            </CardTitle>
            <CardDescription>Saldo tersedia untuk digunakan</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{FormatPrice(user?.balance || 0)}</p>
          </CardContent>
        </Card>

        {showPaymentMethods ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="mr-2 p-2 h-8 w-8" 
                onClick={handleBackToAmount}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-medium">Pilih Metode Pembayaran</h2>
            </div>
            <TooltipProvider>
              <SelectPayment 
                amount={parseInt(amount)}
                onMethodSelect={handleMethodSelect}
              />
            </TooltipProvider>
            {selectedMethodId && (
              <div className="mt-4">
                <Button 
                  className="w-full" 
                  disabled={loading} 
                  onClick={() => {
                    HandleTopUp({
                      code,
                      amount: parseInt(amount)
                    });
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Memproses...
                    </>
                  ) : (
                    "Lanjutkan Pembayaran"
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Tabs defaultValue="topup" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="topup">Top Up</TabsTrigger>
              <TabsTrigger value="history">Riwayat</TabsTrigger>
            </TabsList>

            <TabsContent value="topup" className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">Pilih Nominal Top Up</h3>
              
              {/* Predefined amounts */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {predefinedAmounts.map((preAmount) => (
                  <Button
                    key={preAmount}
                    variant={amount === preAmount.toString() ? "default" : "outline"}
                    className="h-16"
                    onClick={() => setAmount(preAmount.toString())}
                  >
                    {FormatPrice(preAmount)}
                  </Button>
                ))}
              </div>
              
              {/* Custom amount */}
              <div className="space-y-2 mt-4">
                <Label htmlFor="custom-amount">Nominal Lainnya</Label>
                <div className="flex gap-2">
                  <Input
                    id="custom-amount"
                    type="text"
                    placeholder="Masukkan nominal"
                    value={amount}
                    onChange={handleAmountChange}
                  />
                  <Button 
                    onClick={handleTopUp} 
                    disabled={!amount || parseInt(amount) <= 0}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Top Up
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <h3 className="text-lg font-medium mb-4">Riwayat Top Up</h3>
              {depositsLoading ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p>Memuat data...</p>
                </div>
              ) : deposits && deposits.length > 0 ? (
                <div className="space-y-3">
                  {deposits.map((deposit  : Deposit) => (
                    <Card key={deposit.id}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <ArrowUpRight className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{deposit.method
                              }</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(deposit.createdAt as string)}
                            </p>
                          </div>
                        </div>
                        <p className={`font-semibold ${deposit.status  === "PENDING"  ? "text-yellow-500"  : "text-green-500"}`}>
                        {
                          deposit.status === "SUCCESS"  ?  `+${FormatPrice(deposit.amount)}`  :  `${FormatPrice(deposit.amount)}`
                       }

                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Belum ada riwayat top up
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </section>
    </main>
  );
}