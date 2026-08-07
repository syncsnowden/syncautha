const ENCRYPTION_KEY = process.env.JWT_SECRET || "syncauth-jwt-secret-key-32-chars-long!";

export function encryptWebhook(text: string): string {
  let xor = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    xor += String.fromCharCode(charCode);
  }
  // Convert to base64, then hex to match URL safe structure and avoid issues
  const b64 = btoa(xor);
  let hex = "";
  for (let i = 0; i < b64.length; i++) {
    hex += b64.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return "v2:" + hex;
}

export function decryptWebhook(text: string): string {
  if (text.startsWith("v2:")) {
    const hex = text.slice(3);
    let b64 = "";
    for (let i = 0; i < hex.length; i += 2) {
      b64 += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    const xor = atob(b64);
    let decrypted = "";
    for (let i = 0; i < xor.length; i++) {
      decrypted += String.fromCharCode(xor.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return decrypted;
  }
  return "";
}
