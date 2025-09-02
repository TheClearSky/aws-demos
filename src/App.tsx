import { Route, Routes } from 'react-router';
import DotGrid from './components/Backgrounds/DotGrid/DotGrid';
import { Home } from './components/pages/Home';
import { ChooseService } from './components/pages/ChooseService';
import { KMS } from './components/pages/KMS/KMS';
import { CreateKey } from './components/pages/KMS/CreateKey';
import { GenerateDataKey } from './components/pages/KMS/GenerateDataKey';
import { Menu } from './components/pages/KMS/Menu';

function App() {
  return (
    <div className='w-screen h-screen bg-[#020006] relative'>
      <div className='w-full h-full relative z-10'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/choose-service' element={<ChooseService />} />
          <Route path='/kms' element={<KMS />}>
            <Route index element={<Menu />} />
            <Route path='/kms/create-key' element={<CreateKey />} />
            <Route
              path='/kms/generate-data-key'
              element={<GenerateDataKey />}
            />
          </Route>
        </Routes>
      </div>
      <div className='w-full h-full absolute top-0 left-0'>
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor='#0e0b14'
          activeColor='#1e0e5e'
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
    </div>
  );
}

export default App;
