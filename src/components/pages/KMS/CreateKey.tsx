import { Button } from '@/components/ui/button';
import type { RootState } from '@/store';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
// import {
//   KmsKeyringBrowser,
//   KMS,
//   getClient,
//   buildClient,
//   CommitmentPolicy,
// } from '@aws-crypto/client-browser';
// import { toBase64 } from '@aws-sdk/util-base64-browser';
import { KMSClient, CreateKeyCommand } from '@aws-sdk/client-kms';

async function createAKey(
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
) {
  try {
    // Create KMS client with permanent credentials directly
    const client = new KMSClient({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    const input = {
      KeyUsage: 'ENCRYPT_DECRYPT' as const,
      KeySpec: 'RSA_2048' as const,
      Origin: 'AWS_KMS' as const,
      BypassPolicyLockoutSafetyCheck: false,
      Tags: [],
      MultiRegion: false,
    };

    const command = new CreateKeyCommand(input);
    const response = await client.send(command);

    console.log('KMS Key created successfully:', response);
    return response.KeyMetadata?.KeyId;
  } catch (error) {
    console.error('Error creating KMS key:', error);
    throw error;
  }
}
function CreateKey() {
  const { hasCredentials } = useAuthRedirect();
  const awsAccessKeyId = useSelector(
    (state: RootState) => state.auth.AWS_ACCESS_KEY_ID,
  );
  const awsSecretAccessKey = useSelector(
    (state: RootState) => state.auth.AWS_SECRET_ACCESS_KEY,
  );
  const region = useSelector((state: RootState) => state.auth.AWS_REGION);
  const navigate = useNavigate();
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!hasCredentials) {
    return null; // Will redirect to home
  }

  const handleCreateKey = async () => {
    if (!awsAccessKeyId || !awsSecretAccessKey || !region) {
      toast.error('Please provide all AWS credentials');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedKey(null);

    try {
      const key = await createAKey(awsAccessKeyId, awsSecretAccessKey, region);
      setGeneratedKey(key || 'Key created but ID not returned');
      toast.success('KMS key created successfully!');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to create key: ${errorMessage}`);
      toast.error(`Failed to create key: ${errorMessage}`);
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

      <Button
        onClick={handleCreateKey}
        disabled={isLoading}
        variant='action'
        className='w-full'
      >
        {isLoading ? 'Creating...' : 'Create Key'}
      </Button>

      {generatedKey && (
        <div className='text-white mt-5 text-2xl wrap-break-word max-w-[300px]'>
          Generated Key: {generatedKey}
        </div>
      )}

      {error && (
        <div className='text-red-400 mt-5 text-lg wrap-break-word max-w-[400px]'>
          Error: {error}
        </div>
      )}
    </div>
  );
}

export { CreateKey };
