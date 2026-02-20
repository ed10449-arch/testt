import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT) || 3000;
const distPath = path.join(__dirname, "dist");

app.disable("x-powered-by");
app.use(express.static(distPath, { index: false }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
