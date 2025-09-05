import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const awsAccessKeyId = useSelector(
    (state: RootState) => state.auth.AWS_ACCESS_KEY_ID,
  );
  const awsSecretAccessKey = useSelector(
    (state: RootState) => state.auth.AWS_SECRET_ACCESS_KEY,
  );
  const region = useSelector((state: RootState) => state.auth.AWS_REGION);

  useEffect(() => {
    if (!awsAccessKeyId || !awsSecretAccessKey || !region) {
      navigate('/');
    }
  }, [awsAccessKeyId, awsSecretAccessKey, region, navigate]);

  return {
    hasCredentials: !!(awsAccessKeyId && awsSecretAccessKey && region),
  };
};
