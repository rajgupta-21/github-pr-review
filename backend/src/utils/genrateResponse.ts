import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generatePRReview(
  prData: {
    title: string;
    description?: string | null;
    files: {
      filename: string;
      status: string;
      patch?: string;
    }[];
  },
  context?: string,
) {
  const prompt = `
You are a Staff Software Engineer performing a Pull Request review.

Review the PR carefully.

Focus on:
- Bugs
- Security vulnerabilities
- Performance issues
- Code quality
- Best practices
- Maintainability

Developer Instructions:
${context || "No additional instructions"}

PR Title:
${prData.title}

PR Description:
${prData.description || "No description"}

Changed Files:

${prData.files
  .map(
    (file) => `
File: ${file.filename}
Status: ${file.status}

Diff:
${file.patch || "No patch available"}

------------------------------------
`,
  )
  .join("\n")}

Return ONLY valid JSON.

{
  "summary": "",
  "overallScore": 0,
  "securityScore": 0,
  "performanceScore": 0,
  "qualityScore": 0,
  "findings": [
    {
      "severity": "Critical | High | Medium | Low",
      "file": "",
      "issue": "",
      "reason": "",
      "suggestion": ""
    }
  ],
  "strengths": [],
  "recommendation": "Approve | Request Changes"
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",

    response_format: {
      type: "json_object",
    },

    messages: [
      {
        role: "system",
        content:
          "You are an expert code reviewer with deep experience in TypeScript, Node.js, React, Next.js and backend architecture.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices[0].message.content;
}
