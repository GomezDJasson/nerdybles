type ApiRequest = {
  method?: string;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

export default function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({
      success: false,
      message: "Método no permitido.",
    });
  }

  // Deliberately do not read, log, persist, or return callback parameters.
  // Meta's exact response format has not yet been confirmed.
  return res.status(200).json({
    success: true,
    service: "nerdybles-instagram-callback",
    status: "callback-received",
    method: req.method,
    message: "Respuesta recibida. No se han procesado ni almacenado datos.",
  });
}
