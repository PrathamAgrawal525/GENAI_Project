const pdfParse = require("pdf-parse");
const { generateInterviewReport } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function generateInterviewReportController(req, res) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
  const { selfDescription, jobDescription } = req.body;

  const interviewReportByAi = await generateInterviewReport({
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
  });

  const interviewReport = await interviewReportModel.create({
    user: userId,
    resume: resumeContent.text,
    selfDescription,
    jobDescription,
    ...interviewReportByAi
  });

  res.status(200).json({
    message: "Interview report generated successfully",
    interviewReport
  })
}

module.exports = { generateInterviewReportController };
