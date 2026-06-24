function getPasswordSalt(): string {
  const viteSalt = import.meta.env?.VITE_PASSWORD_SALT;
  if (viteSalt) return viteSalt;
  if (typeof process !== "undefined" && process.env.VITE_PASSWORD_SALT) {
    return process.env.VITE_PASSWORD_SALT;
  }
  return "default-salt-change-in-production";
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPassword(password: string): Promise<string> {
  const saltedPassword = `${password}${getPasswordSalt()}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(saltedPassword);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hashBuffer);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
