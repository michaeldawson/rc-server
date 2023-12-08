import { ServerResponse } from "http";
import { UrlWithParsedQuery } from "url";
import { writeStoreToFile } from "./store";

type Route = (
  res: ServerResponse,
  parsedUrl: UrlWithParsedQuery,
  store: Record<string, unknown>
) => void;
export const routes: Record<string, Route> = {
  get: (res, parsedUrl, store) => {
    const query = parsedUrl.query;
    const key = query.key;

    if (Array.isArray(key)) return routes.notFound(res, parsedUrl, store);

    if (key && store.hasOwnProperty(key)) {
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, value: store[key] }));
    } else {
      res.writeHead(404);
      res.end(
        JSON.stringify({ success: false, message: `Key ${key} not found.` })
      );
    }
  },
  set: (res, parsedUrl, store) => {
    const query = parsedUrl.query;

    // Check if the query is not empty
    if (Object.keys(query).length === 0) {
      res.writeHead(400);
      res.end(
        JSON.stringify({
          success: false,
          message: "No key/value pairs provided.",
        })
      );
      return;
    }

    // Iterate over all query parameters and set them in the store
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "string") {
        // Ensure that the value is not an array
        store[key] = value;
      } else {
        // Handle the case where the value is an array (multiple values for the same key)
        res.writeHead(400);
        res.end(
          JSON.stringify({
            success: false,
            message: `Multiple values for a single key ${key} are not supported.`,
          })
        );
        return;
      }
    }

    res.writeHead(200);
    res.end(
      JSON.stringify({
        success: true,
        message: `Keys set successfully.`,
      })
    );

    writeStoreToFile(store);
  },
  notFound: (res, _parsedUrl, _store) => {
    res.writeHead(404);
    res.end(JSON.stringify({ success: false, message: "Invalid path." }));
  },
};
