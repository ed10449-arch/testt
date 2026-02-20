const PASSWORD_HASH =
  "caaf270a80c67e71173cc32120e46364d8a9e0c538073acd425234de11f447ca";

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(plainText: string): Promise<boolean> {
  const normalized = plainText.trim();
  if (!normalized) {
    return false;
  }

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(normalized),
  );
  return toHex(digest) === PASSWORD_HASH;
}
