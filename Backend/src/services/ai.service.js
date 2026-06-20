const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviwer behind asking the question"),
        answer: z
          .string()
          .describe("How to answer the question in an ideal way"),
      }),
    )
    .describe("List of technical questions that can be asked in the interview"),
  title: z
    .string()
    .describe("The title of the interview report, usually the position name"),
  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The behavioral question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviwer behind asking the question"),
        answer: z
          .string()
          .describe("How to answer the question in an ideal way"),
      }),
    )
    .describe("List of technical questions that can be asked in the interview"),
  skillGaps: z
    .array(
      z.object({
        skill: z
          .string()
          .describe(
            "The skill that the candidate is lacking which is required for the job",
          ),
        severity: z
          .enum(["Low", "Medium", "High"])
          .describe("The severity of the skill gap"),
      }),
    )
    .describe(
      "List of skills that the candidate is lacking which are required for the job",
    ),
  preparationPlans: z
    .array(
      z.object({
        day: z.string().describe("The day of the preparation plan"),
        focus: z
          .string()
          .describe("The focus of the preparation plan for the day"),
        tasks: z
          .array(z.string())
          .describe("The tasks to be done on the day for preparation"),
      }),
    )
    .describe(
      "List of preparation plans for the candidate to prepare for the interview",
    ),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema),
    },
  });

  return JSON.parse(response.text);
}

module.exports = { generateInterviewReport };
