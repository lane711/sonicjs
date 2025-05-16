export function uuid() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
      (
        +c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
      ).toString(16)
    );
  }

  export function generateRandomString(length: number): string {
    const urlSafeChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    let result = '';
    
    for (let i = 0; i < length; i++) {
      // Map the random byte to our character set
      result += urlSafeChars[randomValues[i] % urlSafeChars.length];
    }
    
    return result;
  }
  
  export function convertFormDataToObject(formData) {
    var object = {};
    formData.forEach((value, key) => {
      // Reflect.has in favor of: object.hasOwnProperty(key)
      if (!Reflect.has(object, key)) {
        object[key] = value;
        return;
      }
      if (!Array.isArray(object[key])) {
        object[key] = [object[key]];
      }
      object[key].push(value);
    });
    return object;
  }
  
  export const getEntryByRoute = (apiConfig, route) => {
    return apiConfig.find((tbl) => tbl.route === route);
  };
  