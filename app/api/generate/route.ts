import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ----------------------------------------------------
// Generate course structure
// ----------------------------------------------------
async function generateCourseStructure(
  topic: string,
  difficulty: string
) {
  const prompt = `
Create a course structure for:

Topic: ${topic}
Difficulty: ${difficulty}

Requirements:
- Create exactly 4 modules.
- Each module must contain exactly 3 lessons.
- Give every module a clear name.
- Give every lesson a clear educational title.
- Lessons must follow a logical learning progression.

Do not generate lesson content.
Do not generate code.
Do not generate quizzes.

Return only the requested structured data.
`;

  const completion =
    await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      model: "openai/gpt-oss-20b",

      response_format: {
        type: "json_schema",
        json_schema: {
          name: "course_structure",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,

            properties: {
              modules: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,

                  properties: {
                    module_name: {
                      type: "string",
                    },

                    lessons: {
                      type: "array",
                      items: {
                        type: "object",
                        additionalProperties: false,

                        properties: {
                          title: {
                            type: "string",
                          },
                        },

                        required: ["title"],
                      },
                    },
                  },

                  required: [
                    "module_name",
                    "lessons",
                  ],
                },
              },
            },

            required: ["modules"],
          },
        },
      },

      temperature: 0.2,
      max_completion_tokens: 4000,
    });

  const content =
    completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error(
      "Groq returned an empty course structure"
    );
  }

  return JSON.parse(content);
}

// ----------------------------------------------------
// Generate ONE lesson
// ----------------------------------------------------
async function generateLesson(
  topic: string,
  difficulty: string,
  moduleName: string,
  lessonTitle: string
) {
  const prompt = `
Create one lesson for an online course.

Course: ${topic}
Difficulty: ${difficulty}
Module: ${moduleName}
Lesson: ${lessonTitle}

Generate:

- 250 to 300 words of clear educational content
- Use simple Markdown
- Include a short example when useful
- If the lesson is about programming, include a short correct code example
- Otherwise, code_block must be an empty string
- Create exactly one multiple-choice question
- Create exactly four options
- The answer must exactly match one option
- Do not include URLs
- Do not include unnecessary text outside the requested fields

Return only the structured JSON response.
`;

  const completion =
    await client.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      model: "openai/gpt-oss-20b",

      response_format: {
        type: "json_schema",
        json_schema: {
          name: "lesson_generation",
          strict: true,

          schema: {
            type: "object",
            additionalProperties: false,

            properties: {
              body_content: {
                type: "string",
              },

              code_block: {
                type: "string",
              },

              quiz_data: {
                type: "object",
                additionalProperties: false,

                properties: {
                  question: {
                    type: "string",
                  },

                  options: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },

                  answer: {
                    type: "string",
                  },
                },

                required: [
                  "question",
                  "options",
                  "answer",
                ],
              },
            },

            required: [
              "body_content",
              "code_block",
              "quiz_data",
            ],
          },
        },
      },

      temperature: 0.2,
      max_completion_tokens: 2500,
      reasoning_effort: "low",
    });

  const content =
    completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error(
      `Groq returned empty content for lesson: ${lessonTitle}`
    );
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    console.error(
      "Invalid lesson JSON:",
      content
    );

    throw new Error(
      `Invalid JSON returned for lesson: ${lessonTitle}`
    );
  }
}

// ----------------------------------------------------
// POST - Generate Course
// ----------------------------------------------------
export async function POST(req: Request) {
  try {
    const {
      topic,
      difficulty,
      userId,
    } = await req.json();

    // ------------------------------------------------
    // 1. Generate course structure
    // ------------------------------------------------

    console.log(
      `Generating course structure for: ${topic}`
    );

    const courseStructure =
      await generateCourseStructure(
        topic,
        difficulty
      );

    // ------------------------------------------------
    // 2. Insert Course
    // ------------------------------------------------

    const formattedDifficulty =
      difficulty.charAt(0).toUpperCase() +
      difficulty.slice(1);

    const {
      data: course,
      error: courseError,
    } = await supabase
      .from("courses")
      .insert([
        {
          creator_id: userId,
          title: topic,
          description: `A comprehensive ${difficulty}-level course about ${topic}.`,
          difficulty: formattedDifficulty,
          is_published: true,
        },
      ])
      .select()
      .single();

    if (courseError) {
      throw courseError;
    }

    // ------------------------------------------------
    // 3. Generate modules
    // ------------------------------------------------

    const modules =
      courseStructure.modules || [];

    for (
      const [mIndex, mData]
      of modules.entries()
    ) {
      console.log(
        `Creating module ${mIndex + 1}: ${mData.module_name}`
      );

      const {
        data: module,
        error: moduleError,
      } = await supabase
        .from("modules")
        .insert([
          {
            course_id: course.id,
            title: mData.module_name,
            order_index: mIndex,
          },
        ])
        .select()
        .single();

      if (moduleError || !module) {
  throw new Error(
    `Failed to create module "${mData.module_name}": ${
      moduleError?.message || "Unknown error"
    }`
  );
}

      // ----------------------------------------------
      // 4. Generate lessons
      // ----------------------------------------------

      for (
        const [lIndex, lessonInfo]
        of (mData.lessons || []).entries()
      ) {
        console.log(
          `Generating lesson: ${lessonInfo.title}`
        );

        // --------------------------------------------
        // Generate lesson content with Groq
        // --------------------------------------------

        const lesson =
          await generateLesson(
            topic,
            difficulty,
            mData.module_name,
            lessonInfo.title
          );

        // --------------------------------------------
        // Find YouTube video
        // --------------------------------------------

        console.log(
          `Searching YouTube for: ${lessonInfo.title}`
        );

    

  
        // --------------------------------------------
        // Insert lesson into Supabase
        // --------------------------------------------

        const {
  data: insertedLesson,
  error: lessonError,
} = await supabase
  .from("lessons")
  .insert([
    {
      module_id: module.id,
      title: lessonInfo.title,
      content: lesson.body_content,
      code_snippet: lesson.code_block,
      quiz_data: lesson.quiz_data,
      order_index: lIndex,
    },
  ])
  .select()
  .single();

if (lessonError || !insertedLesson) {
  throw new Error(
    `Failed to create lesson "${lessonInfo.title}": ${
      lessonError?.message || "Lesson was not inserted"
    }`
  );
}

console.log(
  `✅ Lesson saved: ${insertedLesson.title}`
);

        if (lessonError) {
          console.error(
            "Lesson insert error:",
            lessonError
          );
        }

        // Small delay
        await new Promise((resolve) =>
  setTimeout(resolve, 1500)
);
      }
    }

    // ------------------------------------------------
    // 5. Return Course ID
    // ------------------------------------------------

    console.log(
      `Course generated successfully: ${course.id}`
    );

    return NextResponse.json({
      success: true,
      courseId: course.id,
    });
  } catch (error: any) {
    console.error(
      "Server Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Something went wrong while generating the course",
      },
      {
        status: 500,
      }
    );
  }
}