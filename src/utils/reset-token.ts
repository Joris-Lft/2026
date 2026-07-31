const TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

interface ResetTokenPayload {
  email: string;
  exp: number; // timestamp ms d'expiration
}

export type VerifyResult =
  | { valid: true; email: string }
  | { valid: false; reason: "malformed" | "bad-signature" | "expired" };

function getResetSecret(): string {
  const viteSecret = import.meta.env?.VITE_RESET_TOKEN_SECRET;
  if (viteSecret) return viteSecret;
  if (typeof process !== "undefined" && process.env.VITE_RESET_TOKEN_SECRET) {
    return process.env.VITE_RESET_TOKEN_SECRET;
  }
  return "default-reset-secret-change-in-production";
}

// base64url sans padding, compatible avec un query param d'URL
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padding = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/") + padding);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getHmacKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getResetSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function sign(data: string): Promise<string> {
  const key = await getHmacKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

// Comparaison à temps constant pour éviter les timing attacks sur la signature
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function generateResetToken(email: string): Promise<string> {
  const payload: ResetTokenPayload = { email, exp: Date.now() + TOKEN_TTL_MS };
  const payloadB64 = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const signature = await sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export async function verifyResetToken(token: string): Promise<VerifyResult> {
  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, reason: "malformed" };
  }
  const [payloadB64, signature] = parts;

  // On valide la signature AVANT de faire confiance au contenu du payload
  const expectedSignature = await sign(payloadB64);
  if (!timingSafeEqual(signature, expectedSignature)) {
    return { valid: false, reason: "bad-signature" };
  }

  let payload: ResetTokenPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)));
  } catch {
    return { valid: false, reason: "malformed" };
  }

  if (typeof payload.exp !== "number" || Date.now() > payload.exp) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true, email: payload.email };
}
