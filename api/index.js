// api/index.js
export default async function handler(req, res) {
  // 1. Get private API Key from Vercel's encrypted environment variables
  const apiKey = process.env.VITE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key perimetral no configurada en el Dashboard de Vercel." });
  }

  // 2. Extract path and query params from incoming URL (e.g. "/api/catalog" -> "/catalog")
  const targetPath = req.url.replace(/^\/api/, '');
  const targetUrl = `https://api-precioautos.nucolab.cl${targetPath}`;

  try {
    // 3. Make secure backend-to-backend fetch
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json"
      }
    });

    // 4. Relay response data back
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("BFF Proxy error:", error);
    return res.status(500).json({ error: "Error en el servidor de enlace BFF." });
  }
}
