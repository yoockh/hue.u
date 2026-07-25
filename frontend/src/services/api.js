import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000/api'; // Assuming local backend, 10.0.2.2 for Android Emulator

const api = axios.create({
  baseURL: API_URL,
});

export const analyzeSkin = async (photoUri) => {
  const formData = new FormData();
  formData.append('photo', {
    uri: photoUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  });
  
  const response = await api.post('/analyze-skin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getProducts = async (colors) => {
  const response = await api.get('/products', {
    params: { colors: colors.join(',') }
  });
  return response.data;
};

export const tryOnGarment = async (userPhotoUri, garmentRefUrl, garmentCategory) => {
  const formData = new FormData();
  formData.append('user_photo', {
    uri: userPhotoUri,
    type: 'image/jpeg',
    name: 'user_photo.jpg',
  });
  formData.append('garment_ref_url', garmentRefUrl);
  formData.append('garment_category', garmentCategory);

  const response = await api.post('/try-on', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
