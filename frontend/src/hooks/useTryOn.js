import { useState } from 'react';
import { tryOnGarment } from '../services/api';

export const useTryOn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performTryOn = async (userPhotoUri, garmentRefUrl, garmentCategory) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tryOnGarment(userPhotoUri, garmentRefUrl, garmentCategory);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred during virtual try-on');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { performTryOn, loading, error };
};
