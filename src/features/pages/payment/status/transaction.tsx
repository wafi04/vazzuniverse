import { TransactionDetailsType } from '@/types/transaction';
import { useState } from 'react';
import {
  CalendarIcon,
  Download,
  Clock,
  AlertCircle,
  CheckCircle2,
  Copy,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDate, FormatPrice } from '@/utils/formatPrice';
import { calculateTimeRemaining } from '@/utils/calculate';
import { getStatusColor, getStatusIcon } from '@/components/ui/payment-status';
import { Category } from '@/types/category';

export function TransactionDetails({
  data,
  category,
}: {
  data: TransactionDetailsType;
  category: Category;
}) {
  const [tabAktif, setTabAktif] = useState('details');
  const [disalin, setDisalin] = useState(false);

  const salinKePapanKlip = (teks: string) => {
    navigator.clipboard.writeText(teks);
    setDisalin(true);
    setTimeout(() => setDisalin(false), 2000);
  };

  const waktuTersisa = calculateTimeRemaining({ createdAt: data.createdAt });

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-md">
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">
              Detail Transaksi
            </CardTitle>
            <CardDescription className="mt-1">
              ID Pesanan:{' '}
              <span className="font-medium">{data.merchantOrderId}</span>
            </CardDescription>
          </div>
          <Badge
            className={`${getStatusColor(
              data.paymentStatus
            )} px-3 py-1.5 text-sm flex items-center gap-1.5 border`}
          >
            {getStatusIcon(data.paymentStatus)}
            {data.paymentStatus}
          </Badge>
        </div>
      </CardHeader>
      {data.paymentStatus === 'PENDING' && (
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 font-medium">
              Pembayaran Tertunda
            </AlertTitle>
            <AlertDescription className="text-amber-700">
              Silakan selesaikan pembayaran Anda dalam {waktuTersisa.hours}j{' '}
              {waktuTersisa.minutes}m untuk menghindari pembatalan.
            </AlertDescription>
          </Alert>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-amber-700 mb-1.5">
              <span>Waktu tersisa</span>
              <span>
                {waktuTersisa.hours}j {waktuTersisa.minutes}m tersisa
              </span>
            </div>
            <div className="relative">
              <Progress
                value={waktuTersisa.percentage}
                className="h-2 bg-amber-200"
              />
              <style jsx>{`
                :global(.progress-indicator) {
                  background-color: #f59e0b; /* amber-500 */
                }
              `}</style>
            </div>
          </div>
        </div>
      )}
      <CardContent className="p-0">
        <Tabs
          defaultValue="details"
          value={tabAktif}
          onValueChange={setTabAktif}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 rounded-none border-b">
            <TabsTrigger
              value="details"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Detail Transaksi
            </TabsTrigger>
            <TabsTrigger
              value="invoice"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Informasi Faktur
            </TabsTrigger>
          </TabsList>
          <div className="p-6">
            <TabsContent value="details" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Informasi Game */}
                  <div className="bg-muted/30 rounded-lg p-5 border">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-background border">
                        {category && (
                          <Image
                            src={category.thumbnail}
                            alt={category.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.subName}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="font-medium">ID Pengguna:</span>
                      <span>{data.pembelian[0].accountID}</span>
                      {data.pembelian[0].zone && (
                        <>
                          <span className="font-medium">ID Server:</span>
                          <span>{data.pembelian[0].zone}</span>
                        </>
                      )}
                      <span className="font-medium">Layanan:</span>
                      <span>Top up</span>
                    </div>
                  </div>
                  {/* Informasi Pembayaran */}
                  <div className="bg-muted/30 rounded-lg p-5 border">
                    <h3 className="font-medium mb-4">Informasi Pembayaran</h3>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <span className="font-medium">Jumlah:</span>
                      <span className="font-semibold">
                        {FormatPrice(data.finalAmount)}
                      </span>
                      <span className="font-medium">Jumlah Awal:</span>
                      <span>{FormatPrice(data.originalAmount)}</span>
                      <span className="font-medium">Diskon:</span>
                      <span>{FormatPrice(data.discountAmount)}</span>
                      <span className="font-medium">Metode Pembayaran:</span>
                      <span>{data.paymentCode}</span>
                      <span className="font-medium">Referensi:</span>
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[120px]">
                          {data.paymentReference || 'N/A'}
                        </span>
                        {data.paymentReference && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    salinKePapanKlip(data.paymentReference)
                                  }
                                >
                                  {disalin ? (
                                    <CheckCircle2 className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{disalin ? 'Disalin!' : 'Salin referensi'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  {/* Informasi Status */}
                  <div className="bg-muted/30 rounded-lg p-5 border">
                    <h3 className="font-medium mb-4">Informasi Status</h3>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <span className="font-medium">Status:</span>
                      <Badge className={getStatusColor(data.paymentStatus)}>
                        {data.paymentStatus}
                      </Badge>
                      <span className="font-medium">Dibuat Pada:</span>
                      <span>{formatDate(data.createdAt)}</span>
                      <span className="font-medium">Diperbarui Pada:</span>
                      <span>{formatDate(data.updatedAt)}</span>
                      <span className="font-medium">Selesai Pada:</span>
                      <span>
                        {data.completedAt
                          ? formatDate(data.completedAt)
                          : 'Tertunda'}
                      </span>
                      <span className="font-medium">WhatsApp:</span>
                      <span>{data.noWa}</span>
                    </div>
                  </div>
                  {/* QR Code (jika tersedia) */}
                  {data.qrString && (
                    <div className="bg-muted/30 rounded-lg p-5 border">
                      <h3 className="font-medium mb-4">Pembayaran QR</h3>
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-4 rounded-lg mb-3">
                          <Image
                            width={150}
                            height={150}
                            src={`data:image/png;base64,${data.qrString}`}
                            alt="Kode QR Pembayaran"
                            className="w-[150px] h-[150px]"
                          />
                        </div>
                        <p className="text-sm text-center text-muted-foreground">
                          Pindai kode QR ini dengan aplikasi pembayaran Anda untuk menyelesaikan transaksi.
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Aksi Pembayaran (untuk status tertunda) */}
                  {data.paymentStatus === 'PENDING' && (
                    <div className="bg-primary-foreground rounded-lg p-5 border border-primary/20">
                      <h3 className="font-medium mb-3">
                        Selesaikan Pembayaran Anda
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Klik tombol di bawah untuk melanjutkan ke halaman pembayaran dan menyelesaikan transaksi Anda.
                      </p>
                      <Button
                        className="w-full"
                        onClick={() => window.open(data.paymentUrl, '_blank')}
                      >
                        Bayar Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="invoice" className="mt-0">
              {data.invoice && data.invoice.length > 0 ? (
                <div className="space-y-6">
                  {data.invoice.map((inv, index) => (
                    <Card key={index} className="border shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">
                              Faktur #{inv.invoiceNumber}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <CalendarIcon className="h-3 w-3" />
                              Jatuh Tempo: {new Date(inv.dueDate).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(inv.status)}>
                            {inv.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-y-2">
                            <span className="text-sm font-medium">
                              Subtotal:
                            </span>
                            <span className="text-sm">
                              {FormatPrice(inv.subtotal)}
                            </span>
                            <span className="text-sm font-medium">
                              Diskon:
                            </span>
                            <span className="text-sm">
                              {FormatPrice(inv.discountAmount)}
                            </span>
                            <span className="text-sm font-medium">Pajak:</span>
                            <span className="text-sm">
                              {FormatPrice(inv.taxAmount)}
                            </span>
                            <Separator className="col-span-2 my-1" />
                            <span className="text-sm font-medium">
                              Total:
                            </span>
                            <span className="text-sm font-bold">
                              {FormatPrice(inv.totalAmount)}
                            </span>
                          </div>
                          {inv.notes && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-1">
                                Catatan:
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {inv.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Unduh
                        </Button>
                        <div className="text-xs text-muted-foreground">
                          Dibuat:{' '}
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Tidak Ada Faktur Tersedia
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {data.paymentStatus === 'PENDING'
                      ? 'Faktur akan dibuat setelah pembayaran selesai.'
                      : 'Tidak ada informasi faktur untuk transaksi ini.'}
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}