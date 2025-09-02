import { ArrowRight } from 'lucide-react';
import BlurText from '../Simple/BlurText/BlurText';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router';

function ChooseService() {
  const navigate = useNavigate();
  return (
    <div className='w-full h-full flex flex-col items-center justify-center'>
      <BlurText
        text='Choose Service'
        delay={70}
        animateBy='letters'
        direction='bottom'
        className='text-5xl mb-8 text-white'
      />
      <div className='flex flex-col justify-center gap-3 mt-5 items-stretch w-[300px]'>
        <Button
          className='bg-white/20 border border-white hover:text-black hover:bg-white group hover:scale-105 transition-all duration-300 w-full'
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
