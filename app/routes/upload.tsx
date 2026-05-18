import { useState } from "react";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { convertPdfToImage } from "~/lib/pdf2img";

const Upload = () => {
  const { fs, kv } = usePuterStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleAnalyse = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    try {
      setIsProcessing(true);
      setStatusText("Uploading the file...");

      const uploadedFile = await fs.upload([file]);

      if (!uploadedFile) {
        setStatusText("Error: Failed to upload file");
        return;
      }

      setStatusText("Converting to image...");

      const imageFile = await convertPdfToImage(file);

      if (!imageFile.file) {
        setStatusText("Error: Failed to convert PDF to image");
        return;
      }

      setStatusText("Uploading the image...");

      const uploadedImage = await fs.upload([imageFile.file]);

      if (!uploadedImage) {
        setStatusText("Error: Failed to upload image");
        return;
      }

      setStatusText("Preparing data...");

      const uuid = generateUUID();

      const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: "",
      };

      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText("Analyzing...");

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle,
          jobDescription,
        }),
      });

      if (!response.ok) {
        setStatusText("Error: Failed to analyze resume");
        return;
      }

      const result = await response.json();

      console.log("Groq result:", result);

      let feedbackText = result.feedback || "";

      feedbackText = feedbackText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      data.feedback = JSON.parse(feedbackText);

      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText("Analysis complete, redirecting...");
      console.log(data);
    } catch (error) {
      console.error(error);
      setStatusText("Error: Something went wrong. Check console.");
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Submit clicked");

    const formData = new FormData(e.currentTarget);

    const companyName = formData.get("companyName") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) {
      alert("Please upload a resume first.");
      return;
    }

    handleAnalyse({
      companyName,
      jobTitle,
      jobDescription,
      file,
    });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>

          {isProcessing ? (
            <>
              <h2>{statusText}</h2>

              <img
                src="/images/resume-scan.gif"
                className="w-100 mx-auto"
                alt="Scanning resume"
              />
            </>
          ) : (
            <h2>Drop your resume for ATS score and improvement tips</h2>
          )}

          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>

                <input
                  type="text"
                  name="companyName"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>

                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>

                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                />
              </div>

              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>

                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;