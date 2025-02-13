export default function checkAccess(request: Request) {
  const auth = request.headers.get("authorization");

  const username = "admin";
  const password = "secret";

  const encoded = "Basic " + btoa(`${username}:${password}`);

  if (auth !== encoded) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
    });
  }
}
