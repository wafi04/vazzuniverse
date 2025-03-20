'use client';
import { useEffect, useState } from 'react';
import { HeaderOrderManual } from './header-order-manual';
import { trpc } from '@/utils/trpc';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, FormatPrice } from '@/utils/formatPrice';
import { getStatusBadge } from '@/utils/getStatusActive';
import { Transaction } from '@/types/transaction';

export function PesananManual() {
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    'PAID' | 'PENDING' | 'FAILED' | undefined
  >();
  const [pageSize] = useState(10);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
      setCurrentPage(1);
    }, 1000);

    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const { data: transactions, isLoading } =
    trpc.order.getAllTransaction.useQuery({
      page: currentPage,
      perPage: pageSize,
      paymentCode: 'MANUAL',
      status: statusFilter,
      search: debouncedSearchTerm,
    });

  const transaction =
    transactions && 'data' in transactions && transactions.status === true
      ? transactions.data
      : [];

  const pagination =
    transactions && 'meta' in transactions && transactions.status === true
      ? transactions.meta
      : {
          total: 0,
          page: 1,
          perPage: pageSize,
          totalPages: 1,
        };

  return (
    <main className="min-h-screen p-8 space-y-6">
      {/* header */}
      <HeaderOrderManual
        onChange={setSearchInput}
        onStatusChange={setStatusFilter}
        statusFilter={statusFilter}
      />

      {/* Table and pagination */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Transaction Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Ref</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transaction.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transaction.map((item: Transaction) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.merchantOrderId}
                      </TableCell>
                      <TableCell>{FormatPrice(item.finalAmount)}</TableCell>
                      <TableCell>{item.noWa}</TableCell>
                      <TableCell>
                        {getStatusBadge(item.paymentStatus as string)}
                      </TableCell>
                      <TableCell>{item.paymentReference || '-'}</TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing{' '}
              {transaction.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, pagination.total)} of{' '}
              {pagination.total} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
                className="px-4 py-2 bg-primary/10 text-primary rounded disabled:opacity-50 hover:bg-primary/20 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    prev < pagination.totalPages ? prev + 1 : prev
                  )
                }
                disabled={currentPage >= pagination.totalPages}
                className="px-4 py-2 bg-primary/10 text-primary rounded disabled:opacity-50 hover:bg-primary/20 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
