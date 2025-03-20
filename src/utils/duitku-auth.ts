import axios, { AxiosResponse } from 'axios';
import jsrsasign from 'jsrsasign';
import fs from 'fs';
import path from 'path';
import CryptoJS from 'crypto-js';

interface AuthHeaders {
  'X-TIMESTAMP': string;
  'X-SIGNATURE': string;
  'X-CLIENT-KEY': string;
  [key: string]: string;
}

interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

/**
 * Helper function to convert date to ISO string format
 */
export function toIsoString(date: Date): string {
  const tzo = -date.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = (num: number): string => {
    return (num < 10 ? '0' : '') + num;
  };

  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds()) +
    dif +
    pad(Math.floor(Math.abs(tzo) / 60)) +
    ':' +
    pad(Math.abs(tzo) % 60)
  );
}

/**
 * Generate authentication headers for Duitku API
 */
export function headersAuthGenerator(
  partnerId: string,
  date: Date
): AuthHeaders {
  const stringToSign = `${partnerId}|${toIsoString(date)}`;

  let privateKeyContent: string;

  try {
    privateKeyContent = fs.readFileSync(
      path.join(process.cwd(), 'mykey/privatekey.pem'),
      'utf8'
    );
  } catch (error) {
    console.error('Error reading private key:', error);
    throw new Error('Unable to read private key file');
  }

  const privateKey = jsrsasign.KEYUTIL.getKey(privateKeyContent);
  const sign = new jsrsasign.KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
  sign.init(privateKey);
  const hash = sign.signString(stringToSign);
  const signature = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(hash));

  return {
    'X-TIMESTAMP': toIsoString(date),
    'X-SIGNATURE': signature,
    'X-CLIENT-KEY': partnerId,
    'Content-Type': 'Application-json',
  };
}

/**
 * Get access token from Duitku API
 * This function should be called from server-side code only
 */
export async function getDuitkuAccessToken(
  partnerId: string
): Promise<TokenResponse> {
  const date = new Date();
  const headers = headersAuthGenerator(partnerId, date);
  const body = {
    grantType: 'client_credentials',
  };

  try {
    const response: AxiosResponse = await axios.post(
      'https://snapdev.duitku.com/auth/v1.0/access-token/b2b/',
      body,
      { headers }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Duitku API error:', error.response.data);
      throw new Error(
        `Duitku API error: ${JSON.stringify(error.response.data)}`
      );
    }
    throw error;
  }
}
