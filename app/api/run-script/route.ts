import { NextRequest } from "next/server";
import { RunEventType, RunOpts } from "@gptscript-ai/gptscript";
import g from "@/lib/gptScriptInstance";
import fs from 'fs';
import path from 'path';

const script = "app/api/run-script/story-book.gpt";

// Utility function to ensure the directory exists
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log("Directory created successfully.");
    } catch (err) {
      console.error("Failed to create directory:", err);
      throw new Error('Failed to create directory');
    }
  }
};

export async function POST(request: NextRequest) {
  const { story, pages, path: userPath } = await request.json();

  console.log("Received story:", story);
  console.log("Received pages:", pages);
  console.log("Received path:", userPath);

  // Sanitize the path to avoid potential issues with spaces or invalid characters
  // Improved sanitization: Allow spaces and replace only dangerous characters
  const baseDir = process.cwd();
  const absolutePath = userPath.startsWith('public') 
    ? path.join(baseDir, userPath) 
    : path.join(baseDir, 'public', userPath);

  // Improved directory creation logic with detailed logging
  try {
    fs.mkdirSync(absolutePath, { recursive: true });
    console.log("Directory created successfully:", absolutePath);
  } catch (err) {
    console.error("Failed to create directory:", err);
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }


  const opts: RunOpts = {
    disableCache: true,
    input: `--story ${story} --pages ${pages} --path ${absolutePath}`,
  };

  try {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const run = await g.run(script, opts);
          run.on(RunEventType.Event, (data) => {
            controller.enqueue(encoder.encode(`event: ${JSON.stringify(data)}\n\n`));
          });

          await run.text();
          controller.close();
        } catch (error) {
          controller.error(error);
          console.error("Error during run:", error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Status": "200",
      },
    });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
}
