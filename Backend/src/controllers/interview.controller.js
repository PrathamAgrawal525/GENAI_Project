const pdfParse = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
  generateResumeHtml,
  generatePdfFromHtml,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
  let resumeText = "";
  if (req.file) {
    const resumeContent = await new pdfParse.PDFParse(
      Uint8Array.from(req.file.buffer),
    ).getText();
    resumeText = resumeContent.text || "";
  }
  const { selfDescription, jobDescription } = req.body;

  const interViewReportByAi = await generateInterviewReport({
    resume: resumeText,
    selfDescription,
    jobDescription,
  });

  console.log("AI Interview Report Response:", JSON.stringify(interViewReportByAi, null, 2));

  const interviewReport = await interviewReportModel.create({
    user: req.user.id,
    resume: resumeText,
    selfDescription,
    jobDescription,
    ...interViewReportByAi,
  });

  // Pre-generate resume HTML and PDF in the background asynchronously
  generateResumeHtml({
    resume: resumeText,
    jobDescription,
    selfDescription,
  })
    .then(async (htmlContent) => {
      interviewReport.resumeHtml = htmlContent;
      await interviewReport.save();
      console.log(`Successfully pre-generated resume HTML for report: ${interviewReport._id}`);

      try {
        const pdfBuffer = await generatePdfFromHtml(htmlContent);
        interviewReport.resumePdf = Buffer.from(pdfBuffer);
        await interviewReport.save();
        console.log(`Successfully pre-generated resume PDF for report: ${interviewReport._id}`);
      } catch (pdfError) {
        console.error(`Error pre-generating resume PDF for report: ${interviewReport._id}`, pdfError);
      }
    })
    .catch((error) => {
      console.error(`Error pre-generating resume HTML/PDF for report: ${interviewReport._id}`, error);
    });

  res.status(201).json({
    message: "Interview report generated successfully.",
    interviewReport,
  });
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  }).select("-resumePdf");

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  res.status(200).json({
    message: "Interview report fetched successfully.",
    interviewReport,
  });
}

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
  const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select(
      "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan -resumePdf",
    );

  res.status(200).json({
    message: "Interview reports fetched successfully.",
    interviewReports,
  });
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
  const { interviewReportId } = req.params;

  try {
    const interviewReport =
      await interviewReportModel.findById(interviewReportId);

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found.",
      });
    }

    let pdfBuffer = interviewReport.resumePdf;
    let htmlContent = interviewReport.resumeHtml;

    if (!pdfBuffer) {
      console.log(`Generating resume PDF/HTML on the fly for report: ${interviewReportId}`);
      
      if (!htmlContent) {
        const { resume, jobDescription, selfDescription } = interviewReport;
        htmlContent = await generateResumeHtml({
          resume,
          jobDescription,
          selfDescription,
        });
        interviewReport.resumeHtml = htmlContent;
        await interviewReport.save();
      }

      try {
        pdfBuffer = await generatePdfFromHtml(htmlContent);
        interviewReport.resumePdf = Buffer.from(pdfBuffer);
        await interviewReport.save();
        console.log(`Successfully generated and saved resume PDF for report: ${interviewReportId}`);
      } catch (pdfError) {
        console.error(`Puppeteer PDF generation failed:`, pdfError);
        // Fallback: If Puppeteer fails but we have the HTML, return a JSON response with the HTML content
        return res.status(200).json({
          fallback: true,
          html: htmlContent,
          message: "Puppeteer PDF generation failed. Falling back to client-side printing.",
        });
      }
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error(`Error in generateResumePdfController for report: ${interviewReportId}`, error);
    res.status(500).json({
      message: "Failed to generate or retrieve resume PDF.",
      error: error.message,
    });
  }
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
