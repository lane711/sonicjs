export const hashString = async (input: string): Promise<string> => {

    const stringToHash = new TextEncoder().encode(input);

    const digest = await crypto.subtle.digest(
      {
        name: 'SHA-256',
      },
      stringToHash // The data you want to hash as an ArrayBuffer
    );
    
    const hexString = [...new Uint8Array(digest)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return hexString;
}

export const compareStringToHash = async (input: string, hash: string): Promise<boolean> => {
    const hashedInput = await hashString(input);
    return hashedInput === hash;
}