import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

function Menu() {
  const navigate = useNavigate();
  return (
    <div className='flex flex-col justify-center gap-3 mt-5 items-stretch w-[300px]'>
      <Button
        className='bg-white/20 border border-white hover:text-black hover:bg-white group hover:scale-105 transition-all duration-300 w-full'
        onClick={() => {
          navigate('/kms/create-key');
        }}
      >
        Create Key
        <ArrowRight className='w-4 h-4 group-hover:translate-x-5 transition-all duration-300' />
      </Button>
      <Button
        className='bg-white/20 border border-white hover:text-black hover:bg-white group hover:scale-105 transition-all duration-300 w-full'
        onClick={() => {
          navigate('/kms/generate-data-key');
        }}
      >
        Generate Data Key
        <ArrowRight className='w-4 h-4 group-hover:translate-x-5 transition-all duration-300' />
      </Button>
      <Button className='bg-white/20 border border-white hover:text-black hover:bg-white group hover:scale-105 transition-all duration-300 w-full'>
        Encrypt Data
        <ArrowRight className='w-4 h-4 group-hover:translate-x-5 transition-all duration-300' />
      </Button>
      <Button className='bg-white/20 border border-white hover:text-black hover:bg-white group hover:scale-105 transition-all duration-300 w-full'>
        Decrypt Data
        <ArrowRight className='w-4 h-4 group-hover:translate-x-5 transition-all duration-300' />
      </Button>
    </div>
  );
}

export { Menu };
