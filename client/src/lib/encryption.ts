import CryptoJS from "crypto-js";

export class AdvancedEncryption {
  private static deriveKey(masterPassword: string, salt: string): string {
    // Use PBKDF2 for key derivation with high iteration count
    return CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 100000,
    }).toString();
  }

  static encrypt(plaintext: string, masterPassword: string): string {
    try {
      // Generate random salt and IV
      const salt = CryptoJS.lib.WordArray.random(256 / 8);
      const iv = CryptoJS.lib.WordArray.random(128 / 8);
      
      // Derive key from master password and salt
      const key = this.deriveKey(masterPassword, salt.toString());
      
      // Encrypt the plaintext
      const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      
      // Combine salt, iv, and encrypted data
      const combined = salt.concat(iv).concat(encrypted.ciphertext);
      return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
      console.error("Encryption failed:", error);
      throw new Error("Failed to encrypt data");
    }
  }

  static decrypt(ciphertext: string, masterPassword: string): string {
    try {
      // Parse the combined data
      const combined = CryptoJS.enc.Base64.parse(ciphertext);
      
      // Extract salt (first 32 bytes), IV (next 16 bytes), and encrypted data
      const salt = CryptoJS.lib.WordArray.create(combined.words.slice(0, 8));
      const iv = CryptoJS.lib.WordArray.create(combined.words.slice(8, 12));
      const encrypted = CryptoJS.lib.WordArray.create(combined.words.slice(12));
      
      // Derive key from master password and salt
      const key = this.deriveKey(masterPassword, salt.toString());
      
      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encrypted } as any,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("Failed to decrypt data - invalid master password or corrupted data");
    }
  }

  static generateSecurePassword(length: number = 16): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let password = "";
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }

  static calculatePasswordStrength(password: string): number {
    let score = 0;
    
    // Length scoring
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    
    // Character variety scoring
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    // Bonus for very long passwords
    if (password.length >= 20) score++;
    
    return Math.min(4, score);
  }
}
