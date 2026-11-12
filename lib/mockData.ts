// --- TYPESCRIPT INTERFACES ---
export interface Quiz {
    question: string;
    options: string[];
    correctAnswer: string;
  }
  
  export interface Lesson {
    id: string;
    title: string;
    content: string; // Markdown text
    codeSnippet?: string;
    quiz?: Quiz;
  }
  
  export interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
  }
  
  export interface Course {
    id: string;
    title: string;
    description: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    thumbnailUrl: string;
    progress: number; // 0 to 100
    modules: Module[];
  }
  
  // --- MOCK DATA ---
  export const mockCourses: Course[] = [
    {
      id: "course-js-101",
      title: "Mastering Modern JavaScript",
      description: "Learn JavaScript from scratch. Cover variables, functions, async/await, and DOM manipulation to build interactive web apps.",
      difficulty: "Beginner",
      // Using an Unsplash image as recommended in your system architecture
      thumbnailUrl: "https://images.unsplash.com/photo-1627398240411-5cb5aafd3b23?auto=format&fit=crop&w=800&q=80",
      progress: 0,
      modules: [
        {
          id: "mod-1",
          title: "Module 1: JavaScript Fundamentals",
          lessons: [
            {
              id: "les-1-1",
              title: "1.1 Variables & Data Types",
              content: `## Welcome to JavaScript!
  In JavaScript, variables are containers for storing data values. In modern ES6 JavaScript, we use \`let\` and \`const\` instead of the older \`var\` keyword.
  
  ### The Rule of Thumb:
  * Use \`const\` by default.
  * Use \`let\` only if you know the value will change later (like a counter in a loop).
  * Never use \`var\`.
  
  Here are the primitive data types you will work with most often: Strings, Numbers, and Booleans.`,
              codeSnippet: `// 1. Strings (Text)
  const userName = 'Alice';
  
  // 2. Numbers
  let userAge = 25;
  userAge = 26; // This is allowed because we used 'let'
  
  // 3. Booleans (True/False)
  const isDeveloper = true;
  
  console.log(userName + " is " + userAge);`,
              quiz: {
                question: "Which keyword should you use to declare a variable that will NEVER change its value?",
                options: ["var", "let", "const", "static"],
                correctAnswer: "const",
              },
            },
            {
              id: "les-1-2",
              title: "1.2 Functions & Scope",
              content: `## Reusable Blocks of Code
  Functions allow you to write code once and use it many times. Think of them as mini-programs inside your main program.
  
  ### Arrow Functions
  Introduced in ES6, Arrow Functions provide a shorter syntax for writing function expressions. They are especially useful for simple, one-line operations.`,
              codeSnippet: `// Traditional Function Declaration
  function greet(name) {
    return "Hello " + name;
  }
  
  // Modern Arrow Function
  const greetModern = (name) => {
    return \`Hello \${name}\`; // Using template literals
  };
  
  // One-liner Arrow Function (Implicit Return)
  const add = (a, b) => a + b;
  
  console.log(add(5, 10)); // Outputs: 15`,
              quiz: {
                question: "What is the correct syntax for an ES6 Arrow Function?",
                options: [
                  "function() => {}",
                  "() => {}",
                  "=> function() {}",
                  "const func = ()"
                ],
                correctAnswer: "() => {}",
              },
            }
          ],
        },
        {
          id: "mod-2",
          title: "Module 2: Asynchronous JavaScript",
          lessons: [
            {
              id: "les-2-1",
              title: "2.1 Promises & Async/Await",
              content: `## Handling Time in JavaScript
  JavaScript runs on a single thread. When you request data from a server, it takes time. If JavaScript stopped and waited for that data, your entire website would freeze. 
  
  To solve this, we use **Asynchronous** code.
  
  ### Async / Await
  The \`async\` and \`await\` keywords make asynchronous code look and behave like synchronous code, making it much easier to read.`,
              codeSnippet: `// Simulating fetching a user from a database
  async function fetchUserData() {
    try {
      console.log("Fetching data...");
      
      // The 'await' keyword pauses the function until the fetch is done
      const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
      const data = await response.json();
      
      console.log("Data received:", data.name);
    } catch (error) {
      console.error("Oops, something went wrong:", error);
    }
  }
  
  fetchUserData();`,
              quiz: {
                question: "What does the 'await' keyword do inside an async function?",
                options: [
                  "It stops the entire website from working.",
                  "It pauses the execution of that specific function until the Promise resolves.",
                  "It makes the code run faster.",
                  "It automatically converts JSON to text."
                ],
                correctAnswer: "It pauses the execution of that specific function until the Promise resolves.",
              },
            }
          ],
        }
      ],
    },
    // You can easily add a second course here to test your Dashboard Grid
    {
      id: "course-react-201",
      title: "React UI Patterns",
      description: "Learn how to build scalable, component-driven user interfaces using React and Tailwind CSS.",
      difficulty: "Intermediate",
      thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
      progress: 45, // Simulating a course in progress
      modules: [], // We can leave this empty for now just to test the grid
    }
  ];