// 🧠💀 Brain Drain - The Server
// One server to drain them all

import "dotenv/config";
import express from "express";
import { STYLES } from "./styles.js";
import { drainKnowledge, saveDrain, listDrains, readDrain } from "./drainer.js";
import matter from "gray-matter";
import { marked } from "marked";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the main UI
app.get("/", async (_req, res) => {
  const drains = await listDrains();
  res.send(renderPage(renderHome(drains)));
});

// API: Get styles
app.get("/api/styles", (_req, res) => {
  res.json(STYLES);
});

// API: Generate new drain
app.post("/api/drain", async (req, res) => {
  try {
    const { topic, style, slant } = req.body;
    
    if (!topic || !style) {
      return res.status(400).json({ error: "Topic and style are required" });
    }

    const result = await drainKnowledge({ topic, style, slant: slant || undefined });
    await saveDrain(result);

    res.json({
      success: true,
      filename: result.filename,
      tokens: result.tokens,
    });
  } catch (error) {
    console.error("Drain error:", error);
    res.status(500).json({ error: "Brain drain failed! The AI resisted." });
  }
});

// API: List all drains
app.get("/api/drains", async (_req, res) => {
  const drains = await listDrains();
  res.json(drains);
});

// View a specific drain
app.get("/view/:filename", async (req, res) => {
  try {
    const content = await readDrain(req.params.filename);
    const { data, content: mdContent } = matter(content);
    const html = await marked(mdContent);
    res.send(renderPage(renderDrain(data, html, req.params.filename)));
  } catch {
    res.status(404).send(renderPage("<h1>🧠💀 Brain not found!</h1><p>This knowledge has been lost to the void.</p>"));
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
🧠💀 ================================== 💀🧠
   
   BRAIN DRAIN is running!
   
   Open: http://localhost:${PORT}
   
   Ready to extract some knowledge...
   
🧠💀 ================================== 💀🧠
  `);
});

// ============================================
// HTML Rendering (the fun part!)
// ============================================

function renderPage(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🧠💀 Brain Drain</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Creepster&family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #0a0a0f;
      --bg-card: #12121a;
      --bg-hover: #1a1a25;
      --text-primary: #e4e4e7;
      --text-muted: #71717a;
      --accent: #8b5cf6;
      --accent-glow: rgba(139, 92, 246, 0.3);
      --danger: #ef4444;
      --success: #22c55e;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Space Grotesk', sans-serif;
      background: var(--bg-dark);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Header */
    header {
      text-align: center;
      padding: 3rem 0;
      border-bottom: 1px solid #222;
      margin-bottom: 2rem;
    }

    .logo {
      font-family: 'Creepster', cursive;
      font-size: 4rem;
      background: linear-gradient(135deg, #8b5cf6, #ec4899, #ef4444);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 0 60px var(--accent-glow);
      animation: pulse 3s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    .tagline {
      color: var(--text-muted);
      font-size: 1.1rem;
      margin-top: 0.5rem;
    }

    /* Form Styles */
    .drain-form {
      background: var(--bg-card);
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid #222;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    input[type="text"], textarea {
      width: 100%;
      padding: 0.875rem 1rem;
      background: var(--bg-dark);
      border: 2px solid #333;
      border-radius: 0.5rem;
      color: var(--text-primary);
      font-family: inherit;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    input[type="text"]:focus, textarea:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    /* Style Selector */
    .style-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.75rem;
    }

    .style-option {
      position: relative;
    }

    .style-option input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .style-option label {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 0.5rem;
      background: var(--bg-dark);
      border: 2px solid #333;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .style-option label:hover {
      background: var(--bg-hover);
      border-color: #444;
    }

    .style-option input:checked + label {
      border-color: var(--accent);
      background: rgba(139, 92, 246, 0.1);
      box-shadow: 0 0 20px var(--accent-glow);
    }

    .style-emoji {
      font-size: 2rem;
      margin-bottom: 0.25rem;
    }

    .style-name {
      font-size: 0.8rem;
      font-weight: 600;
    }

    /* Button */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-family: inherit;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px var(--accent-glow);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: var(--bg-card);
      border: 2px solid #333;
    }

    .btn-secondary:hover {
      background: var(--bg-hover);
      box-shadow: none;
    }

    /* Drains List */
    .drains-section {
      margin-top: 3rem;
    }

    .section-title {
      font-family: 'Creepster', cursive;
      font-size: 2rem;
      margin-bottom: 1.5rem;
      color: var(--accent);
    }

    .drains-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .drain-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: var(--bg-card);
      border: 1px solid #222;
      border-radius: 0.75rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
    }

    .drain-item:hover {
      background: var(--bg-hover);
      border-color: var(--accent);
      transform: translateX(4px);
    }

    .drain-emoji {
      font-size: 1.5rem;
    }

    .drain-info {
      flex: 1;
    }

    .drain-topic {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .drain-meta {
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    /* Article View */
    .article {
      background: var(--bg-card);
      border-radius: 1rem;
      padding: 2.5rem;
      border: 1px solid #222;
    }

    .article-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #333;
    }

    .meta-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.4rem 0.8rem;
      background: var(--bg-dark);
      border-radius: 2rem;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .article-content {
      font-size: 1.05rem;
      line-height: 1.8;
    }

    .article-content h1 {
      font-family: 'Creepster', cursive;
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      background: linear-gradient(135deg, var(--accent), #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .article-content h2 {
      font-size: 1.5rem;
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: var(--accent);
    }

    .article-content h3 {
      font-size: 1.25rem;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }

    .article-content p {
      margin-bottom: 1rem;
    }

    .article-content ul, .article-content ol {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }

    .article-content li {
      margin-bottom: 0.5rem;
    }

    .article-content blockquote {
      border-left: 3px solid var(--accent);
      padding-left: 1rem;
      margin: 1.5rem 0;
      color: var(--text-muted);
      font-style: italic;
    }

    .article-content code {
      font-family: 'JetBrains Mono', monospace;
      background: var(--bg-dark);
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.9em;
    }

    .article-content em {
      color: #ec4899;
    }

    .article-content strong {
      color: #fff;
    }

    /* Back link */
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      text-decoration: none;
      margin-bottom: 1.5rem;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: var(--accent);
    }

    /* Loading State */
    .loading {
      display: none;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(139, 92, 246, 0.1);
      border-radius: 0.5rem;
      margin-top: 1rem;
    }

    .loading.active {
      display: flex;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #333;
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-muted);
    }

    .empty-state .emoji {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      background: var(--bg-card);
      border: 1px solid var(--success);
      border-radius: 0.5rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s;
    }

    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .container { padding: 1rem; }
      .logo { font-size: 2.5rem; }
      .style-grid { grid-template-columns: repeat(2, 1fr); }
      .drain-form { padding: 1.25rem; }
      .article { padding: 1.5rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <a href="/" style="text-decoration: none;">
        <h1 class="logo">🧠 Brain Drain 💀</h1>
      </a>
      <p class="tagline">Drain AI brains with attitude • Knowledge extraction with style</p>
    </header>
    
    ${content}
  </div>

  <div class="toast" id="toast"></div>

  <script>
    function showToast(message, type = 'success') {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.style.borderColor = type === 'success' ? '#22c55e' : '#ef4444';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
  </script>
</body>
</html>`;
}

function renderHome(drains: string[]): string {
  const styleOptions = STYLES.map((s, i) => `
    <div class="style-option">
      <input type="radio" name="style" id="style-${s.id}" value="${s.id}" ${i === 0 ? 'checked' : ''}>
      <label for="style-${s.id}" title="${s.description}">
        <span class="style-emoji">${s.emoji}</span>
        <span class="style-name">${s.name}</span>
      </label>
    </div>
  `).join("");

  const drainsList = drains.length > 0 
    ? drains.slice(0, 20).map(filename => {
        const parts = filename.replace('.md', '').split('-');
        const date = parts.slice(0, 3).join('-');
        const styleId = parts[parts.length - 1];
        const topic = parts.slice(3, -1).join(' ');
        const style = STYLES.find(s => s.id === styleId);
        return `
          <a href="/view/${filename}" class="drain-item">
            <span class="drain-emoji">${style?.emoji || '📄'}</span>
            <div class="drain-info">
              <div class="drain-topic">${topic || filename}</div>
              <div class="drain-meta">${style?.name || styleId} • ${date}</div>
            </div>
          </a>
        `;
      }).join("")
    : `<div class="empty-state">
        <div class="emoji">🧠</div>
        <p>No brains drained yet! Generate your first knowledge dump above.</p>
      </div>`;

  return `
    <form class="drain-form" id="drainForm" onsubmit="handleSubmit(event)">
      <div class="form-group">
        <label for="topic">🎯 Topic to Drain</label>
        <input type="text" id="topic" name="topic" placeholder="e.g., The History of Cheese, Quantum Computing, Why Cats Purr..." required>
      </div>

      <div class="form-group">
        <label>🎭 Choose Your Style</label>
        <div class="style-grid">
          ${styleOptions}
        </div>
      </div>

      <div class="form-group">
        <label for="slant">📐 Slant / Perspective (optional)</label>
        <input type="text" id="slant" name="slant" placeholder="e.g., pro-capitalism, skeptical, overly enthusiastic, anti-modern...">
      </div>

      <button type="submit" class="btn" id="submitBtn">
        <span>🧠</span> Drain That Brain!
      </button>

      <div class="loading" id="loading">
        <div class="spinner"></div>
        <span>Extracting knowledge with attitude...</span>
      </div>
    </form>

    <section class="drains-section">
      <h2 class="section-title">📚 Previous Drains</h2>
      <div class="drains-list" id="drainsList">
        ${drainsList}
      </div>
    </section>

    <script>
      async function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const btn = document.getElementById('submitBtn');
        const loading = document.getElementById('loading');
        
        const data = {
          topic: form.topic.value,
          style: form.querySelector('input[name="style"]:checked').value,
          slant: form.slant.value || undefined
        };

        btn.disabled = true;
        loading.classList.add('active');

        try {
          const res = await fetch('/api/drain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          const result = await res.json();
          
          if (result.success) {
            showToast('🧠 Brain successfully drained! ' + result.tokens.total + ' tokens extracted');
            setTimeout(() => {
              window.location.href = '/view/' + result.filename;
            }, 1000);
          } else {
            showToast(result.error || 'Failed to drain brain!', 'error');
          }
        } catch (err) {
          showToast('Something went wrong!', 'error');
        } finally {
          btn.disabled = false;
          loading.classList.remove('active');
        }
      }
    </script>
  `;
}

function renderDrain(meta: any, html: string, filename: string): string {
  const style = STYLES.find(s => s.id === meta.style);
  
  return `
    <a href="/" class="back-link">← Back to Brain Drain</a>
    
    <article class="article" style="--article-accent: ${style?.color || '#8b5cf6'}">
      <div class="article-meta">
        <span class="meta-tag">${style?.emoji || '📄'} ${meta.styleName || meta.style}</span>
        ${meta.slant ? `<span class="meta-tag">📐 ${meta.slant}</span>` : ''}
        <span class="meta-tag">📅 ${new Date(meta.generatedAt).toLocaleDateString()}</span>
        <span class="meta-tag">🔢 ${meta.tokens?.total || '?'} tokens</span>
      </div>
      
      <div class="article-content">
        ${html}
      </div>
    </article>
  `;
}
