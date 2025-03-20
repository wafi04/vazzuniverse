export const production = process.env.NODE_ENV === 'production';
export const URL_MIDTRANS_CHARGE = production
  ? 'https://api.midtrans.com/v2/charge'
  : 'https://api.sandbox.midtrans.com/v2/charge';
export const URL_MIDTRANS_STATUS = production
  ? 'https://api.midtrans.com/v2/'
  : 'https://api.sandbox.midtrans.com/v2/';
export function generateOrderId() {
  return `ORDER-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}
