export default async (request, context) => {
  let response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("text/html")) {
    let html = await response.text();

    const googleTag = `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17686557179"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'AW-17686557179');
</script>
`;

    // Inject right before </head>
    html = html.replace("</head>", googleTag + "\n</head>");

    return new Response(html, {
      headers: response.headers,
      status: response.status
    });
  }

  return response;
};
