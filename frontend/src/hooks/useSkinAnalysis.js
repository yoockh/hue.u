import { useState } from 'react';
import { analyzeSkin } from '../services/api';

export const useSkinAnalysis = () => {
  const [loading, setLoading] = useState(false);

  const performAnalysis = async (photoUri) => {
    setLoading(true);
    try {
      const result = await analyzeSkin(photoUri);
      return result;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { performAnalysis, loading };
};
