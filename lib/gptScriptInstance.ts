import { GPTScript } from "@gptscript-ai/gptscript";

const g = new GPTScript({
  APIKey: process.env.OPENAI_API_KEY,
  BaseURL: "https://models.inference.ai.azure.com",
  DefaultModel: "gpt-4o",
  // DefaultModel: "gpt-4o-mini",
});

export default g;
