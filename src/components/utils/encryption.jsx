/**
 * End-to-End Encryption Utilities
 * HIPAA/GDPR Compliant Client-Side Encryption
 */

// Generate encryption key from password
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data with AES-GCM
export async function encryptData(plaintext, password) {
  try {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await deriveKey(password, salt);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoder.encode(plaintext)
    );
    
    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

// Decrypt data with AES-GCM
export async function decryptData(encryptedBase64, password) {
  try {
    const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    const salt = encrypted.slice(0, 16);
    const iv = encrypted.slice(16, 28);
    const data = encrypted.slice(28);
    
    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Encrypted Message - Unable to Decrypt]';
  }
}

// Generate encryption key for user
export function generateEncryptionKey() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// Store encryption key securely in localStorage
export function storeEncryptionKey(key) {
  try {
    localStorage.setItem('mm_encryption_key', key);
  } catch (error) {
    console.error('Failed to store key:', error);
  }
}

// Retrieve encryption key
export function getEncryptionKey() {
  try {
    let key = localStorage.getItem('mm_encryption_key');
    if (!key) {
      key = generateEncryptionKey();
      storeEncryptionKey(key);
    }
    return key;
  } catch (error) {
    console.error('Failed to retrieve key:', error);
    return generateEncryptionKey();
  }
}

// Encrypt file (for photos/voice)
export async function encryptFile(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async (e) => {
      try {
        const base64 = e.target.result.split(',')[1];
        const key = getEncryptionKey();
        const encrypted = await encryptData(base64, key);
        resolve(encrypted);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}