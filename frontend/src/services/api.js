import axios from 'axios';

const CORE_BASE_URL = 'http://localhost:9090/api';
const PAYMENT_BASE_URL = 'http://localhost:8081/api';

// ─── Axios Instances ───
const coreAPI = axios.create({
  baseURL: CORE_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 second timeout
});

const paymentAPI = axios.create({
  baseURL: PAYMENT_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ─── Request Interceptor: Auto JWT Token Injection ───
coreAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('adelevate_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



// ─── Response Interceptor: Auto Error Extraction ───
const extractErrorMessage = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return error.message || fallback;
  // Spring Boot returns plain string OR { message: '...' } OR { error: '...' }
  if (typeof data === 'string') return data;
  if (typeof data === 'object') return data.message || data.error || JSON.stringify(data);
  return fallback;
};

coreAPI.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = extractErrorMessage(error, 'Something went wrong');
    return Promise.reject(new Error(message));
  }
);
paymentAPI.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = extractErrorMessage(error, 'Payment service error');
    return Promise.reject(new Error(message));
  }
);


// ═══════════════════════════════════════
//  ADS APIs (Core Backend - Port 9090)
// ═══════════════════════════════════════
export const getAds = async ({ category, city, status } = {}) => {
  const params = {};
  if (category && category.toLowerCase() !== 'all') params.category = category;
  if (city) params.city = city;
  if (status) params.status = status;
  return coreAPI.get('/ads', { params });
};
export const createAd = async (adData) => {
  return coreAPI.post('/ads', adData);
};
export const getAdsByVendor = async (vendorId) => {
  return coreAPI.get(`/ads/vendor/${vendorId}`);
};
export const getAdById = async (adId) => {
  return coreAPI.get(`/ads/${adId}`);
};
export const approveAd = async (adId) => {
  return coreAPI.put(`/ads/${adId}/approve`);
};
export const rejectAd = async (adId) => {
  return coreAPI.put(`/ads/${adId}/reject`);
};

// ═══════════════════════════════════════
//  RATING APIs (Core Backend - Port 9090)
// ═══════════════════════════════════════
export const getRatingsByAd = async (adId) => {
  return coreAPI.get(`/ratings/ad/${adId}`);
};
export const submitRating = async (ratingData) => {
  return coreAPI.post('/ratings', ratingData);
};
// ═══════════════════════════════════════
//  PAYMENT APIs (Payment Microservice - Port 8081)
// ═══════════════════════════════════════
export const initiateRazorpayPayment = async ({ adId, vendorId, amount }) => {
  return paymentAPI.post('/payments', { adId, vendorId, amount });
};
export const verifyRazorpayPayment = async ({ orderId, paymentId, signature, adId }) => {
  return paymentAPI.post('/payments/verify', { orderId, paymentId, signature, adId });
};
// ═══════════════════════════════════════
//  AUTH APIs (Core Backend - Port 9090)
// ═══════════════════════════════════════
export const loginUser = async ({ email, password }) => {
  return coreAPI.post('/auth/login', { email, password });
};
export const registerUser = async (registerData) => {
  return coreAPI.post('/auth/register', registerData);
};
export const getUserProfile = async (userId) => {
  return coreAPI.get(`/users/${userId}`);
};
export const updateUserProfile = async (userId, updateData) => {
  return coreAPI.put(`/users/${userId}`, updateData);
};


