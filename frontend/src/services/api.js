import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 90000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      error.message = 'The request timed out. Please try again later.';
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
