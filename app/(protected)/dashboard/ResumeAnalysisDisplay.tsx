"use client";

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

export default function ResumeAnalysisDisplay({
  analysis,
}: {
  analysis: ResumeAnalysis | null | undefined;
}) {
  if (!analysis) {
    return null;
  }

  const scoreColor =
    analysis.atsScore >= 80
      ? "text-green-600"
      : analysis.atsScore >= 60
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between border rounded-lg p-4 bg-gray-50">
        <h2 className="text-lg font-semibold">ATS Score</h2>
        <span className={`text-3xl font-bold ${scoreColor}`}>
          {analysis.atsScore}/100
        </span>
      </div>

      <Section title="Strengths">
        <ul className="list-disc list-inside space-y-1">
          {analysis.strengths.map((item, i) => (
            <li key={i} className="text-green-700">{item}</li>
          ))}
        </ul>
      </Section>

      <Section title="Weaknesses">
        <ul className="list-disc list-inside space-y-1">
          {analysis.weaknesses.map((item, i) => (
            <li key={i} className="text-red-700">{item}</li>
          ))}
        </ul>
      </Section>

      <Section title="Missing Keywords">
        <div className="flex flex-wrap gap-2">
          {analysis.missingKeywords.map((kw, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
            >
              {kw}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Improvement Suggestions">
        <ol className="list-decimal list-inside space-y-1">
          {analysis.improvementSuggestions.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      </Section>

      <Section title="Skills to Add">
        <div className="flex flex-wrap gap-2">
          {analysis.skillsToAdd.map((skill, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Overall Recommendation">
        <p className="text-gray-700">{analysis.overallRecommendation}</p>
      </Section>

      <Section title="Next Steps">
        <ol className="list-decimal list-inside space-y-1">
          {analysis.nextSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-md font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}