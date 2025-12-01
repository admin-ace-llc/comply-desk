// Netlify Function: generateKit
// Uses OpenAI to create a structured outline + a base64 Word (.docx) file

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const { Document, Packer, Paragraph, HeadingLevel } = require("docx");

async function callOpenAI(messages) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not set in environment variables.");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.35
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    return JSON.parse(content);
  } catch {
    return {
      summary: "Generated outline",
      sections: [
        {
          title: "Raw content",
          description: "Model returned unstructured content. Paste into a document.",
          items: [content]
        }
      ],
      implementation:
        "Review all content and customize for your workplace.",
      notes: "Always confirm with a qualified professional before relying on these materials.",
      disclaimer:
        "Not legal advice. Not guaranteed compliance."
    };
  }
}

async function buildDocx(plan, meta) {
  const { productName, businessName } = meta;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: productName || "Comply-Desk Compliance Kit",
            heading: HeadingLevel.TITLE
          }),
          new Paragraph({
            text: businessName ? `For: ${businessName}` : ""
          }),
          new Paragraph({ text: "" }),

          ...(plan.summary
            ? [
                new Paragraph({
                  text: "Summary",
                  heading: HeadingLevel.HEADING_1
                }),
                new Paragraph({ text: plan.summary })
              ]
            : []),

          ...(Array.isArray(plan.sections)
            ? plan.sections.flatMap((section) => {
                const out = [];
                if (section.title) {
                  out.push(
                    new Paragraph({
                      text: section.title,
                      heading: HeadingLevel.HEADING_2
                    })
                  );
                }
                if (section.description) {
                  out.push(new Paragraph({ text: section.description }));
                }
                if (Array.isArray(section.items)) {
                  section.items.forEach((item) => {
                    out.push(
                      new Paragraph({
                        text: item,
                        bullet: { level: 0 }
                      })
                    );
                  });
                }
                return out;
              })
            : []),

          ...(plan.implementation
            ? [
                new Paragraph({
                  text: "Implementation plan",
                  heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({ text: plan.implementation })
              ]
            : []),

          ...(plan.notes || plan.disclaimer
            ? [
                new Paragraph({
                  text: "Notes & disclaimer",
                  heading: HeadingLevel.HEADING_2
                }),
                ...(plan.notes ? [new Paragraph({ text: plan.notes })] : []),
                ...(plan.disclaimer
                  ? [new Paragraph({ text: plan.disclaimer })]
                  : [])
              ]
            : [])
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer.toString("base64");
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const {
      productSlug,
      productName,
      businessName,
      industry,
      state,
      employees,
      risks
    } = body;

    if (!productSlug || !productName || !businessName || !industry || !state) {
      return {
        statusCode: 400,
        body: "Missing required fields."
      };
    }

    const userPrompt = `
Generate a compliance kit outline for:

Business name: ${businessName}
Industry: ${industry}
State: ${state}
Workers: ${employees}
Special risks: ${risks}
Kit: ${productName}

Return ONLY the JSON object in this format:

{
"summary": "...",
"sections": [
{ "title": "...", "description": "...", "items": ["...", "..."] }
],
"implementation": "...",
"notes": "...",
"disclaimer": "Not legal advice. Not guaranteed compliance."
}`;

    const messages = [
      {
        role: "system",
        content:
          "You generate structured compliance documentation for small U.S. businesses. Always include disclaimers."
      },
      { role: "user", content: userPrompt }
    ];

    const plan = await callOpenAI(messages);

    const docxBase64 = await buildDocx(plan, { productName, businessName });
    const filename = `comply-desk-${productSlug}.docx`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...plan,
        docxBase64,
        filename
      })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: `Error: ${err.message}`
    };
  }
};
