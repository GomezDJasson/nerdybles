type ApiRequest = {
  method?: string;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
};

type InstagramMediaResponse = {
  data?: InstagramMedia[];
  error?: {
    message?: string;
    code?: number;
  };
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      success: false,
      message: "Método no permitido.",
    });
  }

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!accessToken || !instagramAccountId) {
    return res.status(503).json({
      success: false,
      message: "El feed de Instagram todavía no está configurado.",
    });
  }

  const url = new URL(
    `https://graph.facebook.com/v27.0/${encodeURIComponent(instagramAccountId)}/media`,
  );
  url.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp",
  );
  url.searchParams.set("limit", "6");
  url.searchParams.set("access_token", accessToken);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    });

    const result = (await response.json()) as InstagramMediaResponse;

    if (!response.ok || result.error) {
      // Do not forward Meta's raw response: it may contain sensitive diagnostics.
      console.error("Instagram Graph API request failed", {
        status: response.status,
        code: result.error?.code,
      });

      return res.status(502).json({
        success: false,
        message: "No fue posible obtener las publicaciones de Instagram.",
      });
    }

    const posts = (result.data ?? [])
      .filter((post) => post.id && post.permalink && post.timestamp)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 6);

    return res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Instagram feed request failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return res.status(502).json({
      success: false,
      message: "No fue posible conectar con Instagram en este momento.",
    });
  }
}
