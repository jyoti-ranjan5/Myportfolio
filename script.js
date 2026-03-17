const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('main section');
const yearEl = document.getElementById('year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

const highlightActiveSection = () => {
  let activeId = '';

  sections.forEach((section) => {
    const top = section.offsetTop - 140;
    const bottom = top + section.offsetHeight;

    if (window.scrollY >= top && window.scrollY < bottom) {
      activeId = section.id;
    }
  });

  navItems.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${activeId}`;
    link.classList.toggle('active', isActive);
  });
};

window.addEventListener('scroll', highlightActiveSection);
highlightActiveSection();

const openOpportunitiesBtn = document.getElementById('openOpportunitiesBtn');
const heroAvatar = document.getElementById('heroAvatar');

if (openOpportunitiesBtn) {
  openOpportunitiesBtn.addEventListener('click', (event) => {
    event.preventDefault();

    const contactSection = document.getElementById('contact');
    const contactNameInput = document.getElementById('contactName');

    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    window.setTimeout(() => {
      contactNameInput?.focus();
    }, 650);
  });
}

if (heroAvatar) {
  const triggerAvatarAnimation = () => {
    heroAvatar.classList.remove('is-clicked');
    void heroAvatar.offsetWidth;
    heroAvatar.classList.add('is-clicked');

    window.setTimeout(() => {
      heroAvatar.classList.remove('is-clicked');
    }, 720);
  };

  heroAvatar.addEventListener('click', triggerAvatarAnimation);
  heroAvatar.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      triggerAvatarAnimation();
    }
  });
}

const typingTarget = document.querySelector('.hero-role');

if (typingTarget) {
  const wordsSource = typingTarget.dataset.words || 'Cloud Engineer';
  const words = wordsSource
    .split(',')
    .map((word) => word.trim())
    .filter(Boolean);
  const cyclePauseMs = 10000;
  const perWordPauseMs = 1300;

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typeLoop = () => {
    const currentWord = words[wordIndex % words.length];

    typingTarget.textContent = currentWord.slice(0, charIndex);

    if (!isDeleting && charIndex < currentWord.length) {
      charIndex += 1;
      setTimeout(typeLoop, 90);
      return;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      const isLastWordInCycle = wordIndex % words.length === words.length - 1;

      isDeleting = true;

      if (isLastWordInCycle) {
        typingTarget.classList.add('is-paused');
        setTimeout(() => {
          typingTarget.classList.remove('is-paused');
          typeLoop();
        }, cyclePauseMs);
        return;
      }

      setTimeout(typeLoop, perWordPauseMs);
      return;
    }

    if (isDeleting && charIndex > 0) {
      charIndex -= 1;
      setTimeout(typeLoop, 45);
      return;
    }

    const nextWordIndex = wordIndex + 1;

    isDeleting = false;
    wordIndex = nextWordIndex;
    setTimeout(typeLoop, 280);
  };

  typingTarget.textContent = '';
  typeLoop();
}

const aiChatToggle = document.getElementById('aiChatToggle');
const aiChatPanel = document.getElementById('aiChatPanel');
const aiChatMessages = document.getElementById('aiChatMessages');
const aiChatForm = document.getElementById('aiChatForm');
const aiChatInput = document.getElementById('aiChatInput');
const aiChatSuggestions = document.getElementById('aiChatSuggestions');

const GEMINI_API_STORAGE_KEY = 'GEMINI_API_KEY';
const GEMINI_MODEL = 'gemini-flash-latest';
const DEFAULT_GEMINI_API_KEY = 'AIzaSyA8-qKCTf6jv0cf9HajHkmYeRtZ3SKwPNI';
const GEMINI_TIMEOUT_MS = 9000;
const aiConversationHistory = [];
const MAX_HISTORY_MESSAGES = 8;
let isAiResponding = false;

const getGeminiApiKey = () => window.GEMINI_API_KEY || localStorage.getItem(GEMINI_API_STORAGE_KEY) || DEFAULT_GEMINI_API_KEY;

const jyotiProfileContext = `
Name: Jyoti Ranjan
Role: Aspiring Software Engineer, AI Developer, DevOps Enthusiast
Education: B.Tech CSE (Lovely Professional University), CGPA 6.32
Skills: C++, Python, C, Java, HTML5, CSS3, MySQL, AWS, Docker, Git, GitHub
Projects: AI Stress Level Tracker, Rock Paper Scissor Game, Weather Forecast Dashboard
Certifications: Oracle Cloud Foundations, Infosys GenAI/Prompt Engineering, NPTEL Privacy & Security
Achievements: 50+ coding problems solved, strong project Lighthouse scores
Contact: Jr8443791@gmail.com, +91 9234588938
Location: Jalandhar, Punjab
Goal: Opportunities in AI, frontend development, and DevOps
`.trim();

const jyotiAssistantPrompt = `
You are Jyoti AI Assistant for a portfolio website.
Rules:
1) Answer ONLY about Jyoti Ranjan using provided profile context.
2) If a question is unrelated, politely redirect to Jyoti-related topics.
3) Keep answers concise (2-5 lines), clear, and professional.
4) Use friendly tone.
5) Never invent facts outside context.
6) Answer the exact user question directly.
7) Avoid repeating the same wording from previous responses.
8) If user asks a broad question (example: "tell me about jyoti"), give a crisp profile summary with education, core skills, projects, and goal.
`.trim();

const aiKnowledge = [
  {
    keywords: ['hey', 'hi', 'hello', 'hii', 'hlo', 'yo'],
    answer:
      'Hey 👋 I\'m Jyoti AI Assistant. You can ask about Jyoti\'s journey, skills, projects, education, achievements, certifications, or contact details.',
  },
  {
    keywords: ['how are you', 'how r u', 'wassup', 'whatsup'],
    answer:
      'I\'m doing great, thanks! I\'m here to help you learn about Jyoti Ranjan quickly and clearly.',
  },
  {
    keywords: ['thank', 'thanks', 'thank you', 'thx'],
    answer: 'You\'re welcome 😊 If you want, ask me next about Jyoti\'s top project or how to contact him.',
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'ok bye'],
    answer: 'Bye 👋 Thanks for visiting Jyoti\'s portfolio. Feel free to come back anytime!',
  },
  {
    keywords: ['journey', 'about', 'background', 'story', 'who is jyoti'],
    answer:
      'Jyoti Ranjan is a CSE student at Lovely Professional University focused on AI, frontend development, and DevOps. His journey combines hands-on projects, certifications, and consistent problem solving to build practical, real-world software.',
  },
  {
    keywords: ['experience', 'internship', 'intern', 'practical exposure'],
    answer:
      'Jyoti\'s practical experience comes from building complete projects, solving coding challenges, and a training project on a modern banking system using data structures and optimization techniques.',
  },
  {
    keywords: ['skills', 'tech stack', 'technologies', 'languages', 'tools'],
    answer:
      'Core skills: C++, Python, C, Java, HTML5, CSS3, MySQL, AWS, Docker, Git, and GitHub. He is strong in problem-solving, teamwork, and adaptability.',
  },
  {
    keywords: ['project', 'projects', 'work', 'built', 'portfolio projects'],
    answer:
      'Key projects include AI Stress Level Tracker, Rock-Paper-Scissor Game, and Weather Forecast Dashboard. You can open the Projects section for full details and GitHub links.',
  },
  {
    keywords: ['best project', 'top project', 'main project', 'featured project'],
    answer:
      'A standout project is the AI Stress Level Tracker, where Jyoti combined AI/ML concepts with a smooth user interface and achieved strong Lighthouse quality scores.',
  },
  {
    keywords: ['education', 'study', 'college', 'university', 'cgpa'],
    answer:
      'Education: B.Tech in CSE at Lovely Professional University (ongoing), plus Intermediate and Matriculation from Sri Viswasanthi Educational Institution. Current CGPA shown in the Education section is 6.32.',
  },
  {
    keywords: ['achievement', 'achievements', 'accomplishment', 'milestone'],
    answer:
      'Highlights: 50+ coding problems solved, Oracle Cloud certification, AI project recognition with strong Lighthouse scores, and performance-optimized system building in training projects.',
  },
  {
    keywords: ['certificate', 'certification', 'oracle', 'nptel', 'infosys'],
    answer:
      'Jyoti has 5+ certifications, including Oracle Cloud Foundations Associate and courses from Infosys and NPTEL in Generative AI, prompt engineering, and privacy/security.',
  },
  {
    keywords: ['strength', 'strengths', 'why hire', 'why should we hire', 'hire him'],
    answer:
      'Jyoti combines technical range (AI + Web + DevOps), consistent execution (projects + coding practice), and clear communication. He builds practical solutions with clean UI and performance focus.',
  },
  {
    keywords: ['hobby', 'hobbies', 'interest', 'interests'],
    answer:
      'His interests include exploring new technologies, improving coding skills, earning certifications, and contributing to learning-focused tech communities.',
  },
  {
    keywords: ['location', 'where', 'city', 'based'],
    answer:
      'Jyoti is currently based in Jalandhar, Punjab, and is open to opportunities.',
  },
  {
    keywords: ['linkedin', 'github', 'profile link', 'social'],
    answer:
      'You can find Jyoti on GitHub (jyoti-ranjan5) and LinkedIn (JyotiRanjan). Both links are available in the Contact section.',
  },
  {
    keywords: ['contact', 'email', 'phone', 'hire', 'reach'],
    answer:
      'You can contact Jyoti at Jr8443791@gmail.com or +91 9234588938. Use the Contact section form on this page for direct outreach.',
  },
  {
    keywords: ['goal', 'career', 'opportunity', 'future'],
    answer:
      'Jyoti is seeking opportunities to contribute in AI, frontend engineering, and DevOps while continuing to build high-impact, user-friendly products.',
  },
];

const normalizeQuestion = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const toBriefReply = (text) => {
  const cleaned = (text || '')
    .replace(/\bRedirect\)?\s*:\s*N\/?A\s*\(related\)\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return 'Jyoti is a CSE student focused on AI, DevOps, and practical web development.';
  }

  const sentenceParts = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 2);

  const joined = sentenceParts.join(' ');
  const words = joined.split(' ').filter(Boolean);

  if (words.length <= 34) {
    return joined;
  }

  return `${words.slice(0, 34).join(' ')}...`;
};

const getAiReply = (question) => {
  const normalized = normalizeQuestion(question);

  if (!normalized) {
    return 'Please type your question and I will answer in brief.';
  }

  if (normalized.length <= 2) {
    return 'You can ask full questions like: "Tell me his journey", "What are his skills?", or "How can I contact Jyoti?"';
  }

  const match = aiKnowledge.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)));

  if (match) {
    return match.answer;
  }

  return 'Great question. In brief: Jyoti Ranjan is a CSE student and aspiring software engineer focused on AI, DevOps, and practical web development. Ask me about his journey, skills, projects, certifications, education, or contact details.';
};

const getGeminiReply = async (question) => {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return null;
  }

  try {
    const recentHistory = aiConversationHistory
      .slice(-MAX_HISTORY_MESSAGES)
      .map((item) => `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.text}`)
      .join('\n');

    const normalizedQuestion = normalizeQuestion(question);
    const broadSummaryHint =
      normalizedQuestion.includes('tell me about jyoti') ||
      normalizedQuestion.includes('about jyoti') ||
      normalizedQuestion.includes('who is jyoti')
        ? '\nSpecial instruction for this query: Give a short profile summary in bullet style.'
        : '';

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => abortController.abort(), GEMINI_TIMEOUT_MS);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
    const response = await fetch(endpoint, {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${jyotiAssistantPrompt}\n\nProfile Context:\n${jyotiProfileContext}\n\nRecent Conversation:\n${recentHistory || 'No prior conversation.'}\n\nUser Question: ${question}${broadSummaryHint}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 220,
        },
      }),
    });

    window.clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts;
    const text = Array.isArray(parts)
      ? parts
          .map((part) => (typeof part?.text === 'string' ? part.text : ''))
          .join('\n')
          .trim()
      : '';

    return text || null;
  } catch {
    return null;
  }
};

const getSmartReply = async (question) => {
  const geminiReply = await getGeminiReply(question);

  if (geminiReply) {
    return toBriefReply(geminiReply);
  }

  return toBriefReply(getAiReply(question));
};

const pushConversationHistory = (role, text) => {
  aiConversationHistory.push({ role, text });

  if (aiConversationHistory.length > MAX_HISTORY_MESSAGES * 2) {
    aiConversationHistory.splice(0, aiConversationHistory.length - MAX_HISTORY_MESSAGES * 2);
  }
};

const appendAiMessage = (text, role) => {
  if (!aiChatMessages) {
    return;
  }

  const message = document.createElement('div');
  message.className = `ai-msg ${role}`;
  message.textContent = text;
  aiChatMessages.appendChild(message);
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  return message;
};

if (aiChatToggle && aiChatPanel) {
  aiChatToggle.addEventListener('click', () => {
    const isHidden = aiChatPanel.hasAttribute('hidden');

    if (isHidden) {
      aiChatPanel.removeAttribute('hidden');
      aiChatToggle.setAttribute('aria-expanded', 'true');

      if (aiChatMessages && aiChatMessages.children.length === 0) {
        appendAiMessage('Hi! I\'m Jyoti AI Assistant ✨ Ask me anything about Jyoti Ranjan.', 'bot');
      }

      window.setTimeout(() => aiChatInput?.focus(), 120);
    } else {
      aiChatPanel.setAttribute('hidden', '');
      aiChatToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

const handleAiQuestion = async (question, replyDelayMs = 240) => {
  if (isAiResponding) {
    appendAiMessage('Please wait a moment — I am finishing the previous reply.', 'bot');
    return;
  }

  isAiResponding = true;
  appendAiMessage(question, 'user');
  pushConversationHistory('user', question);

  const typingMessage = appendAiMessage('Thinking...', 'bot typing');

  try {
    const startedAt = Date.now();
    const answer = await getSmartReply(question);
    const elapsed = Date.now() - startedAt;
    const remainingDelay = Math.max(0, replyDelayMs - elapsed);

    window.setTimeout(() => {
      if (typingMessage) {
        typingMessage.className = 'ai-msg bot';
        typingMessage.textContent = answer;
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        pushConversationHistory('assistant', answer);
      } else {
        appendAiMessage(answer, 'bot');
        pushConversationHistory('assistant', answer);
      }

      isAiResponding = false;
    }, remainingDelay);
  } catch {
    const fallbackAnswer = toBriefReply(getAiReply(question));

    if (typingMessage) {
      typingMessage.className = 'ai-msg bot';
      typingMessage.textContent = fallbackAnswer;
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
      pushConversationHistory('assistant', fallbackAnswer);
    } else {
      appendAiMessage(fallbackAnswer, 'bot');
      pushConversationHistory('assistant', fallbackAnswer);
    }

    isAiResponding = false;
  }
};

if (aiChatForm && aiChatInput) {
  aiChatForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const question = aiChatInput.value.trim();

    if (!question) {
      return;
    }

    aiChatInput.value = '';

    await handleAiQuestion(question, 260);
  });
}

if (aiChatSuggestions) {
  aiChatSuggestions.addEventListener('click', async (event) => {
    const target = event.target;

    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const question = target.textContent?.trim();

    if (!question) {
      return;
    }

    await handleAiQuestion(question, 240);
  });
}
