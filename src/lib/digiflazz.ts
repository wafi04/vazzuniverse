import { Product, TransactionType } from '@/types/digiflazz/ml';
import axios, { AxiosError } from 'axios';
import crypto from 'crypto';
import { auth } from '../../auth';
import { prisma } from './prisma';
interface TopUpRequest {
  whatsapp: string;
  userId: string;
  serverId?: string;
  productCode: string;
  refid? : string
}

export class Digiflazz {
  private username: string;
  private apiKey: string;

  constructor(username: string, apiKey: string) {
    this.username = username;
    this.apiKey = apiKey;
  }

  async checkPrice(): Promise<Product[]> {
    try {
      const sign = crypto.createHash('md5').update(this.apiKey).digest('hex');

      const payload = {
        cmd: 'pricelist',
        username: this.username,
        sign: sign,
      };

      const response = await axios({
        method: 'POST',
        url: 'https://api.digiflazz.com/v1/price-list',
        headers: {
          'Content-Type': 'application/json',
        },
        data: payload,
      });

      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            console.error(
              'Response data:',
              JSON.stringify(axiosError.response.data)
            );
            console.error('Response status:', axiosError.response.status);
            console.error('Response headers:', axiosError.response.headers);
          } else if (axiosError.request) {
            console.error('No response received:', axiosError.request);
          } else {
            console.error('Error setting up request:', axiosError.message);
          }
          console.error('Error config:', axiosError.config);
        }
      } else {
        console.error('Unknown error:', error);
      }
      throw error;
    }
  }

  async TopUp(topUpData: TopUpRequest) {
    try {
      const refId = topUpData.refid 

      const signature = crypto
        .createHash('md5')
        .update(this.username + this.apiKey + refId)
        .digest('hex');

      const userId = topUpData.userId?.trim();
      const serverId = topUpData.serverId?.trim();

      // Log for debugging
      console.log('About to submit:', {
        userId,
        serverId,
        productCode: topUpData.productCode,
        refId
      });

      // Format customer_no based on what Digiflazz expects
      let customerNo;

      if (topUpData.productCode.includes('ML') && userId && serverId) {
        customerNo = `${parseInt(userId)}${parseInt(serverId)}`;
      }
      // For Free Fire (usually just userId)
      else if (topUpData.productCode.includes('FF') && userId) {
        customerNo = userId;
      }
      // Default format with period separator
      else if (userId && serverId) {
        customerNo = `${userId}${serverId}`;
      } else if (userId) {
        customerNo = userId;
      } else {
        customerNo = topUpData.whatsapp;
      }

      const data = {
        username: this.username,
        buyer_sku_code: topUpData.productCode,
        customer_no: customerNo,
        ref_id: refId,
        sign: signature,
      };

      console.log('Sending to Digiflazz:', data)

      // Send request to Digiflazz API
      const response = await fetch('https://api.digiflazz.com/v1/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error making order:', error.message);
        throw error;
      }
    }
  }
  async deposite(method: string) {
    try {
      const session = await auth();
      if (!session?.user) {
        return {
          status: false,
          message: 'Unatuhorized',
          statusCode: 401,
        };
      }
      const user = await prisma.users.findUnique({
        where: { id: session?.user.id },
      });

      let nomor: string;
      if (method === 'OVO') {
        nomor = process.env.NEXT_PUBLIC_NO_ADMIN as string;
      } else if (method === 'GOPAY') {
        nomor = process.env.NEXT_PUBLIC_NO_ADMIN as string;
      } else if (method === 'BCA') {
        nomor = process.env.NEXT_PUBLIC_BCA_ADMIN as string;
      } else if (method === 'SHOPEPAY') {
        nomor = process.env.NEXT_PUBLIC_NO_ADMIN as string;
      } else if (method === 'DANA') {
        nomor = process.env.NEXT_PUBLIC_NO_ADMIN as string;
      } else if (method === 'BRI') {
        nomor = '';
        console.log(nomor);
      } else {
        return {
          status: false,
          statusCode: 404,
          message: 'Method Not Allowed',
        };
      }

      if (!user) {
        return {
          status: false,
          message: 'Failed To Find User',
          statusCode: 401,
        };
      }
      await prisma.deposits.create({
        data: {
          method,
          status: 'PENDING',
          userId: '',
          username: user.username,
          amount: 0,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Digiflazz price check error:', error.message);

        // Check if it's an Axios error with a response
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            console.error(
              'Response data:',
              JSON.stringify(axiosError.response.data)
            );
          } else if (axiosError.request) {
            console.error('No response received:', axiosError.request);
          } else {
            console.error('Error setting up request:', axiosError.message);
          }
          console.error('Error config:', axiosError.config);
        }
      } else {
        console.error('Unknown error:', error);
      }
      throw error;
    }
  }
  async checkPricePrepaid() {
    try {
      const sign = crypto.createHash('md5').update(this.apiKey).digest('hex');

      const payload = {
        cmd: 'pricelist',
        username: this.username,
        sign: sign,
      };

      const response = await axios({
        method: 'POST',
        url: 'https://api.digiflazz.com/v1/price-list',
        headers: {
          'Content-Type': 'application/json',
        },
        data: payload,
      });

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Digiflazz price check error:', error.message);

        // Check if it's an Axios error with a response
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            console.error(
              'Response data:',
              JSON.stringify(axiosError.response.data)
            );
            console.error('Response status:', axiosError.response.status);
            console.error('Response headers:', axiosError.response.headers);
          } else if (axiosError.request) {
            console.error('No response received:', axiosError.request);
          } else {
            console.error('Error setting up request:', axiosError.message);
          }
          console.error('Error config:', axiosError.config);
        }
      } else {
        console.error('Unknown error:', error);
      }
      throw error;
    }
  }

  async CreateOrder(service = null, order_id = null, target: string) {
    try {
      const api = {
        username_digi: this.username,
        api_key_digi: this.apiKey,
      };
      const sign = crypto.createHash('md5').update(this.apiKey).digest('hex');
      const api_postdata = {
        username: api.username_digi,
        buyer_sku_code: service,
        customer_no: target,
        ref_id: String(order_id),
        sign: sign,
      };
      const headers = {
        'Content-Type': 'application/json',
      };

      const response = await axios.post(
        'https://api.digiflazz.com/v1/transaction',
        api_postdata,
        { headers }
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error making order:', error.message);
        throw error;
      }
    }
  }

  async checkDeposit() {
    try {
      const sign = crypto
        .createHash('md5')
        .update(this.username + this.apiKey)
        .digest('hex');

      const payload = {
        cmd: 'deposit',
        username: this.username,
        sign: sign,
      };

      const response = await axios({
        method: 'POST',
        url: 'https://api.digiflazz.com/v1/cek-saldo',
        headers: {
          'Content-Type': 'application/json',
        },
        data: payload,
      });

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Digiflazz price check error:', error.message);
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            console.error(
              'Response data:',
              JSON.stringify(axiosError.response.data)
            );
          } else if (axiosError.request) {
            console.error('No response received:', axiosError.request);
          } else {
            console.error('Error setting up request:', axiosError.message);
          }
          console.error('Error config:', axiosError.config);
        }
      } else {
        console.error('Unknown error:', error);
      }
      throw error;
    }
  }
}
