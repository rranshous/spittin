// 🧠💀 Brain Drain - Knowledge Drainer
// The AI-powered knowledge extraction engine

import "dotenv/config";
import { OpenRouter } from "@openrouter/sdk";
import { DrainStyle, getStyle } from "./styles.js";
import fs from "fs/promises";
import path from "path";

const openRouter = new OpenRouter({
  apiKey: process.env["OPENROUTER_API_KEY"] ?? "",
});

export interface DrainRequest {
  topic: string;
  style: string;
  slant?: string;
}

export interface DrainResult {
  topic: string;
  style: DrainStyle;
  slant?: string;
  content: string;
  filename: string;
  generatedAt: string;
  model: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
}

function buildPrompt(topic: string, style: DrainStyle, slant?: string): string {
  let prompt = `Write a comprehensive, VERY DETAILED and LENGTHY article about: "${topic}"

You are writing in the "${style.name}" style. Embrace this personality fully!

Your task is to share EVERYTHING interesting and important about this topic. Go deep!
Include:
- What it is and why it matters
- Key facts, history, or background  
- Interesting details most people don't know
- Deep dives into specific aspects
- Current relevance or modern context
- Any controversies or debates (if applicable)
- Related topics and connections
- Fun facts and trivia

Be THOROUGH and EXHAUSTIVE. This is a brain drain - extract ALL the knowledge!
Use markdown formatting with headers, subheaders, bullet points, etc.
Start with a compelling introduction (no title needed - that will be added separately).
Aim for a long, comprehensive piece - don't hold back!`;

  if (slant) {
    prompt += `

IMPORTANT SLANT/PERSPECTIVE: Frame this entire article with a "${slant}" perspective or bias. 
Let this slant color your word choices, what you emphasize, and how you present information.
Don't explicitly mention the slant - just let it influence the writing naturally.`;
  }

  return prompt;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

function generateFilename(topic: string, style: string): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const slug = slugify(topic);
  return `${timestamp}-${slug}-${style}.md`;
}

function buildFrontmatter(result: Omit<DrainResult, "filename">): string {
  const frontmatter = {
    topic: result.topic,
    style: result.style.id,
    styleName: result.style.name,
    styleEmoji: result.style.emoji,
    ...(result.slant && { slant: result.slant }),
    generatedAt: result.generatedAt,
    model: result.model,
    tokens: result.tokens,
  };

  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (typeof value === "object") {
        return `${key}:\n${Object.entries(value)
          .map(([k, v]) => `  ${k}: ${v}`)
          .join("\n")}`;
      }
      if (typeof value === "string" && (value.includes(":") || value.includes('"'))) {
        return `${key}: "${value.replace(/"/g, '\\"')}"`;
      }
      return `${key}: ${value}`;
    })
    .join("\n");

  return `---\n${yaml}\n---`;
}

export async function drainKnowledge(request: DrainRequest): Promise<DrainResult> {
  const style = getStyle(request.style);
  const prompt = buildPrompt(request.topic, style, request.slant);

  console.log(`🧠 Draining knowledge about "${request.topic}" in ${style.name} style...`);
  if (request.slant) {
    console.log(`   📐 Slant: ${request.slant}`);
  }

  const result = await openRouter.chat.send({
    model: "x-ai/grok-4.1-fast:free",
    messages: [
      { role: "system", content: style.systemPrompt },
      { role: "user", content: prompt },
    ],
    maxTokens: 20000,
  });

  const rawContent = result.choices[0]?.message?.content;
  const content = typeof rawContent === "string" ? rawContent : "Brain drain failed - no content returned!";
  const generatedAt = new Date().toISOString();
  const model = result.model || "x-ai/grok-4.1-fast:free";

  const tokens = {
    prompt: result.usage?.promptTokens || 0,
    completion: result.usage?.completionTokens || 0,
    total: result.usage?.totalTokens || 0,
  };

  const filename = generateFilename(request.topic, style.id);

  return {
    topic: request.topic,
    style,
    slant: request.slant,
    content,
    filename,
    generatedAt,
    model,
    tokens,
  };
}

export async function saveDrain(result: DrainResult): Promise<string> {
  const knowledgeDir = path.join(process.cwd(), "knowledge");
  await fs.mkdir(knowledgeDir, { recursive: true });

  const frontmatter = buildFrontmatter(result);
  const title = `# ${result.style.emoji} ${result.topic}\n\n`;
  const slantNote = result.slant ? `> *Perspective: ${result.slant}*\n\n` : "";
  const fullContent = `${frontmatter}\n\n${title}${slantNote}${result.content}`;

  const filepath = path.join(knowledgeDir, result.filename);
  await fs.writeFile(filepath, fullContent, "utf-8");

  console.log(`💾 Saved to ${filepath}`);
  return filepath;
}

export async function listDrains(): Promise<string[]> {
  const knowledgeDir = path.join(process.cwd(), "knowledge");
  try {
    const files = await fs.readdir(knowledgeDir);
    return files.filter(f => f.endsWith(".md")).sort().reverse();
  } catch {
    return [];
  }
}

export async function readDrain(filename: string): Promise<string> {
  const filepath = path.join(process.cwd(), "knowledge", filename);
  return fs.readFile(filepath, "utf-8");
}
