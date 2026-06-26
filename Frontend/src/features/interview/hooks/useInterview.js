import {
  getAllInterviewReports,
  generateInterviewReport,
  getInterviewReportById,
  generateResumePdf,
} from "../services/interview.api";
import { useContext, useEffect, useState } from "react";
import { InterviewContext } from "../interview.context";
import { useParams } from "react-router";

export const useInterview = () => {
  const context = useContext(InterviewContext);
  const { interviewId } = useParams();
  const [pdfLoading, setPdfLoading] = useState(false);

  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }

  const { loading, setLoading, report, setReport, reports, setReports } =
    context;

  const generateReport = async ({
    jobDescription,
    selfDescription,
    resumeFile,
  }) => {
    setLoading(true);
    let response = null;
    try {
      response = await generateInterviewReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });
      setReport(response.interviewReport);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }

    return response?.interviewReport ?? null;
  };

  const getReportById = async (interviewId) => {
    setLoading(true);
    let response = null;
    try {
      response = await getInterviewReportById(interviewId);
      setReport(response.interviewReport);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
    return response?.interviewReport ?? null;
  };

  const getReports = async () => {
    setLoading(true);
    let response = null;
    try {
      response = await getAllInterviewReports();
      setReports(response.interviewReports);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }

    return response?.interviewReports ?? [];
  };

  const getResumePdf = async (interviewReportId) => {
    setPdfLoading(true);
    let response = null;
    try {
      response = await generateResumePdf({ interviewReportId });

      // Check if response is a JSON fallback
      if (response && response.type === "application/json") {
        const text = await response.text();
        const data = JSON.parse(text);
        if (data.fallback && data.html) {
          // Fallback to client-side printing via iframe
          const iframe = document.createElement("iframe");
          iframe.style.position = "fixed";
          iframe.style.width = "0px";
          iframe.style.height = "0px";
          iframe.style.border = "none";
          document.body.appendChild(iframe);

          const doc = iframe.contentWindow.document;
          doc.open();
          doc.write(data.html);
          doc.close();

          iframe.contentWindow.focus();
          iframe.contentWindow.print();

          // Remove the iframe after printing (with a slight delay)
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
          return;
        }
      }

      // Default: response is a PDF Blob
      const url = window.URL.createObjectURL(
        new Blob([response], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `resume_${interviewReportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Clean up DOM
    } catch (error) {
      console.error("Error downloading PDF:", error);
      let errorMessage = "Failed to download resume PDF.";
      if (error.response && error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorJson = JSON.parse(text);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          }
          if (errorJson.error) {
            errorMessage += ` (${errorJson.error})`;
          }
        } catch (e) {
          // Ignore parse errors
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId);
    } else {
      getReports();
    }
  }, [interviewId]);

  return {
    loading,
    pdfLoading,
    report,
    reports,
    generateReport,
    getReportById,
    getReports,
    getResumePdf,
  };
};
