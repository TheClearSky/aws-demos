import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

const generateKeyPolicy = (
  userArns: string[],
  keyOwnerArn: string,
  keyType: 'symmetric' | 'asymmetric',
): string => {
  // Define actions based on key type
  const userActions =
    keyType === 'symmetric'
      ? [
          'kms:Encrypt',
          'kms:Decrypt',
          'kms:GenerateDataKey',
          'kms:GenerateDataKeyWithoutPlaintext',
          'kms:DescribeKey',
        ]
      : ['kms:Sign', 'kms:Verify', 'kms:GetPublicKey', 'kms:DescribeKey'];

  return JSON.stringify({
    Version: '2012-10-17',
    Id: 'key-use-policy',
    Statement: [
      {
        Sid: 'Enable IAM User Permissions',
        Effect: 'Allow',
        Principal: {
          AWS: keyOwnerArn,
        },
        Action: 'kms:*',
        Resource: '*',
      },
      {
        Sid: 'AllowUserKeyUsage',
        Effect: 'Allow',
        Principal:
          userArns.length === 1 ? { AWS: userArns[0] } : { AWS: userArns },
        Action: userActions,
        Resource: '*',
      },
    ],
  });
};

const validateAccountId = (accountId: string): boolean => {
  return /^\d{12}$/.test(accountId);
};

const validateUserArn = (arn: string): boolean => {
  const userArnPattern =
    /^arn:aws:iam::\d{12}:(user|role)\/[a-zA-Z0-9+=,.@_-]+$/;
  return userArnPattern.test(arn);
};

const constructUserArn = (accountId: string, username: string): string => {
  return `arn:aws:iam::${accountId}:user/${username}`;
};

const getCurrentUserArn = async (
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
): Promise<string> => {
  try {
    const stsClient = new STSClient({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    const command = new GetCallerIdentityCommand({});
    const response = await stsClient.send(command);

    return response.Arn || '';
  } catch (error) {
    console.error('Error getting current user ARN:', error);
    throw error;
  }
};

async function createAKey(
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  userArns: string[],
  keySpec: string,
  keyUsage: 'ENCRYPT_DECRYPT' | 'SIGN_VERIFY',
  keyType: 'symmetric' | 'asymmetric',
) {
  try {
    // Get current user ARN for key ownership
    const currentUserArn = await getCurrentUserArn(
      accessKeyId,
      secretAccessKey,
      region,
    );

    // Create KMS client with permanent credentials directly
    const client = new KMSClient({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    // Generate key policy for the specified users and current user
    const keyPolicy = generateKeyPolicy(userArns, currentUserArn, keyType);

    const input = {
      KeyUsage: keyUsage,
      KeySpec: keySpec as any,
      Origin: 'AWS_KMS' as const,
      BypassPolicyLockoutSafetyCheck: false,
      Tags: [],
      MultiRegion: false,
      Policy: keyPolicy,
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
  const [accountId, setAccountId] = useState('');
  const [userInput, setUserInput] = useState('');
  const [keyType, setKeyType] = useState<'symmetric' | 'asymmetric'>(
    'symmetric',
  );
  const [keySpec, setKeySpec] = useState<string>('SYMMETRIC_DEFAULT');

  if (!hasCredentials) {
    return null; // Will redirect to home
  }

  const handleCreateKey = async () => {
    if (!awsAccessKeyId || !awsSecretAccessKey || !region) {
      toast.error('Please provide all AWS credentials');
      return;
    }

    if (!accountId.trim()) {
      toast.error('Please enter AWS Account ID');
      return;
    }

    if (!validateAccountId(accountId)) {
      toast.error('AWS Account ID must be 12 digits');
      return;
    }

    if (!userInput.trim()) {
      toast.error('Please enter at least one user ARN or username');
      return;
    }

    // Parse user input - support both ARNs and usernames
    const userLines = userInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);
    const userArns: string[] = [];

    for (const line of userLines) {
      if (validateUserArn(line)) {
        // It's already a valid ARN
        userArns.push(line);
      } else {
        // Assume it's a username, construct the ARN
        const username = line;
        if (!/^[a-zA-Z0-9+=,.@_-]+$/.test(username)) {
          toast.error(`Invalid username format: ${username}`);
          return;
        }
        userArns.push(constructUserArn(accountId, username));
      }
    }

    if (userArns.length === 0) {
      toast.error('No valid users specified');
      return;
    }

    // Determine key usage based on key type
    const keyUsage =
      keyType === 'symmetric' ? 'ENCRYPT_DECRYPT' : 'SIGN_VERIFY';

    setIsLoading(true);
    setError(null);
    setGeneratedKey(null);

    try {
      const key = await createAKey(
        awsAccessKeyId,
        awsSecretAccessKey,
        region,
        userArns,
        keySpec,
        keyUsage,
        keyType,
      );
      setGeneratedKey(key || 'Key created but ID not returned');
      toast.success(
        `KMS ${keyType} key created successfully! Users with access: ${userArns.length}`,
      );
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

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='key-type'>Key Type</Label>
          <Select
            value={keyType}
            onValueChange={(value: 'symmetric' | 'asymmetric') => {
              setKeyType(value);
              // Set default key spec based on type
              if (value === 'symmetric') {
                setKeySpec('SYMMETRIC_DEFAULT');
              } else {
                setKeySpec('RSA_2048');
              }
            }}
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='symmetric'>
                Symmetric (Encrypt/Decrypt)
              </SelectItem>
              <SelectItem value='asymmetric'>
                Asymmetric (Sign/Verify)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className='text-sm text-white/60'>
            {keyType === 'symmetric'
              ? 'Symmetric keys are used for encryption and decryption operations'
              : 'Asymmetric keys are used for digital signing and verification'}
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='key-spec'>Key Specification</Label>
          <Select value={keySpec} onValueChange={setKeySpec}>
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {keyType === 'symmetric' ? (
                <>
                  <SelectItem value='SYMMETRIC_DEFAULT'>
                    SYMMETRIC_DEFAULT (Default symmetric key)
                  </SelectItem>
                  <SelectItem value='HMAC_224'>
                    HMAC_224 (224-bit HMAC key)
                  </SelectItem>
                  <SelectItem value='HMAC_256'>
                    HMAC_256 (256-bit HMAC key)
                  </SelectItem>
                  <SelectItem value='HMAC_384'>
                    HMAC_384 (384-bit HMAC key)
                  </SelectItem>
                  <SelectItem value='HMAC_512'>
                    HMAC_512 (512-bit HMAC key)
                  </SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value='RSA_2048'>
                    RSA_2048 (2048-bit RSA key)
                  </SelectItem>
                  <SelectItem value='RSA_3072'>
                    RSA_3072 (3072-bit RSA key)
                  </SelectItem>
                  <SelectItem value='RSA_4096'>
                    RSA_4096 (4096-bit RSA key)
                  </SelectItem>
                  <SelectItem value='ECC_NIST_P256'>
                    ECC_NIST_P256 (P-256 elliptic curve)
                  </SelectItem>
                  <SelectItem value='ECC_NIST_P384'>
                    ECC_NIST_P384 (P-384 elliptic curve)
                  </SelectItem>
                  <SelectItem value='ECC_NIST_P521'>
                    ECC_NIST_P521 (P-521 elliptic curve)
                  </SelectItem>
                  <SelectItem value='ECC_SECG_P256K1'>
                    ECC_SECG_P256K1 (secp256k1 elliptic curve)
                  </SelectItem>
                  <SelectItem value='SM2'>SM2 (SM2 elliptic curve)</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='account-id'>AWS Account ID</Label>
          <Input
            id='account-id'
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder='123456789012'
            className='font-mono'
          />
          <p className='text-sm text-white/60'>
            Enter your 12-digit AWS Account ID
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='users'>Users with Key Access</Label>
          <Textarea
            id='users'
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={`username1\nusername2\narn:aws:iam::123456789012:user/username3\narn:aws:iam::123456789012:role/rolename`}
            className='min-h-[120px] font-mono text-sm'
          />
          <p className='text-sm text-white/60'>
            Enter usernames or full ARNs (one per line). Users will have
            permissions to{' '}
            {keyType === 'symmetric'
              ? 'encrypt, decrypt, and generate data keys'
              : 'sign, verify, and get public key'}
            .
          </p>
        </div>

        <Button
          onClick={handleCreateKey}
          disabled={isLoading || !accountId.trim() || !userInput.trim()}
          variant='action'
          className='w-full'
        >
          {isLoading
            ? 'Creating...'
            : `Create ${keyType === 'symmetric' ? 'Symmetric' : 'Asymmetric'} Key with User Access`}
        </Button>
      </div>

      {generatedKey && (
        <div className='space-y-2'>
          <Label>Generated Key ID</Label>
          <div className='text-white text-lg font-mono bg-black/20 p-3 rounded border border-white/10 break-all'>
            {generatedKey}
          </div>
        </div>
      )}

      {error && (
        <div className='text-red-400 text-lg max-w-2xl'>Error: {error}</div>
      )}
    </div>
  );
}

export { CreateKey };
