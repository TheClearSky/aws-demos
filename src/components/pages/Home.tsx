import { useState } from 'react';
import BlurText from '../Simple/BlurText/BlurText';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { setAccessKeyId, setRegion } from '@/features/auth/authSlice';
import { setSecretAccessKey } from '@/features/auth/authSlice';
import { useDispatch } from 'react-redux';
import FadeContent from '../Simple/FadeContent/FadeContent';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

function Home() {
  const [awsAccessKeyId, setAwsAccessKeyId] = useState('');
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState('');
  const [awsRegion, setAwsRegion] = useState('');
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
        <div className='flex flex-col justify-center gap-3 mt-5 max-w-md mx-auto bg-black/30 p-8 rounded-xl border border-white/10'>
          <Label htmlFor='aws-access-key-id'>AWS Access Key ID</Label>
          <Input
            id='aws-access-key-id'
            value={awsAccessKeyId}
            onChange={(e) => setAwsAccessKeyId(e.target.value)}
          />
          <Label htmlFor='aws-secret-access-key'>AWS Secret Access Key</Label>
          <Input
            id='aws-secret-access-key'
            type='password'
            value={awsSecretAccessKey}
            onChange={(e) => setAwsSecretAccessKey(e.target.value)}
          />
          <Label htmlFor='aws-region'>AWS Region</Label>
          <Input
            id='aws-region'
            value={awsRegion}
            onChange={(e) => setAwsRegion(e.target.value)}
          />
          <Button
            onClick={() => {
              if (
                !awsAccessKeyId.trim() ||
                !awsSecretAccessKey.trim() ||
                !awsRegion.trim()
              ) {
                toast.error('Please fill in all AWS credentials');
                return;
              }

              dispatch(setAccessKeyId(awsAccessKeyId));
              dispatch(setSecretAccessKey(awsSecretAccessKey));
              dispatch(setRegion(awsRegion));

              toast.success(
                'AWS credentials saved in-memory! Note: Credentials will be lost when you refresh the page.',
              );
              navigate('/choose-service');
            }}
            variant='action'
          >
            Login
            <ArrowRight className='w-4 h-4 group-hover:translate-x-5 transition-all duration-300' />
          </Button>

          <div className='text-center mt-4'>
            <p className='text-white/60 text-sm'>
              ⚠️ Credentials are stored in-memory only and will be lost on page
              refresh
            </p>
          </div>
        </div>
      </FadeContent>
    </div>
  );
}

export { Home };
