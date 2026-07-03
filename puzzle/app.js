/* Crucigrama diario — lógica de juego */
(() => {
  const $ = (id) => document.getElementById(id);
  const gridEl = $("grid");
  const kbd = $("kbd");
  const clueText = $("clue-text");
  const banner = $("banner");

  // ---------- fecha y puzzle ----------
  const dates = Object.keys(PUZZLES).sort();
  function localToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  const today = localToday();
  let dateKey = dates.includes(today)
    ? today
    : dates.filter((d) => d <= today).pop() || dates[0];

  const fecha = new Date(dateKey + "T12:00:00");
  $("fecha").textContent = fecha.toLocaleDateString("es-CL", {
    weekday: "long", day: "numeric", month: "long",
  });

  // ---------- tema claro/oscuro ----------
  const themeBtn = $("theme-btn");
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    localStorage.setItem("cruci:theme", t);
  }
  const savedTheme = localStorage.getItem("cruci:theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  applyTheme(savedTheme);
  themeBtn.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });

  // ---------- estado ----------
  let level = localStorage.getItem("cruci:level") || "facil";
  let puzzle, size, cells, words, cellWords, entries;
  let activeCell = -1;
  let activeDir = "A";

  const storeKey = () => `cruci:${dateKey}:${level}`;

  // ---------- construcción del puzzle ----------
  function computeWords(p) {
    const n = p.size, g = p.grid;
    const list = [];
    let k = 0;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (g[r][c] === "#") continue;
        const sa = (c === 0 || g[r][c - 1] === "#") && c + 1 < n && g[r][c + 1] !== "#";
        const sd = (r === 0 || g[r - 1][c] === "#") && r + 1 < n && g[r + 1][c] !== "#";
        if (!sa && !sd) continue;
        k++;
        if (sa) {
          const cls = [];
          for (let cc = c; cc < n && g[r][cc] !== "#"; cc++) cls.push(r * n + cc);
          list.push({ num: k, dir: "A", cells: cls });
        }
        if (sd) {
          const cls = [];
          for (let rr = r; rr < n && g[rr][c] !== "#"; rr++) cls.push(rr * n + c);
          list.push({ num: k, dir: "D", cells: cls });
        }
      }
    }
    const clueMap = { A: new Map(p.across), D: new Map(p.down) };
    for (const w of list) {
      w.clue = clueMap[w.dir].get(w.num) || "";
      w.answer = w.cells.map((i) => g[(i / n) | 0][i % n]).join("");
      w.id = w.dir + w.num;
    }
    // orden: horizontales por número, luego verticales
    list.sort((a, b) => (a.dir === b.dir ? a.num - b.num : a.dir === "A" ? -1 : 1));
    return list;
  }

  function loadLevel(lv) {
    level = lv;
    localStorage.setItem("cruci:level", lv);
    puzzle = PUZZLES[dateKey][lv];
    size = puzzle.size;
    words = computeWords(puzzle);

    cellWords = {};
    for (const w of words) {
      for (const i of w.cells) {
        (cellWords[i] ||= {})[w.dir] = w;
      }
    }

    entries = JSON.parse(localStorage.getItem(storeKey()) || "null") ||
      Array(size * size).fill("");

    renderGrid();
    renderClues();
    const first = words[0];
    setActive(first.cells.find((i) => !entries[i]) ?? first.cells[0], "A", false);
    refresh();

    document.querySelectorAll("#levels button").forEach((b) => {
      b.setAttribute("aria-selected", b.dataset.level === lv ? "true" : "false");
    });
    $("temas").textContent = "Temas de hoy: " + puzzle.temas.join(" · ");
  }

  function renderGrid() {
    gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gridEl.innerHTML = "";
    cells = [];
    const nums = {};
    for (const w of words) nums[w.cells[0]] = w.num;
    for (let i = 0; i < size * size; i++) {
      const r = (i / size) | 0, c = i % size;
      const div = document.createElement("div");
      div.className = "cell";
      if (puzzle.grid[r][c] === "#") {
        div.classList.add("block");
      } else {
        if (nums[i]) {
          const n = document.createElement("span");
          n.className = "num";
          n.textContent = nums[i];
          div.appendChild(n);
        }
        const letter = document.createElement("span");
        letter.className = "letter";
        div.appendChild(letter);
        div.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          tapCell(i);
        });
      }
      gridEl.appendChild(div);
      cells.push(div);
    }
  }

  function renderClues() {
    for (const [dir, listId] of [["A", "across-list"], ["D", "down-list"]]) {
      const ul = $(listId);
      ul.innerHTML = "";
      for (const w of words.filter((x) => x.dir === dir)) {
        const li = document.createElement("li");
        li.id = "li-" + w.id;
        li.innerHTML = `<b>${w.num}.</b><span>${w.clue}</span>`;
        li.addEventListener("click", () => {
          setActive(w.cells.find((i) => !entries[i]) ?? w.cells[0], dir);
          gridEl.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        ul.appendChild(li);
      }
    }
  }

  // ---------- selección ----------
  function activeWord() {
    const cw = cellWords[activeCell];
    if (!cw) return null;
    return cw[activeDir] || cw[activeDir === "A" ? "D" : "A"];
  }

  function tapCell(i) {
    if (i === activeCell) {
      const cw = cellWords[i];
      const other = activeDir === "A" ? "D" : "A";
      if (cw[other]) activeDir = other;
    } else if (!cellWords[i][activeDir]) {
      activeDir = activeDir === "A" ? "D" : "A";
    }
    setActive(i, activeDir);
  }

  function setActive(i, dir, focus = true) {
    activeCell = i;
    activeDir = cellWords[i][dir] ? dir : (dir === "A" ? "D" : "A");
    if (focus) focusKbd();
    refresh();
  }

  function focusKbd() {
    // acerca el input a la celda activa para que iOS no haga scroll brusco
    const cell = cells[activeCell];
    if (cell) {
      kbd.style.top = cell.offsetTop + "px";
      kbd.style.left = cell.offsetLeft + "px";
    }
    kbd.focus({ preventScroll: true });
  }

  // ---------- refresco visual ----------
  function refresh() {
    const w = activeWord();
    const wordCells = new Set(w ? w.cells : []);
    cells.forEach((div, i) => {
      if (div.classList.contains("block")) return;
      div.classList.toggle("hl", wordCells.has(i) && i !== activeCell);
      div.classList.toggle("active", i === activeCell);
      div.querySelector(".letter").textContent = entries[i];
    });
    if (w) {
      clueText.innerHTML = `<b>${w.num}${w.dir === "A" ? "H" : "V"}.</b> ${w.clue}`;
    }
    checkWords();
  }

  function checkWords() {
    let allDone = true;
    const solvedCells = new Set();
    for (const w of words) {
      const filled = w.cells.map((i) => entries[i]).join("");
      const ok = filled === w.answer;
      $("li-" + w.id).classList.toggle("done", ok);
      $("li-" + w.id).classList.toggle("sel", w === activeWord());
      if (ok) w.cells.forEach((i) => solvedCells.add(i));
      else allDone = false;
    }
    cells.forEach((div, i) => {
      if (!div.classList.contains("block")) {
        div.classList.toggle("solved", solvedCells.has(i));
      }
    });
    banner.hidden = !allDone;
  }

  // ---------- entrada de teclado ----------
  const SENT = " ";
  kbd.value = SENT;

  kbd.addEventListener("input", () => {
    const v = kbd.value;
    if (v.length < SENT.length) {
      handleBackspace();
    } else {
      const ch = v[v.length - 1].toUpperCase();
      if (/^[A-ZÑ]$/.test(ch)) handleLetter(ch);
    }
    kbd.value = SENT;
  });

  kbd.addEventListener("keydown", (e) => {
    const w = activeWord();
    if (!w) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault(); moveInWord(1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault(); moveInWord(-1);
    } else if (e.key === "Enter") {
      e.preventDefault(); cycleWord(1);
    }
  });

  function handleLetter(ch) {
    const w = activeWord();
    if (!w) return;
    entries[activeCell] = ch;
    save();
    // avanza a la próxima celda vacía de la palabra
    const idx = w.cells.indexOf(activeCell);
    let next = w.cells.slice(idx + 1).find((i) => !entries[i]);
    if (next === undefined) next = w.cells.find((i) => !entries[i]);
    if (next !== undefined) {
      activeCell = next;
    } else if (idx < w.cells.length - 1) {
      activeCell = w.cells[idx + 1];
    } else {
      refresh();
      cycleWord(1, true); // palabra llena: salta a la próxima incompleta
      return;
    }
    refresh();
  }

  function handleBackspace() {
    const w = activeWord();
    if (!w) return;
    if (entries[activeCell]) {
      entries[activeCell] = "";
    } else {
      const idx = w.cells.indexOf(activeCell);
      if (idx > 0) {
        activeCell = w.cells[idx - 1];
        entries[activeCell] = "";
      }
    }
    save();
    refresh();
  }

  function moveInWord(step) {
    const w = activeWord();
    const idx = w.cells.indexOf(activeCell);
    const next = w.cells[idx + step];
    if (next !== undefined) { activeCell = next; refresh(); }
  }

  function cycleWord(step, onlyIncomplete = false) {
    const w = activeWord();
    const pos = words.indexOf(w);
    for (let n = 1; n <= words.length; n++) {
      const cand = words[(pos + step * n + words.length * n) % words.length];
      const empty = cand.cells.find((i) => !entries[i]);
      if (!onlyIncomplete || empty !== undefined) {
        activeDir = cand.dir;
        activeCell = empty ?? cand.cells[0];
        refresh();
        return;
      }
    }
  }

  $("prev-word").addEventListener("click", () => { cycleWord(-1); focusKbd(); });
  $("next-word").addEventListener("click", () => { cycleWord(1); focusKbd(); });

  function save() {
    localStorage.setItem(storeKey(), JSON.stringify(entries));
  }

  // ---------- niveles ----------
  document.querySelectorAll("#levels button").forEach((b) => {
    b.addEventListener("click", () => loadLevel(b.dataset.level));
  });

  loadLevel(PUZZLES[dateKey][level] ? level : "facil");
})();
