const PASSWORD_SALT = import.meta.env.VITE_PASSWORD_SALT || "default-salt-change-in-production";

export async function hashPassword(password: string): Promise<string> {
  const saltedPassword = `${password}${PASSWORD_SALT}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(saltedPassword);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
