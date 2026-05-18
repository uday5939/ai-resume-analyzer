import Groq from "groq-sdk";
import { AIResponseFormat } from "../../constants";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function action({ request }: any) {
  try {
    console.log("Groq API route hit");

    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { error: "GROQ_API_KEY is missing" },
        { status: 500 }
      );
    }

    const body = await request.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a professional ATS resume analyzer. Return only valid JSON.",
        },
        {
          role: "user",
          content: `You are an expert in ATS (Applicant Tracking System) and resume analysis.
Please analyze and rate this resume and suggest how to improve it.
The rating can be low if the resume is bad.
Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
If available, use the job description for the job user is applying to to give more detailed feedback.
If provided, take the job description into consideration.
All scores must be out of 100.
The job title is: ${body.jobTitle}
The job description is: ${body.jobDescription}
Provide the feedback using the following format: ${AIResponseFormat}
Return the analysis as a JSON object, without any other text and without the backticks.
Do not include any other text or comments.`,
        },
      ],
    });

    return Response.json({
      feedback: completion.choices[0]?.message?.content,
    });
  } catch (error) {
    console.error("Groq API error:", error);

    return Response.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}