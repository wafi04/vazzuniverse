export const DUITKU_MERCHANT_CODE = process.env.DUITKU_MERCHANT_CODE;
export const DUITKU_API_KEY = process.env.DUITKU_API_KEY;
export const DUITKU_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://passport.duitku.com/webapi'
    : 'https://sandbox.duitku.com/webapi';
export const DUITKU_CALLBACK_URL = process.env.DUITKU_CALLBACK_URL;
export const DUITKU_RETURN_URL = process.env.DUITKU_RETURN_URL;
export const DUITKU_EXPIRY_PERIOD = 60 * 24;
