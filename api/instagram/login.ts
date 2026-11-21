import { randomBytes } from "node:crypto";

type ApiRequest = {
  method?: string;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ApiResponse;
  end: () => void;
};

const STATE_COOKIE = "__Host-nerdybles_ig_oauth_state";
const STATE_MAX_AGE_SECONDS = 600;

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).end();
    return;
  }

  const appId = process.env.META_APP_ID;
  const configId = process.env.META_CONFIG_ID;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!appId || !configId || !redirectUri) {
    res.status(500).end();
    return;
  }

  let parsedRedirectUri: URL;

  try {
    parsedRedirectUri = new URL(redirectUri);
  } catch {
    res.status(500).end();
    return;
  }

  if (
    parsedRedirectUri.protocol !== "https:" ||
    parsedRedirectUri.pathname !== "/api/instagram/callback"
  ) {
    res.status(500).end();
    return;
  }

  const state = randomBytes(32).toString("base64url");
  const authorizationUrl = new URL("https://www.facebook.com/dialog/oauth");

  authorizationUrl.searchParams.set("client_id", appId);
  authorizationUrl.searchParams.set("config_id", configId);
  authorizationUrl.searchParams.set("display", "popup");
  authorizationUrl.searchParams.set("override_default_response_type", "true");
  authorizationUrl.searchParams.set("redirect_uri", parsedRedirectUri.toString());
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("prompt", "login");

  res.setHeader(
    "Set-Cookie",
    `${STATE_COOKIE}=${state}; Max-Age=${STATE_MAX_AGE_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`,
  );
  res.setHeader("Location", authorizationUrl.toString());
  res.status(302).end();
}
