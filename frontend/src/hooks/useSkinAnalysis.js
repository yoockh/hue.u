import { useState } from 'react';
import { analyzeSkin } from '../services/api';

export const useSkinAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performAnalysis = async (photoUri) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeSkin(photoUri);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred during skin analysis');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { performAnalysis, loading, error };
};
