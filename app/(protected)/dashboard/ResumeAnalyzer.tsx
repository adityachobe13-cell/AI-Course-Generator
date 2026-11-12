"use client";

import { useState } from "react";
import ResumeAnalysisDisplay from "./ResumeAnalysisDisplay";

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

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      setError(null);

      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/resume-analyzer", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setResult(data.result);
      }
    } catch (err) {
      console.error(err);
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">AI Resume Analyzer</h1>
      <p className="text-gray-600 mb-8">
        Upload your resume and get an ATS score with AI-powered feedback.
      </p>

      <div className="bg-white border rounded-3xl p-8 shadow-sm">
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mx-auto"
          />
          <p className="text-sm text-gray-500 mt-4">Upload a PDF</p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            "Analyze Resume"
          )}
        </button>
      </div>

      {error && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          {error}
        </div>
      )}

      {result && <ResumeAnalysisDisplay analysis={result} />}
    </div>
  );
}