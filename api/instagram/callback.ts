import { timingSafeEqual } from "node:crypto";

type QueryValue = string | string[] | undefined;

type ApiRequest = {
  method?: string;
  headers?: {
    cookie?: string;
  };
  query?: Record<string, QueryValue>;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

const STATE_COOKIE = "__Host-nerdybles_ig_oauth_state";
const STATE_COOKIE_CLEAR =
  `${STATE_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;

function getSingleQueryValue(value: QueryValue): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getCookieValue(
  cookieHeader: string | undefined,
  cookieName: string,
): string | undefined {
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex < 0) continue;

    const name = part.slice(0, separatorIndex).trim();
    if (name !== cookieName) continue;

    const value = part.slice(separatorIndex + 1).trim();

    try {
      return decodeURIComponent(value);
    } catch {
      return undefined;
    }
  }

  return undefined;
}

function statesMatch(receivedState: string, expectedState: string): boolean {
  const received = Buffer.from(receivedState, "utf8");
  const expected = Buffer.from(expectedState, "utf8");

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  );
}

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Set-Cookie", STATE_COOKIE_CLEAR);

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      success: false,
      message: "Método no permitido.",
    });
  }

  const query = req.query ?? {};
  const metaError = getSingleQueryValue(query.error);

  if (metaError) {
    return res.status(400).json({
      success: false,
      status: "authorization-denied",
      message: "Meta no completó la autorización. Puedes cerrar esta ventana.",
    });
  }

  const receivedState = getSingleQueryValue(query.state);
  const expectedState = getCookieValue(
    req.headers?.cookie,
    STATE_COOKIE,
  );

  if (
    !receivedState ||
    !expectedState ||
    !statesMatch(receivedState, expectedState)
  ) {
    return res.status(400).json({
      success: false,
      status: "invalid-state",
      message: "No se pudo validar la solicitud de autorización. Inicia el proceso nuevamente.",
    });
  }

  const authorizationCode = getSingleQueryValue(query.code);

  if (!authorizationCode) {
    return res.status(400).json({
      success: false,
      status: "missing-authorization-code",
      stateValid: true,
      message: "Meta no devolvió el código de autorización esperado.",
    });
  }

  // The authorization code is intentionally not exchanged, stored, logged,
  // or returned until Meta's unified-login token exchange is verified.
  return res.status(200).json({
    success: true,
    service: "nerdybles-instagram-callback",
    status: "authorization-code-received",
    authorizationCodeReceived: true,
    stateValid: true,
    tokenExchange: "not-started",
    message: "La respuesta de autorización fue validada. El código no se ha procesado ni almacenado.",
  });
}
