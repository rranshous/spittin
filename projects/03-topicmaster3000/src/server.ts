// 🍞 TopicMaster 3000 - The Server
// Toasting knowledge since 2025!

import "dotenv/config";
import express from "express";
import { CATEGORIES, getCategory, getRandomTopic } from "./topics.js";
import { OpenRouter } from "@openrouter/sdk";

const app = express();
const PORT = process.env.PORT || 3000;

const openRouter = new OpenRouter({
  apiKey: process.env["OPENROUTER_API_KEY"] ?? "",
});

app.use(express.json());

// Serve the main UI
app.get("/", (_req, res) => {
  res.send(renderPage(renderHome()));
});

// API: Get all categories
app.get("/api/categories", (_req, res) => {
  res.json(CATEGORIES.map(c => ({
    id: c.id,
    name: c.name,
    emoji: c.emoji,
    description: c.description,
    isKidsMode: c.isKidsMode,
    color: c.color,
    timerSeconds: c.timerSeconds,
  })));
});

// API: Get a random topic from a category
app.get("/api/topic/:categoryId", (req, res) => {
  const category = getCategory(req.params.categoryId);
  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }
  const topic = getRandomTopic(category);
  res.json({
    ...topic,
    categoryId: category.id,
    categoryName: category.name,
    isKidsMode: category.isKidsMode,
    timerSeconds: category.timerSeconds,
    color: category.color,
  });
});

// API: Rate an explanation
app.post("/api/rate", async (req, res) => {
  try {
    const { topic, explanation, isKidsMode, hint } = req.body;

    if (!topic || !explanation) {
      return res.status(400).json({ error: "Topic and explanation are required" });
    }

    const systemPrompt = isKidsMode
      ? `You are a super friendly, encouraging judge for a kids' explanation game called TopicMaster 3000!
Your job is to rate how well a child explained a topic. Be VERY encouraging and positive!
- Always find something good to say first
- Use simple words and lots of enthusiasm
- Give a score from 1-5 stars (everyone gets at least 2 stars!)
- Add fun emojis
- If they struggled, be gentle and say "Great try!" 
- Never be critical or make them feel bad
- Celebrate their effort!

Respond in JSON format:
{
  "stars": <number 2-5>,
  "feedback": "<encouraging feedback with emojis>",
  "funFact": "<a simple fun fact about the topic>"
}`
      : `You are a friendly, warm judge for a family explanation game called TopicMaster 3000 at Thanksgiving dinner!
Your job is to rate how well someone explained a topic. Be encouraging but honest.
- Start with something positive
- Give constructive feedback warmly
- Give a score from 1-10
- Keep it fun and family-friendly!
- Add a brief interesting fact they might not have mentioned

Respond in JSON format:
{
  "score": <number 1-10>,
  "feedback": "<warm, encouraging feedback>",
  "funFact": "<an interesting fact about the topic>"
}`;

    const userPrompt = isKidsMode
      ? `The topic was: "${topic}"${hint ? ` (Hint: ${hint})` : ""}

The child's explanation: "${explanation}"

Rate this explanation for a kid! Remember to be super encouraging!`
      : `The topic was: "${topic}"

The explanation given: "${explanation}"

Rate this explanation! Remember this is Thanksgiving dinner - keep it warm and fun!`;

    const result = await openRouter.chat.send({
      model: "x-ai/grok-4.1-fast:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      maxTokens: 500,
    });

    const content = result.choices[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("No content in response");
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse response");
    }

    const rating = JSON.parse(jsonMatch[0]);
    res.json({
      ...rating,
      isKidsMode,
    });
  } catch (error) {
    console.error("Rating error:", error);
    // Fallback response
    res.json({
      score: 7,
      stars: 4,
      feedback: "Great explanation! You really know your stuff! 🎉",
      funFact: "Every explanation helps us learn something new!",
      isKidsMode: req.body.isKidsMode,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
🍞✨ ================================== ✨🍞
   
   TOPICMASTER 3000 is toasting!
   
   Open: http://localhost:${PORT}
   
   Ready to master some topics!
   
🍞✨ ================================== ✨🍞
  `);
});

// ============================================
// HTML Rendering
// ============================================

function renderPage(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🍞 TopicMaster 3000</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #1a1a2e;
      --bg-card: #16213e;
      --bg-lighter: #1f2937;
      --text-primary: #eee;
      --text-muted: #94a3b8;
      --accent: #f59e0b;
      --accent-glow: rgba(245, 158, 11, 0.3);
      --kids-gradient: linear-gradient(135deg, #f472b6, #818cf8, #34d399, #fbbf24);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Nunito', sans-serif;
      background: var(--bg-dark);
      color: var(--text-primary);
      min-height: 100vh;
      overflow-x: hidden;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Header */
    header {
      text-align: center;
      padding: 2rem 0 3rem;
    }

    .logo {
      font-family: 'Bangers', cursive;
      font-size: 4.5rem;
      color: var(--accent);
      text-shadow: 4px 4px 0 #b45309, 6px 6px 0 rgba(0,0,0,0.3);
      letter-spacing: 0.05em;
      animation: bounce 2s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .tagline {
      font-size: 1.3rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
    }

    /* Category Grid */
    .categories-section {
      margin-bottom: 2rem;
    }

    .section-title {
      font-family: 'Bangers', cursive;
      font-size: 2rem;
      margin-bottom: 1.5rem;
      color: var(--accent);
      letter-spacing: 0.05em;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .category-card {
      background: var(--bg-card);
      border-radius: 1rem;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s;
      border: 3px solid transparent;
      text-align: center;
    }

    .category-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }

    .category-card.kids {
      background: linear-gradient(135deg, rgba(244,114,182,0.2), rgba(129,140,248,0.2));
      border: 3px dashed rgba(255,255,255,0.3);
    }

    .category-card.kids:hover {
      border-color: #f472b6;
    }

    .category-emoji {
      font-size: 3.5rem;
      margin-bottom: 0.5rem;
      display: block;
    }

    .category-name {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .category-desc {
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .kids-badge {
      display: inline-block;
      background: var(--kids-gradient);
      color: white;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 1rem;
      margin-top: 0.5rem;
      text-transform: uppercase;
    }

    /* Game Screen */
    #game-screen {
      display: none;
      text-align: center;
    }

    #game-screen.active {
      display: block;
    }

    .game-header {
      margin-bottom: 2rem;
    }

    .back-btn {
      background: var(--bg-lighter);
      border: none;
      color: var(--text-primary);
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-family: inherit;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .back-btn:hover {
      background: #374151;
    }

    /* Topic Display */
    .topic-container {
      background: var(--bg-card);
      border-radius: 2rem;
      padding: 3rem;
      margin: 2rem auto;
      max-width: 700px;
      position: relative;
      overflow: hidden;
    }

    .topic-container.kids-mode {
      background: linear-gradient(135deg, rgba(244,114,182,0.15), rgba(129,140,248,0.15), rgba(52,211,153,0.15));
      border: 4px solid rgba(255,255,255,0.2);
    }

    .topic-word {
      font-family: 'Bangers', cursive;
      font-size: 4rem;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
      animation: revealWord 0.5s ease-out;
    }

    @keyframes revealWord {
      from {
        opacity: 0;
        transform: scale(0.5) rotateX(90deg);
      }
      to {
        opacity: 1;
        transform: scale(1) rotateX(0);
      }
    }

    .topic-hint {
      font-size: 1.3rem;
      color: #fbbf24;
      margin-bottom: 1rem;
    }

    .topic-category {
      font-size: 1rem;
      color: var(--text-muted);
    }

    /* Timer */
    .timer-container {
      margin: 2rem auto;
      max-width: 500px;
    }

    .timer-bar-bg {
      background: var(--bg-lighter);
      border-radius: 1rem;
      height: 30px;
      overflow: hidden;
      position: relative;
    }

    .timer-bar {
      height: 100%;
      background: linear-gradient(90deg, #22c55e, #84cc16, #eab308, #f97316, #ef4444);
      border-radius: 1rem;
      transition: width 0.1s linear;
      width: 100%;
    }

    .timer-bar.warning {
      animation: pulse-warning 0.5s ease-in-out infinite;
    }

    @keyframes pulse-warning {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .timer-text {
      font-family: 'Bangers', cursive;
      font-size: 3rem;
      margin-top: 1rem;
      color: var(--accent);
    }

    .timer-text.warning {
      color: #ef4444;
      animation: shake 0.5s ease-in-out infinite;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    /* STT Status */
    .stt-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin: 1.5rem 0;
      font-size: 1.1rem;
    }

    .stt-dot {
      width: 16px;
      height: 16px;
      background: #ef4444;
      border-radius: 50%;
      animation: pulse-dot 1s ease-in-out infinite;
    }

    .stt-dot.listening {
      background: #22c55e;
    }

    @keyframes pulse-dot {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.7; }
    }

    .transcript-box {
      background: var(--bg-lighter);
      border-radius: 1rem;
      padding: 1.5rem;
      margin: 1.5rem auto;
      max-width: 600px;
      min-height: 100px;
      font-size: 1.2rem;
      line-height: 1.6;
      text-align: left;
    }

    .transcript-box.kids-mode {
      font-size: 1.4rem;
      background: rgba(255,255,255,0.1);
    }

    .transcript-placeholder {
      color: var(--text-muted);
      font-style: italic;
    }

    /* Results Screen */
    #results-screen {
      display: none;
      text-align: center;
    }

    #results-screen.active {
      display: block;
    }

    .results-container {
      background: var(--bg-card);
      border-radius: 2rem;
      padding: 3rem;
      margin: 2rem auto;
      max-width: 600px;
      animation: slideUp 0.5s ease-out;
    }

    .results-container.kids-mode {
      background: linear-gradient(135deg, rgba(244,114,182,0.2), rgba(129,140,248,0.2));
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .score-display {
      font-family: 'Bangers', cursive;
      font-size: 6rem;
      margin-bottom: 1rem;
    }

    .score-display.kids-mode {
      font-size: 4rem;
    }

    .stars {
      font-size: 3.5rem;
      letter-spacing: 0.5rem;
    }

    .feedback-text {
      font-size: 1.3rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .fun-fact {
      background: var(--bg-lighter);
      border-radius: 1rem;
      padding: 1.25rem;
      margin-top: 1.5rem;
    }

    .fun-fact-label {
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 0.5rem;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      background: var(--accent);
      color: #1a1a2e;
      border: none;
      border-radius: 1rem;
      font-family: 'Nunito', sans-serif;
      font-size: 1.2rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      margin: 0.5rem;
    }

    .btn:hover {
      transform: scale(1.05);
      box-shadow: 0 5px 20px var(--accent-glow);
    }

    .btn-secondary {
      background: var(--bg-lighter);
      color: var(--text-primary);
    }

    .btn-secondary:hover {
      background: #374151;
      box-shadow: none;
    }

    .btn-kids {
      background: var(--kids-gradient);
      color: white;
      font-size: 1.4rem;
      padding: 1.25rem 2.5rem;
    }

    /* Loading */
    .loading-spinner {
      display: inline-block;
      width: 24px;
      height: 24px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .logo { font-size: 3rem; }
      .topic-word { font-size: 2.5rem; }
      .category-grid { grid-template-columns: repeat(2, 1fr); }
      .score-display { font-size: 4rem; }
    }

    /* Confetti animation for kids */
    .confetti {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>

  <script>
    // State
    let currentCategory = null;
    let currentTopic = null;
    let timer = null;
    let timeLeft = 30;
    let recognition = null;
    let transcript = '';
    let isListening = false;

    // Elements
    const homeScreen = document.getElementById('home-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultsScreen = document.getElementById('results-screen');

    // Initialize Speech Recognition
    function initSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech recognition not supported in this browser. Try Chrome!');
        return false;
      }

      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          transcript += finalTranscript + ' ';
        }

        updateTranscriptDisplay(transcript + interimTranscript);
      };

      recognition.onerror = (event) => {
        console.log('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Restart if no speech detected
          try { recognition.start(); } catch(e) {}
        }
      };

      recognition.onend = () => {
        // Restart if we're still in the game
        if (isListening && timeLeft > 0) {
          try { recognition.start(); } catch(e) {}
        }
      };

      return true;
    }

    function updateTranscriptDisplay(text) {
      const box = document.getElementById('transcript');
      if (box) {
        box.innerHTML = text || '<span class="transcript-placeholder">Start speaking! I\\'m listening... 🎤</span>';
      }
    }

    // Start a game
    async function startGame(categoryId) {
      // Fetch topic
      const res = await fetch('/api/topic/' + categoryId);
      currentTopic = await res.json();
      currentCategory = currentTopic;

      // Setup UI
      homeScreen.classList.remove('active');
      homeScreen.style.display = 'none';
      resultsScreen.classList.remove('active');
      resultsScreen.style.display = 'none';
      gameScreen.classList.add('active');
      gameScreen.style.display = 'block';

      // Set topic word
      document.getElementById('topic-word').textContent = currentTopic.word;
      document.getElementById('topic-word').style.color = currentTopic.color;
      
      const hintEl = document.getElementById('topic-hint');
      if (currentTopic.hint && currentTopic.isKidsMode) {
        hintEl.textContent = '💡 Hint: ' + currentTopic.hint;
        hintEl.style.display = 'block';
      } else {
        hintEl.style.display = 'none';
      }

      document.getElementById('topic-category').textContent = currentTopic.categoryName;

      // Apply kids mode styling
      const topicContainer = document.getElementById('topic-container');
      const transcriptBox = document.getElementById('transcript');
      if (currentTopic.isKidsMode) {
        topicContainer.classList.add('kids-mode');
        transcriptBox.classList.add('kids-mode');
      } else {
        topicContainer.classList.remove('kids-mode');
        transcriptBox.classList.remove('kids-mode');
      }

      // Reset
      transcript = '';
      updateTranscriptDisplay('');
      timeLeft = currentTopic.timerSeconds;
      updateTimerDisplay();

      // Init and start speech recognition
      if (!recognition) {
        if (!initSpeechRecognition()) return;
      }

      // Small delay then start
      setTimeout(() => {
        isListening = true;
        try { recognition.start(); } catch(e) {}
        document.getElementById('stt-dot').classList.add('listening');
        document.getElementById('stt-text').textContent = 'Listening...';
        startTimer();
      }, 1000);
    }

    function startTimer() {
      updateTimerDisplay();
      timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
          endGame();
        }
      }, 1000);
    }

    function updateTimerDisplay() {
      const bar = document.getElementById('timer-bar');
      const text = document.getElementById('timer-text');
      const percentage = (timeLeft / currentTopic.timerSeconds) * 100;
      
      bar.style.width = percentage + '%';
      text.textContent = timeLeft + 's';

      if (timeLeft <= 10) {
        bar.classList.add('warning');
        text.classList.add('warning');
      } else {
        bar.classList.remove('warning');
        text.classList.remove('warning');
      }
    }

    async function endGame() {
      clearInterval(timer);
      isListening = false;
      
      if (recognition) {
        try { recognition.stop(); } catch(e) {}
      }

      document.getElementById('stt-dot').classList.remove('listening');
      document.getElementById('stt-text').textContent = 'Time\\'s up!';

      // Show loading state
      gameScreen.style.display = 'none';
      resultsScreen.style.display = 'block';
      resultsScreen.classList.add('active');
      
      const resultsContainer = document.getElementById('results-container');
      resultsContainer.innerHTML = '<div class="loading-spinner"></div><p style="margin-top:1rem">Rating your explanation...</p>';
      if (currentTopic.isKidsMode) {
        resultsContainer.classList.add('kids-mode');
      } else {
        resultsContainer.classList.remove('kids-mode');
      }

      // Get rating from API
      const response = await fetch('/api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic.word,
          explanation: transcript || '(No response given)',
          isKidsMode: currentTopic.isKidsMode,
          hint: currentTopic.hint,
        }),
      });

      const rating = await response.json();
      showResults(rating);
    }

    function showResults(rating) {
      const container = document.getElementById('results-container');
      
      let scoreHtml;
      if (rating.isKidsMode || rating.stars) {
        const starCount = rating.stars || 4;
        const stars = '⭐'.repeat(starCount) + '☆'.repeat(5 - starCount);
        scoreHtml = '<div class="stars">' + stars + '</div>';
        // Trigger confetti for kids!
        if (starCount >= 3) {
          createConfetti();
        }
      } else {
        scoreHtml = '<div class="score-display">' + (rating.score || 7) + '/10</div>';
      }

      container.innerHTML = \`
        \${scoreHtml}
        <div class="feedback-text">\${rating.feedback || 'Great job!'}</div>
        <div class="fun-fact">
          <div class="fun-fact-label">💡 Fun Fact:</div>
          <div>\${rating.funFact || 'You learned something new today!'}</div>
        </div>
        <div style="margin-top: 2rem;">
          <button class="btn \${currentTopic.isKidsMode ? 'btn-kids' : ''}" onclick="startGame('\${currentTopic.categoryId}')">
            🔄 Play Again
          </button>
          <button class="btn btn-secondary" onclick="goHome()">
            🏠 Categories
          </button>
        </div>
      \`;
    }

    function goHome() {
      if (timer) clearInterval(timer);
      if (recognition) {
        isListening = false;
        try { recognition.stop(); } catch(e) {}
      }
      
      gameScreen.style.display = 'none';
      gameScreen.classList.remove('active');
      resultsScreen.style.display = 'none';
      resultsScreen.classList.remove('active');
      homeScreen.style.display = 'block';
      homeScreen.classList.add('active');
    }

    function createConfetti() {
      const colors = ['#f472b6', '#818cf8', '#34d399', '#fbbf24', '#f87171'];
      const container = document.createElement('div');
      container.className = 'confetti';
      document.body.appendChild(container);

      for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = \`
          position: absolute;
          width: 10px;
          height: 10px;
          background: \${colors[Math.floor(Math.random() * colors.length)]};
          left: \${Math.random() * 100}%;
          top: -10px;
          border-radius: \${Math.random() > 0.5 ? '50%' : '0'};
          animation: fall \${2 + Math.random() * 2}s linear forwards;
        \`;
        container.appendChild(confetti);
      }

      // Add keyframes
      if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = \`
          @keyframes fall {
            to {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        \`;
        document.head.appendChild(style);
      }

      setTimeout(() => container.remove(), 4000);
    }
  </script>
</body>
</html>`;
}

function renderHome(): string {
  const regularCategories = CATEGORIES.filter(c => !c.isKidsMode);
  const kidsCategories = CATEGORIES.filter(c => c.isKidsMode);

  const renderCategoryCard = (c: typeof CATEGORIES[0]) => `
    <div class="category-card ${c.isKidsMode ? 'kids' : ''}" 
         onclick="startGame('${c.id}')"
         style="border-color: ${c.color}20;">
      <span class="category-emoji">${c.emoji}</span>
      <div class="category-name">${c.name}</div>
      <div class="category-desc">${c.description}</div>
      ${c.isKidsMode ? '<div class="kids-badge">👶 Kids Mode</div>' : ''}
    </div>
  `;

  return `
    <header>
      <h1 class="logo">🍞 TopicMaster 3000</h1>
      <p class="tagline">Explain it! Rate it! Master it!</p>
    </header>

    <div id="home-screen" class="active" style="display: block;">
      <section class="categories-section">
        <h2 class="section-title">📚 Pick a Category</h2>
        <div class="category-grid">
          ${regularCategories.map(renderCategoryCard).join('')}
        </div>
      </section>

      <section class="categories-section" style="margin-top: 3rem;">
        <h2 class="section-title">🌈 Kids Mode</h2>
        <div class="category-grid">
          ${kidsCategories.map(renderCategoryCard).join('')}
        </div>
      </section>
    </div>

    <div id="game-screen">
      <div class="game-header">
        <button class="back-btn" onclick="goHome()">← Back to Categories</button>
      </div>

      <div id="topic-container" class="topic-container">
        <div id="topic-word" class="topic-word">Loading...</div>
        <div id="topic-hint" class="topic-hint" style="display: none;"></div>
        <div id="topic-category" class="topic-category"></div>
      </div>

      <div class="timer-container">
        <div class="timer-bar-bg">
          <div id="timer-bar" class="timer-bar"></div>
        </div>
        <div id="timer-text" class="timer-text">30s</div>
      </div>

      <div class="stt-status">
        <div id="stt-dot" class="stt-dot"></div>
        <span id="stt-text">Get ready...</span>
      </div>

      <div id="transcript" class="transcript-box">
        <span class="transcript-placeholder">Start speaking! I'm listening... 🎤</span>
      </div>
    </div>

    <div id="results-screen">
      <div id="results-container" class="results-container">
        <!-- Results will be inserted here -->
      </div>
    </div>
  `;
}
