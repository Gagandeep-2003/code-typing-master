const lessons = [
  {
    title: "Data Structures Deep Dive",
    subtitle: "Multi-paradigm Python design patterns & data fluency.",
    level: "Advanced",
    focus: "Data structures",
    objectives: [
      "Type nested comprehensions with zero hesitation.",
      "Practice tuple unpacking and slicing for fast recall.",
      "Reinforce dictionary pipelines with chained operations.",
    ],
    snippet: `from collections import defaultdict\n\norders = defaultdict(list)\nfor user, total in transactions:\n    orders[user].append(total)\n\nhigh_value = {\n    user: sum(totals)\n    for user, totals in orders.items()\n    if sum(totals) >= 2500\n}`,
  },
  {
    title: "Async Execution Patterns",
    subtitle: "Master concurrency syntax and async task choreography.",
    level: "Advanced",
    focus: "Async IO",
    objectives: [
      "Type async/await blocks with natural cadence.",
      "Practice gather patterns with cancellation awareness.",
      "Reinforce task group creation with context managers.",
    ],
    snippet: `import asyncio\n\nasync def fetch_data(client, url):\n    async with client.get(url) as response:\n        return await response.json()\n\nasync def orchestrate(client, endpoints):\n    tasks = [fetch_data(client, url) for url in endpoints]\n    results = await asyncio.gather(*tasks)\n    return {item[\"id\"]: item for item in results}`,
  },
  {
    title: "Testing & Quality Assurance",
    subtitle: "Type robust tests and validation pipelines.",
    level: "Advanced",
    focus: "Testing",
    objectives: [
      "Reinforce assertion grammar with descriptive failures.",
      "Type fixtures and parametrization patterns with ease.",
      "Practice patching and dependency injection flows.",
    ],
    snippet: `import pytest\n\n@pytest.mark.parametrize(\"score,expected\", [(91, \"A\"), (78, \"C\")])\ndef test_grade_mapping(score, expected):\n    result = map_grade(score)\n    assert result == expected\n\nclass TestNotifier:\n    def test_notify_success(self, notifier, caplog):\n        notifier.notify(\"Ready\")\n        assert \"Ready\" in caplog.text`,
  },
  {
    title: "Performance Profiling",
    subtitle: "Type optimization tooling and profiling flows.",
    level: "Advanced",
    focus: "Performance",
    objectives: [
      "Memorize context managers for timing blocks.",
      "Practice caching decorators and metrics logging.",
      "Type memory profiling loops with accuracy.",
    ],
    snippet: `from functools import lru_cache\nfrom time import perf_counter\n\n@lru_cache(maxsize=128)\ndef compute_score(record_id):\n    return sum(i * i for i in range(record_id))\n\nstart = perf_counter()\nfor record_id in range(4000, 4010):\n    compute_score(record_id)\n\nprint(f\"Elapsed: {perf_counter() - start:.2f}s\")`,
  },
];

const lessonList = document.getElementById("lessonList");
const lessonTitle = document.getElementById("lessonTitle");
const lessonSubtitle = document.getElementById("lessonSubtitle");
const lessonLevel = document.getElementById("lessonLevel");
const lessonObjectives = document.getElementById("lessonObjectives");
const lessonFocus = document.getElementById("lessonFocus");
const codeDisplay = document.getElementById("codeDisplay");
const codeInput = document.getElementById("codeInput");
const metricWpm = document.getElementById("metricWpm");
const metricAccuracy = document.getElementById("metricAccuracy");
const metricErrors = document.getElementById("metricErrors");
const toggleHints = document.getElementById("toggleHints");
const toggleLineNumbers = document.getElementById("toggleLineNumbers");
const toggleZen = document.getElementById("toggleZen");
const themeSelect = document.getElementById("themeSelect");
const fontSize = document.getElementById("fontSize");
const resetLesson = document.getElementById("resetLesson");
const nextLesson = document.getElementById("nextLesson");
const copySnippet = document.getElementById("copySnippet");

let currentLessonIndex = 0;
let timerStart = null;
let errorCount = 0;

const themeMap = {
  aurora: "",
  midnight: "theme-midnight",
  sunrise: "theme-sunrise",
};

const storageKey = "pytype-settings";

const saveSettings = () => {
  const settings = {
    hints: toggleHints.checked,
    lineNumbers: toggleLineNumbers.checked,
    zen: toggleZen.checked,
    theme: themeSelect.value,
    fontSize: fontSize.value,
  };
  localStorage.setItem(storageKey, JSON.stringify(settings));
};

const loadSettings = () => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;
  const settings = JSON.parse(raw);
  toggleHints.checked = settings.hints ?? true;
  toggleLineNumbers.checked = settings.lineNumbers ?? true;
  toggleZen.checked = settings.zen ?? false;
  themeSelect.value = settings.theme ?? "aurora";
  fontSize.value = settings.fontSize ?? 16;
};

const renderLessons = () => {
  lessonList.innerHTML = "";
  lessons.forEach((lesson, index) => {
    const item = document.createElement("div");
    item.className = `lesson-item ${index === currentLessonIndex ? "active" : ""}`;
    item.innerHTML = `<strong>${lesson.title}</strong><span>${lesson.focus}</span>`;
    item.addEventListener("click", () => {
      currentLessonIndex = index;
      resetTyping();
      renderLesson();
    });
    lessonList.appendChild(item);
  });
};

const renderLesson = () => {
  const lesson = lessons[currentLessonIndex];
  lessonTitle.textContent = lesson.title;
  lessonSubtitle.textContent = lesson.subtitle;
  lessonLevel.textContent = lesson.level;
  lessonFocus.textContent = lesson.focus;
  lessonObjectives.innerHTML = "";
  lesson.objectives.forEach((objective) => {
    const li = document.createElement("li");
    li.textContent = objective;
    lessonObjectives.appendChild(li);
  });
  renderCodeSnippet();
  renderLessons();
};

const renderCodeSnippet = () => {
  const lesson = lessons[currentLessonIndex];
  const snippet = lesson.snippet;
  const display = snippet
    .split("")
    .map((char) => `<span class="pending">${char === "\n" ? "\n" : char}</span>`)
    .join("");
  codeDisplay.innerHTML = display;
  codeInput.value = "";
  codeInput.style.fontSize = `${fontSize.value}px`;
  codeDisplay.style.fontSize = `${fontSize.value}px`;
  errorCount = 0;
  updateMetrics();
};

const resetTyping = () => {
  timerStart = null;
  errorCount = 0;
  updateMetrics();
  renderCodeSnippet();
};

const updateMetrics = () => {
  const typed = codeInput.value.length;
  const elapsedMinutes = timerStart ? (Date.now() - timerStart) / 60000 : 0;
  const wpm = elapsedMinutes > 0 ? Math.round(typed / 5 / elapsedMinutes) : 0;
  const accuracy = typed === 0 ? 100 : Math.max(0, Math.round(((typed - errorCount) / typed) * 100));
  metricWpm.textContent = wpm;
  metricAccuracy.textContent = `${accuracy}%`;
  metricErrors.textContent = errorCount;
};

const updateDisplay = () => {
  const snippet = lessons[currentLessonIndex].snippet;
  const typed = codeInput.value;
  const characters = snippet.split("");
  errorCount = 0;
  const formatted = characters.map((char, index) => {
    const typedChar = typed[index];
    if (typedChar == null) {
      return `<span class="pending">${char === "\n" ? "\n" : char}</span>`;
    }
    if (typedChar === char) {
      return `<span class="correct">${char === "\n" ? "\n" : char}</span>`;
    }
    errorCount += 1;
    return `<span class="incorrect">${char === "\n" ? "\n" : char}</span>`;
  });
  codeDisplay.innerHTML = formatted.join("");
  updateMetrics();
};

const applyTheme = () => {
  document.body.classList.remove("theme-midnight", "theme-sunrise");
  const selected = themeSelect.value;
  if (themeMap[selected]) {
    document.body.classList.add(themeMap[selected]);
  }
};

const applyZen = () => {
  if (toggleZen.checked) {
    document.body.classList.add("zen-mode");
  } else {
    document.body.classList.remove("zen-mode");
  }
};

const applyHints = () => {
  if (toggleHints.checked) {
    codeDisplay.classList.remove("no-hints");
  } else {
    codeDisplay.classList.add("no-hints");
  }
};

const applyLineNumbers = () => {
  const existing = document.getElementById("lineNumbers");
  if (existing) existing.remove();
  if (!toggleLineNumbers.checked) {
    codeDisplay.style.paddingLeft = "0";
    return;
  }
  const lines = lessons[currentLessonIndex].snippet.split("\n").length;
  const numbers = Array.from({ length: lines }, (_, i) => `${i + 1}`.padStart(2, " ")).join("\n");
  codeDisplay.style.paddingLeft = "52px";
  codeDisplay.style.position = "relative";
  const gutter = document.createElement("pre");
  gutter.id = "lineNumbers";
  gutter.textContent = numbers;
  gutter.style.position = "absolute";
  gutter.style.left = "16px";
  gutter.style.top = "18px";
  gutter.style.margin = "0";
  gutter.style.color = "#52607a";
  gutter.style.fontFamily = "JetBrains Mono, monospace";
  gutter.style.fontSize = codeDisplay.style.fontSize;
  codeDisplay.parentElement.appendChild(gutter);
};

codeInput.addEventListener("input", () => {
  if (!timerStart) {
    timerStart = Date.now();
  }
  updateDisplay();
});

fontSize.addEventListener("input", () => {
  codeInput.style.fontSize = `${fontSize.value}px`;
  codeDisplay.style.fontSize = `${fontSize.value}px`;
  applyLineNumbers();
  saveSettings();
});

[themeSelect, toggleZen, toggleLineNumbers, toggleHints].forEach((input) => {
  input.addEventListener("change", () => {
    applyTheme();
    applyZen();
    applyLineNumbers();
    applyHints();
    saveSettings();
  });
});

resetLesson.addEventListener("click", resetTyping);
nextLesson.addEventListener("click", () => {
  currentLessonIndex = (currentLessonIndex + 1) % lessons.length;
  resetTyping();
  renderLesson();
});

copySnippet.addEventListener("click", async () => {
  const snippet = lessons[currentLessonIndex].snippet;
  await navigator.clipboard.writeText(snippet);
  copySnippet.textContent = "Copied!";
  setTimeout(() => {
    copySnippet.textContent = "Copy snippet";
  }, 2000);
});

loadSettings();
applyTheme();
applyZen();
renderLesson();
applyLineNumbers();
applyHints();
