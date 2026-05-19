import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { usePuterStore } from "~/lib/puter";
import type { Route } from "./+types/resume";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import type { Feedback } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind | Review" },
    {
      name: "description",
      content: "Detailed overview of your resume",
    },
  ];
}

const Resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();

  const { id } = useParams();

  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/resume/${id}`);
    }
  }, [isLoading]);

  useEffect(() => {
    const loadResume = async (): Promise<void> => {
      if (!id) return;

      const resume = await kv.get(`resume:${id}`);

      if (!resume) return;

      const data: any = JSON.parse(resume);

      const resumeBlob: Blob | undefined = await fs.read(data.resumePath);

      if (!resumeBlob) return;

      const pdfBlob = new Blob([resumeBlob], {
        type: "application/pdf",
      });

      const pdfUrl = URL.createObjectURL(pdfBlob);

      setResumeUrl(pdfUrl);

      const imageBlob: Blob | undefined = await fs.read(data.imagePath);

      if (!imageBlob) return;

      const imageUrl = URL.createObjectURL(imageBlob);

      setImageUrl(imageUrl);

      setFeedback(data.feedback);

      console.log({
        resumeUrl: pdfUrl,
        imageUrl,
        feedback: data.feedback,
      });
    };

    loadResume();
  }, [id]);

  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img
            src="/icons/back.svg"
            alt="logo"
            className="w-2.5 h-2.5"
          />

          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="animate-in fade-in duration-1000">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={imageUrl}
                  alt="Resume Preview"
                  className="w-full h-full object-contain rounded-2xl"
                  title="resume"
                />
              </a>
            </div>
          )}
        </section>

        <section className="feedback-section">
          <h2 className="text-4xl !text-black font-bold">
            Resume Review
          </h2>

          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <Summary feedback={feedback} />

              <ATS
                score={feedback.ATS.score || 0}
                suggestions={feedback.ATS.suggestions || []}
              />

              <Details feedback={feedback} />
            </div>
          ) : (
            <img
              src="/images/resume-scan-2.gif"
              className="w-full"
              alt=""
            />
          )}
        </section>
      </div>
    </main>
  );
};

export default Resume;