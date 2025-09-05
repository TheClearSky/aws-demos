import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

function Menu() {
  const { hasCredentials } = useAuthRedirect();
  const navigate = useNavigate();

  if (!hasCredentials) {
    return null; // Will redirect to home
  }

  return (
    <div className='flex flex-col justify-center gap-3 mt-5 items-stretch w-[300px] max-w-sm mx-auto bg-black/30 p-8 rounded-xl border border-white/10'>
      <Button
        onClick={() => navigate('/choose-service')}
        variant='back'
        className='mb-4 self-start'
      >
        <ArrowLeft className='w-4 h-4 mr-2' />
        Back to Services
      </Button>
      <Button
        variant='action'
        className='w-full'
        onClick={() => {
          navigate('/kms/create-key');
        }}
      >
        Create Key
        <ArrowRight className='w-4 h-4 group-hover:translate-x-5 transition-all duration-300' />
      </Button>
      <Button
        variant='action'
        className='w-full'
        onClick={() => {
          navigate('/kms/generate-data-key');
        }}
      >
        Generate Data Key
        <ArrowRight className='w-4 h-4 group-hover:translate-x-5 transition-all duration-300' />
      </Button>
      <Button
        variant='action'
        className='w-full'
        onClick={() => {
          navigate('/kms/encrypt-data');
        }}
      >
        Encrypt Data
        <ArrowRight className='w-4 h-4 group-hover:translate-x-5 transition-all duration-300' />
      </Button>
      <Button
        variant='action'
        className='w-full'
        onClick={() => {
          navigate('/kms/decrypt-data');
        }}
      >
        Decrypt Data
        <ArrowRight className='w-4 h-4 group-hover:translate-x-5 transition-all duration-300' />
      </Button>
    </div>
  );
}

export { Menu };
