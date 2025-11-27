# 02 - Brain Drain 🧠💀

> *Drain AI brains with attitude - knowledge extraction with style!*

A fun web app that extracts knowledge about any topic using AI, but with personality! Choose from various writing styles and add optional perspective "slants" to make the content uniquely flavored.

## Features

- 🎭 **10 Unique Styles**: From Sarcastic Scholar to Pirate Captain to Film Noir Detective
- 📐 **Custom Slants**: Add perspective biases like "pro-capitalism" or "overly enthusiastic"
- 💾 **Persistent Storage**: All generated content saved as Markdown with YAML frontmatter
- 🎨 **Fun UI**: Dark theme with playful fonts and animations
- 🆓 **Free AI**: Powered by Grok via OpenRouter's free tier

## Styles Available

| Style | Description |
|-------|-------------|
| 📚 Straight Facts | Just the facts, no nonsense |
| 🎩 Entitled Expert | "As someone who REALLY understands this..." |
| 🙄 Sarcastic Scholar | *sighs dramatically* |
| 🔺 Conspiracy Theorist | They don't want you to know this, but... |
| 👴 Rambling Grandpa | Back in my day... |
| 🏄 Surfer Dude | Duuude, this is gnarly! |
| 🕵️ Film Noir Detective | The topic walked in on a rainy Tuesday... |
| 🏴‍☠️ Captain Blackbeard | Arrr, knowledge be the real treasure! |
| 💅 Valley Girl | Oh em gee, this is SO important |
| 🎭 The Bard | Hark! Lend me thine ears! |

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

Then open http://localhost:3000

## How It Works

1. Enter a topic you want to learn about
2. Pick a writing style (the AI's personality)
3. Optionally add a "slant" (perspective/bias)
4. Hit "Drain That Brain!" 🧠
5. Generated content is saved to `knowledge/` folder as Markdown

## Tech Stack

- Express.js (server)
- OpenRouter SDK (AI)
- gray-matter (YAML frontmatter parsing)
- marked (Markdown rendering)
- Vanilla JS + CSS (UI)
- Google Fonts (Creepster + Space Grotesk)
