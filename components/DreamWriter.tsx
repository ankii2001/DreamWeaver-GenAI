"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Frame } from "@gptscript-ai/gptscript";
import renderEventMessage from "@/lib/renderEventMessage";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import nodemailer from "nodemailer";

const storiesPath = "public/stories";

// Function to validate email (basic check to avoid common ones like abc@gmail.com)
const isValidEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && !email.includes("abc@gmail.com");
};

function DreamWriter() {
  const [story, setStory] = useState<string>("");
  const [pages, setPages] = useState<number>();
  const [progress, setProgress] = useState("");
  const [runStarted, setRunStarted] = useState<boolean>(false);
  const [runFinished, setRunFinished] = useState<boolean | null>(null);
  const [currentTool, setCurrentTool] = useState("");
  const [events, setEvents] = useState<Frame[]>([]);
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);

  async function runScript() {
    setRunStarted(true);
    setRunFinished(false);

    const response = await fetch("api/run-script", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ story, pages, path: storiesPath }),
    });

    if (response.ok && response.body) {
      // Handle Streams from the API
      console.log("Streaming Started ");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      handleStream(reader, decoder);
    } else {
      setRunFinished(true);
      setRunStarted(false);
      console.error("Failed to start streaming");
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsEmailValid(isValidEmail(newEmail)); // Validate email
  };

  const dialogOpen = async () => {
    if (!isEmailValid) {
      alert("Please enter a valid email address.");
      return;
    }

    const response = await fetch("api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ story, pages, email: email }), // Pass email here
    });

    if (response.ok) {
      console.log("Email sent successfully!");
      alert("Your story has been emailed!");
    } else {
      console.error("Failed to send email");
      alert("There was an issue sending your story. Please try again.");
    }
  };
  
  

  // async function handleStream(
  //   reader: ReadableStreamDefaultReader<Uint8Array>,
  //   decoder: TextDecoder
  // ) {
  //   // Manage  the stream from the API...
  //   while (true) {
  //     const { done, value } = await reader.read();

  //     if (done) break; //breaks out of the Infinite Loop

  //     // Explanation: The decoder is used to decode the Uint8Array into a string.
  //     const chunk = decoder.decode(value, { stream: true });

  //     // Explanation: We split the chunk into events bby splitting it by the event: Keyword
  //     const eventData = chunk
  //       .split("\n\n")
  //       .filter((line) => line.startsWith("event: "))
  //       .map((line) => line.replace(/^event: /, ""));

  //     // Explanation: We parse the JSON data and update the state accordingly.
  //     eventData.forEach((data) => {
  //       try {
  //         const parsedData = JSON.parse(data);
  //         // console.log(parsedData)
  //         if (parsedData.type === "callProgress") {
  //           setProgress(
  //             parsedData.output[parsedData.output.length - 1].content
  //           );
  //           setCurrentTool(parsedData.tool?.description || "");
  //         } else if (parsedData.type === "callStart") {
  //           setCurrentTool(parsedData.tool?.description || "");
  //         } else if (parsedData.type === "runFinish") {
  //           setRunFinished(true);

  //           setRunStarted(false);
  //         } else {
  //           setEvents((prevEvents) => [...prevEvents, parsedData]);
  //         }
  //       } catch (error) {
  //         console.log("Here I am -->");
  //         console.error("Failed to parse JSON", error);
  //       }
  //     });
  //   }
  // }
  async function handleStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    decoder: TextDecoder
  ) {
    // Initialize a buffer to accumulate incomplete data
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break; // Breaks out of the Infinite Loop

      // Decode the Uint8Array into a string
      buffer += decoder.decode(value, { stream: true });

      // Split the buffer into events by double newline
      const eventData = buffer.split("\n\n");
      buffer = eventData.pop() || ""; // Retain the last, potentially incomplete chunk or an empty string

      eventData.forEach((line) => {
        if (line.startsWith("event: ")) {
          try {
            // Parse JSON after stripping the event: prefix
            const parsedData = JSON.parse(line.replace(/^event: /, ""));

            // Handle parsed data according to its type
            if (parsedData.type === "callProgress") {
              setProgress(
                parsedData.output[parsedData.output.length - 1].content
              );
              setCurrentTool(parsedData.tool?.description || ""); // Use empty string as default
            } else if (parsedData.type === "callStart") {
              setCurrentTool(parsedData.tool?.description || ""); // Use empty string as default
            } else if (parsedData.type === "runFinish") {
              setRunFinished(true);
              setRunStarted(false);
            } else {
              setEvents((prevEvents) => [...prevEvents, parsedData]);
            }
          } catch (error) {
            console.error("Failed to parse JSON", error);
          }
        }
      });
    }

    // If there's any remaining data in the buffer after stream ends, handle it
    if (buffer) {
      console.warn("Remaining buffer data:", buffer);
      // Optionally, you can handle this leftover data here if necessary
    }
  }

  useEffect(() => {
    if (runFinished) {
      toast.success("Story generated successfully!", {
        action: (
          <Button
            onClick={() => router.push("/stories")}
            className="bg-fuchsia-500 ml-auto"
          >
            View Stories
          </Button>
        ),
      });
    }
  }, [runFinished, router]);

  return (
    <div className="flex flex-col container">
      <section className="flex-1 flex flex-col container border border-fuchsia-300 rounded-md p-5 space-y-2 lg:p-10">
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
        className="p-2 border rounded text-sm"
        placeholder="Enter your email"
      />
      {!isEmailValid && <span className="text-red-500 text-sm">Invalid email address.</span>}
        <Textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="flex-1 text-black"
          placeholder="Describe an encounter where two unlikely characters form a surprising bond..."
        />
        <Select onValueChange={(value) => setPages(parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="How many pages should the dream weave?" />
          </SelectTrigger>

          <SelectContent className="w-full">
            {Array.from({ length: 10 }, (_, i) => (
              <SelectItem key={i} value={String(i + 1)}>
                {" "}
                {i + 1}{" "}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          disabled={!story || !pages || !email || runStarted}
          className="w-full"
          size="lg"
          // onClick={runScript}
          onClick={dialogOpen}
        >
          Weave the Story
        </Button>
      </section>

      <section className="flex-1 pb-5 mt-5 ">
        {/* 'flex-col-reverse' coz we want auto scroll as new data comes up */}
        <div className="flex flex-col-reverse w-full space-y-2 bg-gray-800 rounded-md text-gray-200 font-mono p-10 h-96 overflow-y-auto">
          <div>
            {runFinished === null && (
              <>
                <p className="animate-pulse mr-5">
                  I am waiting for you to Weave a story above...
                </p>
                <br />
              </>
            )}

            <span className="mr-5">{">>"}</span>
            {progress}
          </div>

          {/* Current Tool */}
          {currentTool && (
            <div className="py-10">
              <span className="mr-5">{"--- [Current Tool] ---"}</span>

              {currentTool}
            </div>
          )}

          {/* Render Events here... */}
          <div className="space-y-5">
            {events.map((event, index) => (
              <div key={index}>
                <span className="mr-5">{">>"}</span>
                {renderEventMessage(event)}
              </div>
            ))}
          </div>

          {runStarted && (
            <div>
              <span className="mr-5 animate-in">
                {"--- [Dream Weaver AI is Now Active] ---"}
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default DreamWriter;
