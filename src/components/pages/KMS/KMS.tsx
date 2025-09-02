import BlurText from '../../Simple/BlurText/BlurText';
import { Outlet } from 'react-router';

function KMS() {
  return (
    <div className='w-full h-full flex flex-col items-center justify-center'>
      <BlurText
        text='Welcome to KMS demo'
        delay={70}
        animateBy='letters'
        direction='bottom'
        className='text-5xl mb-8 text-white'
      />
      <Outlet />
    </div>
  );
}

export { KMS };
