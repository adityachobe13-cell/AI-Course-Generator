export const runtime = "nodejs";

import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

interface ResumeAnalysis {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  improvementSuggestions: string[];
  skillsToAdd: string[];
  overallRecommendation: string;
  nextSteps: string[];
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No resume file uploaded" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Please upload a PDF file" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const resumeText = await extractTextFromPDF(buffer);

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the PDF" },
        { status: 400 }
      );
    }

    const trimmedText = resumeText.slice(0, 15000);

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      max_completion_tokens: 2048,
      temperature: 0.6,
      reasoning_effort: "low",
      messages: [
        {
          role: "user",
          content: `You are an expert ATS resume analyzer.

Analyze the following resume and respond with ONLY valid JSON, no markdown formatting, no code fences, no explanations before or after — just the raw JSON object matching this exact shape:

{
  "atsScore": number (0-100),
  "strengths": string[] (3-6 items),
  "weaknesses": string[] (3-6 items),
  "missingKeywords": string[] (5-15 items),
  "improvementSuggestions": string[] (4-8 items),
  "skillsToAdd": string[] (5-12 items),
  "overallRecommendation": string (2-4 sentences),
  "nextSteps": string[] (3-5 items)
}

Resume:

${trimmedText}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();

    let analysis: ResumeAnalysis;
    try {
      analysis = JSON.parse(clean);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Raw content:", raw);
      return NextResponse.json(
        { error: "Failed to parse analysis. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: analysis });
  } catch (error: any) {
    console.error("Resume analyzer error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}