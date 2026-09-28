// language: JavaScript, file: functions/index.js, runtime: Node.js 20+
// Firebase Cloud Function that keeps the SerpApi key on the server.

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const serpApiKey = defineSecret("SERPAPI_KEY");

exports.search = onRequest(
  {
    region: "europe-west1",
    secrets: [serpApiKey],
    cors: false
  },
  async (req, res) => {
    try {
      if (req.method !== "GET") {
        res.status(405).json({
          error: "Method not allowed"
        });

        return;
      }

      const query = String(req.query.q || "").trim();

      if (!query) {
        res.status(400).json({
          error: "Missing q parameter"
        });

        return;
      }

      if (query.length > 300) {
        res.status(400).json({
          error: "Query too long"
        });

        return;
      }

      const params = new URLSearchParams({
        engine: "google",
        q: query,
        api_key: serpApiKey.value(),
        device: "tablet",
        hl: "pt",
        gl: "pt",
        google_domain: "google.pt",
        num: "10"
      });

      const response = await fetch(
        `https://serpapi.com/search?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        res.status(response.status).json({
          error:
            data.error ||
            "SerpApi request failed"
        });

        return;
      }

      res.set("Cache-Control", "public, max-age=60");

      res.status(200).json({
        search_metadata: data.search_metadata,
        organic_results: data.organic_results || [],
        knowledge_graph: data.knowledge_graph || null,
        answer_box: data.answer_box || null
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Internal search error"
      });
    }
  }
);