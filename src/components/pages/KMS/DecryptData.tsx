import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RootState } from '@/store';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms';

async function decryptData(
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  ciphertextBlob: Uint8Array,
) {
  try {
    const client = new KMSClient({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    const input = {
      CiphertextBlob: ciphertextBlob,
    };

    const command = new DecryptCommand(input);
    const response = await client.send(command);

    console.log('Data decrypted successfully:', response);
    return response.Plaintext;
  } catch (error) {
    console.error('Error decrypting data:', error);
    throw error;
  }
}

function DecryptData() {
  const { hasCredentials } = useAuthRedirect();
  const awsAccessKeyId = useSelector(
    (state: RootState) => state.auth.AWS_ACCESS_KEY_ID,
  );
  const awsSecretAccessKey = useSelector(
    (state: RootState) => state.auth.AWS_SECRET_ACCESS_KEY,
  );
  const region = useSelector((state: RootState) => state.auth.AWS_REGION);
  const navigate = useNavigate();

  const [ciphertextBase64, setCiphertextBase64] = useState('');
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!hasCredentials) {
    return null; // Will redirect to home
  }

  const handleDecrypt = async () => {
    if (!awsAccessKeyId || !awsSecretAccessKey || !region) {
      toast.error('Please provide all AWS credentials');
      return;
    }

    if (!ciphertextBase64.trim()) {
      toast.error('Please enter encrypted data to decrypt');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDecryptedData(null);

    try {
      // Convert base64 string back to Uint8Array
      const binaryString = atob(ciphertextBase64);
      const ciphertextBlob = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        ciphertextBlob[i] = binaryString.charCodeAt(i);
      }

      const decrypted = await decryptData(
        awsAccessKeyId,
        awsSecretAccessKey,
        region,
        ciphertextBlob,
      );

      if (decrypted) {
        setDecryptedData(new TextDecoder().decode(decrypted));
        toast.success('Data decrypted successfully!');
      } else {
        setError('No decrypted data returned');
        toast.error('No decrypted data returned');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to decrypt data: ${errorMessage}`);
      toast.error(`Failed to decrypt data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-6 max-w-4xl mx-auto px-4 bg-black/30 p-8 rounded-xl border border-white/10'>
      <Button onClick={() => navigate('/kms')} variant='back' className='mb-4'>
        <ArrowLeft className='w-4 h-4 mr-2' />
        Back to KMS Menu
      </Button>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='ciphertext'>Encrypted Data (Base64)</Label>
          <Textarea
            id='ciphertext'
            value={ciphertextBase64}
            onChange={(e) => setCiphertextBase64(e.target.value)}
            placeholder='Paste the base64-encoded encrypted data here...'
            className='min-h-[100px] font-mono text-sm'
          />
        </div>

        <Button
          onClick={handleDecrypt}
          disabled={isLoading || !ciphertextBase64.trim()}
          variant='action'
          className='w-full'
        >
          {isLoading ? 'Decrypting...' : 'Decrypt Data'}
        </Button>
      </div>

      {decryptedData && (
        <div className='space-y-2 max-w-2xl'>
          <Label>Decrypted Data</Label>
          <Textarea value={decryptedData} readOnly className='min-h-[100px]' />
        </div>
      )}

      {error && (
        <div className='text-red-400 text-lg max-w-2xl'>Error: {error}</div>
      )}
    </div>
  );
}

export { DecryptData };
