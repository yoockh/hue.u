import axios from 'axios';
import Constants from 'expo-constants';

// Resolution order, highest priority first:
// 1. EXPO_PUBLIC_API_URL — existing env-var override, unchanged so current dev
//    setups keep working exactly as before.
// 2. app.json "expo.extra.apiUrl" (or app.config.js) — lets a built app point at
//    a different backend (e.g. a DigitalOcean-hosted deployment) by editing
//    config only, no source change or rebuild-from-env-var needed. Useful for
//    demoing a production/staging backend on a physical device.
// 3. Android-emulator loopback default.
const configuredApiUrl = Constants.expoConfig?.extra?.apiUrl;
const API_URL = process.env.EXPO_PUBLIC_API_URL || configuredApiUrl || 'http://10.0.2.2:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 90000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      error.message = 'The request timed out. Please try again later.';
    } else if (error.response?.data?.message) {
      // Surface the backend's readable message (e.g. "Face not detected...")
      // instead of axios's generic "Request failed with status code 400".
      error.message = error.response.data.message;
    } else if (!error.response) {
      error.message = 'Network error. Please check your connection and try again.';
    }
    return Promise.reject(error);
  }
);

export const analyzeSkin = async (photoUri) => {
  const formData = new FormData();
  formData.append('image', {
    uri: photoUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  });
  
  const response = await api.post('/analyze-skin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getProducts = async (season) => {
  const response = await api.get('/products', {
    params: season ? { season } : {},
  });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};

// Most recent scan only, for the "use my latest result" shortcut. Backend
// returns { status: 'success', data: {...} } or { status: 'empty', data: null }.
export const getLatestHistory = async () => {
  const response = await api.get('/history/latest');
  return response.data;
};

// Full catalog ranked for a season: each product carries a match_rating
// ('good'/'fair'/'poor'), ordered good -> fair -> poor.
export const getProductMatches = async (season) => {
  const response = await api.get('/products/match', { params: { season } });
  return response.data;
};

// Single-product match check: { product, match_rating, recommendations: [...] }.
export const getProductMatch = async (productId, season) => {
  const response = await api.get(`/products/${productId}/match`, { params: { season } });
  return response.data;
};

export const tryOnGarment = async (userPhotoUri, garmentRefUrl, garmentCategory) => {
  const formData = new FormData();
  formData.append('src_image', {
    uri: userPhotoUri,
    type: 'image/jpeg',
    name: 'user_photo.jpg',
  });
  formData.append('ref_image_url', garmentRefUrl);
  formData.append('garment_category', garmentCategory);

  const response = await api.post('/try-on', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
