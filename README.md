# Simplify

A minimal AI-powered Chrome extension that explains selected text in simple language instantly.

Simplify focuses on:
- Minimalistic UI
- Fast responses
- Short concise explanations
- Smooth user experience
- Low-cost AI architecture

---

#  Features

- Highlight any text on a webpage
- Floating “✨ Simplify” button
- AI-generated concise explanations
- Skeleton loading animation
- Minimal responsive popup UI
- Secure backend architecture
- Deployed FastAPI backend
- Groq-powered inference

---

# Tech Stack

## Frontend
- Chrome Extension (Manifest V3)
- Vanilla JavaScript
- HTML/CSS

## Backend
- FastAPI
- Groq API
- Render Deployment

## AI Model
- llama-3.1-8b-instant

---

# Project Structure

```

simplify-extension/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .gitignore
│
├── extension/
│   ├── manifest.json
│   ├── content.js
│   ├── styles.css
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js

```

---

# Backend Setup

## 1. Clone Repository

```bash
git clone https://github.com/Tarun-004/simplify-extension.git
```

---

## 2. Create Virtual Environment

```bash
python -m venv venv
```

Activate virtual environment:

### Windows

```bash
venv\Scripts\activate
```

### Mac/Linux

```bash
source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Create `.env` File

Inside backend folder:

```

GROQ_API_KEY=your_api_key_here

```

---

## 5. Run Backend

```bash
uvicorn main:app --reload
```

Backend runs on:

```

http://localhost:8000

```

---

# Deploying Backend (Render)

## Build Command

```bash
pip install -r requirements.txt
```

## Start Command

```bash
uvicorn main:app --host 0.0.0.0 --port 10000
```

## Environment Variable

```

GROQ_API_KEY=your_api_key

```

---

# Loading Extension In Chrome

1. Open Chrome
2. Go to:

```

chrome://extensions

```

3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the extension folder

---

# Update Backend URL

Replace localhost URLs in:

- `content.js`
- `popup.js`

Example:

```js
https://your-render-url.onrender.com/explain
```

---

# How It Works

1. User highlights text
2. Extension displays floating simplify button
3. Selected text sent to backend
4. Groq API generates concise explanation
5. Result displayed in floating card

---

# Security

- API key stored securely in backend environment variables
- `.env` excluded using `.gitignore`
- Extension never exposes API keys

---

# Current MVP Features

- Minimal floating UI
- AI explanations
- Smooth animations
- Skeleton loading
- Online backend deployment
- Dynamic explanation length

---

# Future Improvements

- Keyboard shortcuts
- Better edge positioning
- Request timeout handling
- Rate limiting
- Multilingual explanations
- Smarter summarization

---
