import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'SUCCESS':
    case 'PAID':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'FAILED':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'SUCCESS':
    case 'PAID':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'PENDING':
      return <Clock className="h-4 w-4 text-amber-600" />;
    case 'FAILED':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};
