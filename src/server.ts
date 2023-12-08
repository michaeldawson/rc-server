import * as http from "http";
import * as url from "url";
import { routes } from "./routes";

const PORT = 4000;

// This object will store the key-value pairs in memory
const store = {};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || "", true);

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const path = parsedUrl.pathname?.split("/")[1];
  const handler = (path && routes[path]) || routes.notFound;

  handler(res, parsedUrl, store);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
