// cloudflare worker to avoid CORS issues
// attempt to read the <title /> text from a URL
// and return in in { title: "" } JSON

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

const getTitle = (url) =>
  fetch(url)
    .then((response) => response.text())
    .then((html) => {
      const [, title] = html.match(/<title.*?>(.*?)<\/title>/);
      return String(title).trim();
    });

async function handleRequest(request) {
  const url = request.url.split("workers.dev/")[1];
  const title = await getTitle(url);
  return new Response(
    JSON.stringify({
      title,
    }),
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
        "Access-Control-Allow-Headers": request.headers.get(
          "Access-Control-Request-Headers"
        ),
      },
    }
  );
}
