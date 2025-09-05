import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RootState } from '@/store';
import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import {
  KMSClient,
  EncryptCommand,
  ListKeysCommand,
} from '@aws-sdk/client-kms';

async function encryptData(
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  plaintext: string,
  keyId: string,
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
      KeyId: keyId,
      Plaintext: new TextEncoder().encode(plaintext),
    };

    const command = new EncryptCommand(input);
    const response = await client.send(command);

    console.log('Data encrypted successfully:', response);
    return response.CiphertextBlob;
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw error;
  }
}

async function listKMSKeys(
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
) {
  try {
    const client = new KMSClient({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    const command = new ListKeysCommand({});
    const response = await client.send(command);

    return response.Keys || [];
  } catch (error) {
    console.error('Error listing KMS keys:', error);
    throw error;
  }
}

function EncryptData() {
  const { hasCredentials } = useAuthRedirect();
  const awsAccessKeyId = useSelector(
    (state: RootState) => state.auth.AWS_ACCESS_KEY_ID,
  );
  const awsSecretAccessKey = useSelector(
    (state: RootState) => state.auth.AWS_SECRET_ACCESS_KEY,
  );
  const region = useSelector((state: RootState) => state.auth.AWS_REGION);
  const navigate = useNavigate();

  const [plaintext, setPlaintext] = useState('');
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [availableKeys, setAvailableKeys] = useState<
    Array<{ KeyId?: string; KeyArn?: string }>
  >([]);
  const [encryptedData, setEncryptedData] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);

  const loadKeys = useCallback(async () => {
    if (!awsAccessKeyId || !awsSecretAccessKey || !region) {
      setError('Please provide all AWS credentials');
      return;
    }

    setIsLoadingKeys(true);
    setError(null);

    try {
      const keys = await listKMSKeys(
        awsAccessKeyId,
        awsSecretAccessKey,
        region,
      );
      setAvailableKeys(keys);
      if (keys.length === 0) {
        toast.warning('No KMS keys found. Create a key first.');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load keys: ${errorMessage}`);
      toast.error(`Failed to load keys: ${errorMessage}`);
    } finally {
      setIsLoadingKeys(false);
    }
  }, [awsAccessKeyId, awsSecretAccessKey, region]);

  useEffect(() => {
    if (hasCredentials) {
      loadKeys();
    }
  }, [hasCredentials, awsAccessKeyId, awsSecretAccessKey, region, loadKeys]);

  if (!hasCredentials) {
    return null; // Will redirect to home
  }

  const handleEncrypt = async () => {
    if (!awsAccessKeyId || !awsSecretAccessKey || !region) {
      toast.error('Please provide all AWS credentials');
      return;
    }

    if (!plaintext.trim()) {
      toast.error('Please enter text to encrypt');
      return;
    }

    if (!selectedKeyId) {
      toast.error('Please select a key');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEncryptedData(null);

    try {
      const encrypted = await encryptData(
        awsAccessKeyId,
        awsSecretAccessKey,
        region,
        plaintext,
        selectedKeyId,
      );
      setEncryptedData(encrypted || null);
      toast.success('Data encrypted successfully!');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to encrypt data: ${errorMessage}`);
      toast.error(`Failed to encrypt data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatEncryptedData = (data: Uint8Array) => {
    return btoa(String.fromCharCode(...data));
  };

  return (
    <div className='space-y-6 max-w-4xl mx-auto px-4 bg-black/30 p-8 rounded-xl border border-white/10'>
      <Button onClick={() => navigate('/kms')} variant='back' className='mb-4'>
        <ArrowLeft className='w-4 h-4 mr-2' />
        Back to KMS Menu
      </Button>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='key-select'>Select KMS Key</Label>
          <Select value={selectedKeyId} onValueChange={setSelectedKeyId}>
            <SelectTrigger className='w-full'>
              <SelectValue
                placeholder={isLoadingKeys ? 'Loading keys...' : 'Select a key'}
              />
            </SelectTrigger>
            <SelectContent>
              {availableKeys.map((key) => (
                <SelectItem key={key.KeyId} value={key.KeyId || ''}>
                  {key.KeyId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='plaintext'>Text to Encrypt</Label>
          <Textarea
            id='plaintext'
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            placeholder='Enter the text you want to encrypt...'
            className='min-h-[100px]'
          />
        </div>

        <Button
          onClick={handleEncrypt}
          disabled={isLoading || !plaintext.trim() || !selectedKeyId}
          variant='action'
          className='w-full'
        >
          {isLoading ? 'Encrypting...' : 'Encrypt Data'}
        </Button>
      </div>

      {encryptedData && (
        <div className='space-y-2 max-w-2xl'>
          <Label>Encrypted Data (Base64)</Label>
          <Textarea
            value={formatEncryptedData(encryptedData)}
            readOnly
            className='min-h-[100px] font-mono text-sm'
          />
        </div>
      )}

      {error && (
        <div className='text-red-400 text-lg max-w-2xl'>Error: {error}</div>
      )}
    </div>
  );
}

export { EncryptData };
