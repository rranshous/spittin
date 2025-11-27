import "dotenv/config";
import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter({
  apiKey: process.env["OPENROUTER_API_KEY"] ?? "",
});

async function main() {
  console.log("🚀 Hello OpenRouter + Grok!");
  console.log("Sending request to x-ai/grok-4.1-fast:free...\n");

  const result = await openRouter.chat.send({
    model: "x-ai/grok-4.1-fast:free",
    messages: [
      {
        role: "user",
        content: "Hello! Say something witty about being free (as in cost). Keep it brief!",
      },
    ],
  });

  console.log("✅ Response received!\n");
  console.log("Model:", result.model);
  console.log("Response:", result.choices[0].message.content);
  
  if (result.usage) {
    console.log("\n📊 Usage:");
    console.log("  Prompt tokens:", result.usage.promptTokens);
    console.log("  Completion tokens:", result.usage.completionTokens);
    console.log("  Total tokens:", result.usage.totalTokens);
  }
}

main().catch(console.error);
