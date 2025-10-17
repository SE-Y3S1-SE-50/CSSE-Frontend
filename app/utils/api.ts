import axios from 'axios';
import { PaymentRequest, PaymentResponse, PaymentHistoryResponse } from '../types/payment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error('Network error - please check your connection'));
    } else {
      // Something else happened
      return Promise.reject(new Error('An unexpected error occurred'));
    }
  }
);

export const paymentApi = {
  /**
   * Process a payment
   */
  async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await api.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment history for user
   */
  async getPaymentHistory(): Promise<PaymentHistoryResponse> {
    try {
      const response = await api.get('/payments/user');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify cash payment (admin action)
   */
  async verifyCashPayment(transactionId: string, finalStatus: 'Processed' | 'Failed'): Promise<PaymentResponse> {
    try {
      const response = await api.put('/payments/verify', {
        transactionId,
        finalStatus
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const userApi = {
  /**
   * Get current user details
   */
  async getCurrentUser(userId: string): Promise<any> {
    try {
      const response = await api.get(`/user/current/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;