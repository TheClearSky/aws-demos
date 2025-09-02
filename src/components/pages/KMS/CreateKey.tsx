import AWS from 'aws-sdk';
import {
  KmsKeyringBrowser,
  KMS,
  getClient,
  buildClient,
  CommitmentPolicy,
} from '@aws-crypto/client-browser';
import { toBase64 } from '@aws-sdk/util-base64-browser';
import { KMSClient, CreateKeyCommand } from "@aws-sdk/client-kms";

async function createAKey(
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
) {
  // Configure AWS region and credentials (if not already set via environment variables or shared credentials file)
  AWS.config.update({
    region: region, // e.g., 'us-east-1'
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  });

  const sts = new AWS.STS();

  const params = {
    // Optional: Duration in seconds for the temporary credentials. Default is 1 hour (3600 seconds).
    // Max for IAM users is 36 hours (129600 seconds), for account credentials is 1 hour (3600 seconds).
    DurationSeconds: 3600,
    // Optional: If MFA is enabled and required, provide the MFA device ARN and the MFA token.
    // SerialNumber: 'arn:aws:iam::123456789012:mfa/user',
    // TokenCode: '123456'
  };
  const data = await sts.getSessionToken(params).promise();
  if (!data.Credentials) {
    return;
  }

  const client = new KMSClient({
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      sessionToken: data.Credentials.SessionToken,
    },
  });

//   const input = { // CreateKeyRequest
//     Policy: "STRING_VALUE",
//     Description: "STRING_VALUE",
//     KeyUsage: "SIGN_VERIFY" || "ENCRYPT_DECRYPT" || "GENERATE_VERIFY_MAC" || "KEY_AGREEMENT",
//     CustomerMasterKeySpec: "RSA_2048" || "RSA_3072" || "RSA_4096" || "ECC_NIST_P256" || "ECC_NIST_P384" || "ECC_NIST_P521" || "ECC_SECG_P256K1" || "SYMMETRIC_DEFAULT" || "HMAC_224" || "HMAC_256" || "HMAC_384" || "HMAC_512" || "SM2",
//     KeySpec: "RSA_2048" || "RSA_3072" || "RSA_4096" || "ECC_NIST_P256" || "ECC_NIST_P384" || "ECC_NIST_P521" || "ECC_SECG_P256K1" || "SYMMETRIC_DEFAULT" || "HMAC_224" || "HMAC_256" || "HMAC_384" || "HMAC_512" || "SM2" || "ML_DSA_44" || "ML_DSA_65" || "ML_DSA_87",
//     Origin: "AWS_KMS" || "EXTERNAL" || "AWS_CLOUDHSM" || "EXTERNAL_KEY_STORE",
//     CustomKeyStoreId: "STRING_VALUE",
//     BypassPolicyLockoutSafetyCheck: true || false,
//     Tags: [ // TagList
//       { // Tag
//         TagKey: "STRING_VALUE", // required
//         TagValue: "STRING_VALUE", // required
//       },
//     ],
//     MultiRegion: true || false,
//     XksKeyId: "STRING_VALUE",
//   };
//   const command = new CreateKeyCommand(input);
//   const response = await client.send(command);

}
function CreateKey() {
  return <div>CreateKey</div>;
}

export { CreateKey };
