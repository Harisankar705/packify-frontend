import { useAuth } from '@/contexts/AuthContext';
import { getGoogleCredential } from '@/utils/googleAuth';

export const useGoogleAuth = () => {
  const { googleLogin } = useAuth();

  const handleGoogleAuth = async () => {
    const token = await getGoogleCredential();
    await googleLogin(token);
  };

  return { handleGoogleAuth };
};
