import { ArrowRight, ArrowLeft } from 'lucide-react';
import BlurText from '../Simple/BlurText/BlurText';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

function ChooseService() {
  const { hasCredentials } = useAuthRedirect();
  const navigate = useNavigate();

  if (!hasCredentials) {
    return null; // Will redirect to home
  }

  return (
    <div className='w-full h-full flex flex-col items-center justify-center'>
      <Button
        onClick={() => navigate('/')}
        variant='back'
        className='mb-8 absolute top-4 left-4'
      >
        <ArrowLeft className='w-4 h-4 mr-2' />
        Back to Home
      </Button>

      <BlurText
        text='Choose Service'
        delay={70}
        animateBy='letters'
        direction='bottom'
        className='text-5xl mb-8 text-white'
      />
      <div className='flex flex-col justify-center gap-3 mt-5 items-stretch w-[300px] max-w-sm mx-auto bg-black/30 p-8 rounded-xl border border-white/10'>
        <Button
          variant='action'
          className='w-full'
          onClick={() => {
            navigate('/kms');
          }}
        >
          KMS
          <ArrowRight className='w-4 h-4 group-hover:translate-x-5 transition-all duration-300' />
        </Button>
      </div>
    </div>
  );
}

export { ChooseService };
