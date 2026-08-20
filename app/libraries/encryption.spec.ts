import dotenv from 'dotenv';
dotenv.config();

import { encrypt, decrypt } from './encryption.lib'; // Adjust the path as necessary

describe('Encryption Module', () => {
    const secretMessage = "Hello, World!";
    let encryptedMessage: string;

    it('should encrypt a message', () => {
        encryptedMessage = encrypt(secretMessage);
        expect(encryptedMessage).not.toBe(secretMessage); // Ensure the encrypted message is not the same as the original
    });

    it('should decrypt the message back to original', () => {
        const decryptedMessage = decrypt(encryptedMessage);
        expect(decryptedMessage).toBe(secretMessage); // Ensure the decrypted message matches the original
    });

    it('should return an empty string when decrypting an invalid ciphertext', () => {
        const invalidCiphertext = "invalidCiphertext";
        const decryptedMessage = decrypt(invalidCiphertext);
        expect(decryptedMessage).toBe(''); // Ensure it returns an empty string for invalid input
    });
});
