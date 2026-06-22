const pdfParse = require("pdf-parse");
const { generateInterviewReport } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

function buildFallbackInterviewReport({ resume, selfDescription, jobDescription }) {
  const keywords = [
    ["React", /react/i],
    ["TypeScript", /typescript|ts\b/i],
    ["Node.js", /node\.?js|node/i],
    ["Express", /express/i],
    ["MongoDB", /mongo/i],
    ["SQL", /sql|postgres|mysql/i],
    ["Testing", /test|jest|cypress|vitest/i],
    ["System Design", /system design|architecture/i],
  ];

  const sourceText = `${resume || ""} ${selfDescription || ""} ${jobDescription || ""}`;
  const skillGaps = keywords
    .filter(([, pattern]) => pattern.test(sourceText))
    .slice(0, 4)
    .map(([skill], index) => ({
      skill,
      severity: index === 0 ? "high" : "medium",
    }));

  return {
    title: jobDescription?.split("\n")[0]?.slice(0, 80) || "Interview Preparation Report",
    matchScore: Math.min(95, Math.max(55, 60 + Math.floor(sourceText.length / 250))),
    technicalQuestions: [
      {
        question: "How would you approach the core responsibilities in this role?",
        intention: "Checks whether you understand the day-to-day expectations.",
        answer: "Explain your relevant experience, the tools you used, and the outcomes you delivered.",
      },
      {
        question: "What is a project from your background that best matches this job?",
        intention: "Looks for direct role alignment.",
        answer: "Pick one project, describe the problem, your contribution, and the measurable result.",
      },
      {
        question: "Which technical area would you prioritize learning for this position?",
        intention: "Tests self-awareness and growth mindset.",
        answer: "Choose one gap from the report and explain how you would close it quickly.",
      },
    ],
    behavioralQuestions: [
      {
        question: "Tell me about a time you solved a difficult problem under pressure.",
        intention: "Evaluates problem solving and composure.",
        answer: "Use a concise STAR story with the problem, your action, and the result.",
      },
      {
        question: "Describe a time you worked with a team that had conflicting priorities.",
        intention: "Checks collaboration and communication.",
        answer: "Show how you aligned stakeholders and kept the work moving.",
      },
      {
        question: "How do you handle feedback when your work needs improvement?",
        intention: "Assesses coachability and maturity.",
        answer: "Explain how you listen, clarify expectations, and improve quickly.",
      },
    ],
    skillGaps:
      skillGaps.length > 0
        ? skillGaps
        : [
            { skill: "System Design", severity: "medium" },
            { skill: "Testing", severity: "medium" },
            { skill: "Communication", severity: "low" },
          ],
    preparationPlan: [
      {
        day: 1,
        focus: "Role alignment and story prep",
        tasks: [
          "Review the job description carefully.",
          "Prepare 3 impact-focused STAR stories.",
          "Draft a 60-second introduction.",
        ],
      },
      {
        day: 2,
        focus: "Technical review",
        tasks: [
          "Practice the main stack mentioned in the role.",
          "Review one project you can discuss end-to-end.",
          "Write down likely technical follow-up questions.",
        ],
      },
      {
        day: 3,
        focus: "Mock interview",
        tasks: [
          "Answer behavioral questions out loud.",
          "Run one timed mock technical conversation.",
          "Refine weak answers and repeat.",
        ],
      },
    ],
  };
}

async function generateInterviewReportController(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { selfDescription, jobDescription } = req.body;
    const hasResumeFile = Boolean(req.file?.buffer);

    if (!hasResumeFile && !selfDescription) {
      return res.status(400).json({
        message: "Provide either a resume PDF or a self description.",
      });
    }

    let resumeText = selfDescription || "";

    if (hasResumeFile) {
      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({
          message: "Only PDF resumes are supported. Upload a PDF or use the self description field.",
        });
      }

      const resumeContent = await new pdfParse.PDFParse({
        data: req.file.buffer,
      }).getText();

      resumeText = resumeContent.text;
    }

    let interviewReportByAi;

    try {
      interviewReportByAi = await generateInterviewReport({
        resume: resumeText,
        selfDescription,
        jobDescription,
      });
    } catch (error) {
      console.error("AI report generation failed, using fallback report.", error);
      interviewReportByAi = buildFallbackInterviewReport({
        resume: resumeText,
        selfDescription,
        jobDescription,
      });
    }

    const interviewReport = await interviewReportModel.create({
      user: userId,
      resume: resumeText,
      selfDescription,
      jobDescription,
      ...interviewReportByAi,
    });

    res.status(200).json({
      message: "Interview report generated successfully",
      interviewReport,
    });
  } catch (error) {
    console.error("generateInterviewReportController failed:", error);
    res.status(500).json({
      message: "Failed to generate interview report.",
    });
  }
}

async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;
  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found",
    });
  }

  res.status(200).json({
    message: "Interview report fetched successfully",
    interviewReport,
  });
}

async function getAllInterviewReportsController(req, res) {
  const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select(
      "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
    );

  res.status(200).json({
    message: "Interview reports fetched successfully.",
    interviewReports,
  });
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
};
