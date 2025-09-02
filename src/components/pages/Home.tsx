import { useState } from 'react';
import BlurText from '../Simple/BlurText/BlurText';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { setAccessKeyId } from '@/features/auth/authSlice';
import { setSecretAccessKey } from '@/features/auth/authSlice';
import { useDispatch } from 'react-redux';
import FadeContent from '../Simple/FadeContent/FadeContent';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';

function Home() {
  const [awsAccessKeyId, setAwsAccessKeyId] = useState('');
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <div className='w-full h-full flex flex-col items-center justify-center'>
      <BlurText
        text='Welcome to AWS demos!!'
        delay={70}
        animateBy='letters'
        direction='top'
        className='text-5xl mb-8 text-white'
      />
      <FadeContent blur duration={1000} delay={2000}>
        <div className='flex flex-col justify-center gap-3 mt-5'>
          <Label htmlFor='aws-access-key-id'>AWS Access Key ID</Label>
          <Input
            id='aws-access-key-id'
            value={awsAccessKeyId}
            onChange={(e) => setAwsAccessKeyId(e.target.value)}
          />
          <Label htmlFor='aws-secret-access-key'>AWS Secret Access Key</Label>
          <Input
            id='aws-secret-access-key'
            value={awsSecretAccessKey}
            onChange={(e) => setAwsSecretAccessKey(e.target.value)}
          />
          <Button
            onClick={() => {
              dispatch(setAccessKeyId(awsAccessKeyId));
              dispatch(setSecretAccessKey(awsSecretAccessKey));
              navigate('/choose-service');
            }}
            className='bg-white/20 border border-white hover:text-black hover:bg-white group hover:scale-105 transition-all duration-300'
          >
            Login
            <ArrowRight className='w-4 h-4 group-hover:translate-x-5 transition-all duration-300' />
          </Button>
        </div>
      </FadeContent>
    </div>
  );
}

export { Home };
