import { decode } from "@gz/jwt";

/**
 * Extracts and decodes the data from the authorization header of a request.
 * @param {Headers} headers - The request headers.
 * @returns {Promise<{ username: string, ucid: string } | null>} - An object containing username and UCID, or null if the token is invalid or missing.
 * @throws {Error} - Throws an error if the token decoding fails.
 */
export async function getUserInfoFromAuthHeader(
  headers: Headers,
): Promise<{ username: string; ucid: string } | null> {
  const authHeader = headers.get("authorization");

  if (!authHeader) {
    return null;
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const { username, ucid } = await decode(
      token,
      Deno.env.get("JWT_SECRET")!,
      {
        algorithm: "HS256",
      },
    );
    if (!username || !ucid) {
      throw new Error("Invalid token payload");
    }
    return { username, ucid };
  } catch (_) {
    throw new Error("Invalid token");
  }
}
