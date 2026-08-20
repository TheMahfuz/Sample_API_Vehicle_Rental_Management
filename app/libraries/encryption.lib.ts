/**
 * Encryption Module
 * 
 * This module provides functions for encrypting and decrypting data using the AES algorithm.
 * 
 * Prerequisites:
 * - Ensure that the ENCRYPTION_KEY is set in your .env file for the encryption to work.
 * 
 * Usage Example:
 * 
 * import { encrypt, decrypt } from './path/to/encryption.lib';
 * 
 * const secretMessage = "Hello, World!";
 * const encryptedMessage = encrypt(secretMessage);
 * console.log("Encrypted:", encryptedMessage);
 * 
 * const decryptedMessage = decrypt(encryptedMessage);
 * console.log("Decrypted:", decryptedMessage); // Outputs: Hello, World!
 */

import CryptoJS from 'crypto-js';
const key = process.env.ENCRYPTION_KEY as string; // Ensure the key is set in your .env file

export const encrypt = (text: string): string => {
    return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (ciphertext: string): string => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
};

export const toBase64Str = (str: string): string => {
    // First, encode the string to Base64
    let base64 = btoa(str);
    // Replace '+' with '-', '/' with '_', and remove any '=' padding
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return base64;
}

export const fromBase64Str = (base64Str: string) => {
    const decodedPayload = atob(base64Str.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);
}