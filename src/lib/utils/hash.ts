interface HashSubtle {
  digest: (algorithm: string, data: BufferSource) => Promise<ArrayBuffer>;
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function getSubtleCrypto(): Promise<HashSubtle> {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle as unknown as HashSubtle;
  }

  const cryptoModule = await import('node:crypto');
  return cryptoModule.webcrypto.subtle as unknown as HashSubtle;
}

export async function calculateSHA256Hash(input: Blob | ArrayBuffer): Promise<string> {
  const subtle = await getSubtleCrypto();
  const buffer = input instanceof ArrayBuffer ? input : await input.arrayBuffer();
  const digest = await subtle.digest('SHA-256', buffer);
  return bufferToHex(digest);
}
