# 03 - TopicMaster 3000 🍞

> *Explain it! Rate it! Master it!*

A family-friendly party game where players explain topics out loud and an AI rates their explanations. Perfect for Thanksgiving dinner with the projector! 🦃

## Features

- 🎤 **Speech-to-Text**: Browser captures your explanation in real-time
- ⏱️ **Timer Challenge**: 30 seconds (regular) or 45 seconds (kids mode)
- 🤖 **AI Rating**: Grok evaluates explanations with warm, encouraging feedback
- 👶 **Kids Mode**: Extra encouraging, hint system, stars instead of scores, confetti!
- 📺 **Projector-Ready**: Big text, high contrast, fun animations

## Categories

**Regular:**
- 🇺🇸 American History
- 📖 SAT Words  
- 🔬 Science & Nature
- 🎬 Movies & TV
- 🍳 Food & Cooking
- 💻 Technology
- 🌍 Geography
- 🎵 Music
- 🦃 Thanksgiving Special

**Kids Mode:** (45s timer, hints, stars, confetti!)
- 🦕 Dinosaurs
- 🐾 Animals
- 📺 Cartoons
- 🧙 Fairy Tales
- 🚀 Space
- 🦸 Superheroes

## How to Play

1. Pick a category
2. A topic word appears on screen
3. Explain it out loud before time runs out!
4. AI rates your explanation and shares a fun fact

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

Then open http://localhost:3000

**Note:** Works best in Chrome for speech recognition!

## Tech Stack

- Express.js (server)
- OpenRouter SDK + Grok (AI rating)
- Web Speech API (speech-to-text)
- Vanilla JS + CSS (fun UI with Bangers font!)
