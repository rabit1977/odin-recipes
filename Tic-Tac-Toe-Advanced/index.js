/* ============================================================
   PLAYER — a factory function.
   Every call returns a fresh, independent object: a human
   player is just a name + mark; a computer player additionally
   carries a reference to its own AI strategy object.
   ============================================================ */
const Player = (name, mark, ai = null) => ({
  name: name || (ai ? "Computer" : `Player ${mark}`),
  mark,
  human: !ai,
  ai,
});

/* ============================================================
   GAMEBOARD — a module (IIFE). Only one board ever exists, so
   its array lives inside this closure and is only reachable
   through the methods returned below.
   ============================================================ */
const Gameboard = (function () {
  const board = Array(9).fill("");

  const getBoard = () => [...board]; // copy out, so callers can't mutate it directly

  const placeMark = (index, mark) => {
    if (board[index] !== "") return false;
    board[index] = mark;
    return true;
  };

  const reset = () => board.fill("");

  return { getBoard, placeMark, reset };
})();

/* ============================================================
   RULES — pure, stateless game logic pulled out on its own so
   both GameController AND the AI's search can share one
   definition of "won" / "full" instead of duplicating it.
   ============================================================ */
const Rules = (function () {
  const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],            // diagonals
  ];

  const getWinningLine = (board) =>
    WINNING_COMBOS.find(
      ([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]
    ) || null;

  const getWinner = (board) => {
    const line = getWinningLine(board);
    return line ? board[line[0]] : null;
  };

  const isFull = (board) => board.every((cell) => cell !== "");

  return { getWinningLine, getWinner, isFull };
})();

/* ============================================================
   MINIMAX — pure functions implementing minimax with alpha-beta
   pruning. Given any board it returns the objectively best move
   for a mark, searching every line of play to its end. This is
   what makes "Unbeatable" actually true rather than just hard.
   ============================================================ */
const Minimax = (function () {
  const emptyIndices = (board) =>
    board.reduce((acc, cell, i) => {
      if (!cell) acc.push(i);
      return acc;
    }, []);

  const score = (board, aiMark, humanMark, depth) => {
    const winner = Rules.getWinner(board);
    if (winner === aiMark) return 10 - depth;
    if (winner === humanMark) return depth - 10;
    return 0;
  };

  const search = (board, depth, isMaximizing, aiMark, humanMark, alpha, beta) => {
    const winner = Rules.getWinner(board);
    if (winner || Rules.isFull(board)) return score(board, aiMark, humanMark, depth);

    if (isMaximizing) {
      let best = -Infinity;
      for (const i of emptyIndices(board)) {
        board[i] = aiMark;
        best = Math.max(best, search(board, depth + 1, false, aiMark, humanMark, alpha, beta));
        board[i] = "";
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
      return best;
    }

    let best = Infinity;
    for (const i of emptyIndices(board)) {
      board[i] = humanMark;
      best = Math.min(best, search(board, depth + 1, true, aiMark, humanMark, alpha, beta));
      board[i] = "";
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  };

  const bestMove = (board, aiMark, humanMark) => {
    const working = [...board];
    let bestScore = -Infinity;
    let move = null;

    for (const i of emptyIndices(working)) {
      working[i] = aiMark;
      const s = search(working, 0, false, aiMark, humanMark, -Infinity, Infinity);
      working[i] = "";
      if (s > bestScore) {
        bestScore = s;
        move = i;
      }
    }
    return move;
  };

  return { bestMove };
})();

/* ============================================================
   AI — a factory function, mirroring Player. Wraps a difficulty
   level around Minimax's perfect play: "easy" ignores it
   entirely, "medium" only reaches for it half the time.
   ============================================================ */
const createAI = (mark, opponentMark, difficulty) => {
  const randomMove = (board) => {
    const options = board.reduce((acc, cell, i) => {
      if (!cell) acc.push(i);
      return acc;
    }, []);
    return options[Math.floor(Math.random() * options.length)];
  };

  const chooseMove = (board) => {
    if (difficulty === "easy") return randomMove(board);
    if (difficulty === "medium") {
      return Math.random() < 0.5 ? Minimax.bestMove(board, mark, opponentMark) : randomMove(board);
    }
    return Minimax.bestMove(board, mark, opponentMark); // hard / unbeatable
  };

  return { mark, chooseMove };
};

/* ============================================================
   GAMECONTROLLER — a module (IIFE). Owns the match: players,
   turn order, the running score, and win/tie detection via
   Rules. startMatch() resets everything including score;
   nextRound() keeps the score, clears the board, and flips who
   moves first so neither player is stuck always going second.
   ============================================================ */
const GameController = (function () {
  let players = [];
  let startingIndex = 0;
  let activeIndex = 0;
  let over = false;
  let winner = null;
  let winningLine = null;
  let score = { X: 0, O: 0, ties: 0 };

  const setupRound = () => {
    activeIndex = startingIndex;
    over = false;
    winner = null;
    winningLine = null;
    Gameboard.reset();
  };

  const startMatch = ({ nameX, nameO, mode, difficulty }) => {
    const playerO =
      mode === "ai" ? Player(null, "O", createAI("O", "X", difficulty)) : Player(nameO, "O");

    players = [Player(nameX, "X"), playerO];
    startingIndex = 0;
    score = { X: 0, O: 0, ties: 0 };
    setupRound();
  };

  const nextRound = () => {
    startingIndex = startingIndex === 0 ? 1 : 0;
    setupRound();
  };

  const getActivePlayer = () => players[activeIndex];
  const switchTurn = () => {
    activeIndex = activeIndex === 0 ? 1 : 0;
  };

  const playRound = (index) => {
    if (over) return { ok: false };

    const placed = Gameboard.placeMark(index, getActivePlayer().mark);
    if (!placed) return { ok: false };

    const board = Gameboard.getBoard();
    const line = Rules.getWinningLine(board);

    if (line) {
      over = true;
      winningLine = line;
      winner = getActivePlayer();
      score[winner.mark] += 1;
    } else if (Rules.isFull(board)) {
      over = true;
      score.ties += 1;
    } else {
      switchTurn();
    }

    return { ok: true };
  };

  const isOver = () => over;
  const getWinner = () => winner;
  const getWinningLine = () => winningLine || [];
  const getScore = () => ({ ...score });

  return {
    startMatch,
    nextRound,
    playRound,
    getActivePlayer,
    isOver,
    getWinner,
    getWinningLine,
    getScore,
  };
})();

/* ============================================================
   DISPLAYCONTROLLER — a module (IIFE). The only part of the app
   that touches the DOM. Nothing above this line knows a browser
   exists — you can still drive the whole engine from the
   console, AI included, e.g. Minimax.bestMove(Gameboard.getBoard(), "O", "X").
   ============================================================ */
const DisplayController = (function () {
  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");
  const scoreboardEl = document.getElementById("scoreboard");
  const scoreXEl = document.getElementById("score-x");
  const scoreOEl = document.getElementById("score-o");
  const scoreTiesEl = document.getElementById("score-ties");
  const formEl = document.getElementById("setup-form");
  const nameXEl = document.getElementById("player-x-name");
  const nameOEl = document.getElementById("player-o-name");
  const modeSelect = document.getElementById("mode-select");
  const difficultySelect = document.getElementById("difficulty-select");
  const nextRoundBtn = document.getElementById("next-round-btn");
  const newMatchBtn = document.getElementById("new-match-btn");

  const renderBoard = (justPlacedIndex = null) => {
    const board = Gameboard.getBoard();
    const winningLine = GameController.getWinningLine();
    const active = GameController.getActivePlayer();

    boardEl.innerHTML = "";

    board.forEach((mark, index) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.textContent = mark;
      cell.dataset.index = index;
      cell.disabled = Boolean(mark) || GameController.isOver() || !active.human;

      if (mark === "X") cell.classList.add("mark-x");
      if (mark === "O") cell.classList.add("mark-o");
      if (index === justPlacedIndex) cell.classList.add("pop");
      if (winningLine.includes(index)) cell.classList.add("win");

      cell.addEventListener("click", () => handleCellClick(index));
      boardEl.appendChild(cell);
    });
  };

  const renderStatus = () => {
    if (GameController.isOver()) {
      const winner = GameController.getWinner();
      statusEl.textContent = winner ? `${winner.name} wins!` : "It's a tie.";
      nextRoundBtn.hidden = false;
    } else {
      const active = GameController.getActivePlayer();
      statusEl.textContent = active.human
        ? `${active.name}'s turn (${active.mark})`
        : `${active.name} is thinking…`;
    }
  };

  const renderScore = () => {
    const score = GameController.getScore();
    scoreXEl.textContent = score.X;
    scoreOEl.textContent = score.O;
    scoreTiesEl.textContent = score.ties;
  };

  const refresh = (justPlacedIndex = null) => {
    renderBoard(justPlacedIndex);
    renderStatus();
    renderScore();
  };

  const scheduleAIMoveIfNeeded = () => {
    if (GameController.isOver()) return;
    const active = GameController.getActivePlayer();
    if (active.human) return;

    boardEl.setAttribute("aria-busy", "true");
    setTimeout(() => {
      const move = active.ai.chooseMove(Gameboard.getBoard());
      const result = GameController.playRound(move);
      boardEl.removeAttribute("aria-busy");
      if (result.ok) {
        refresh(move);
        scheduleAIMoveIfNeeded();
      }
    }, 450);
  };

  const handleCellClick = (index) => {
    if (!GameController.getActivePlayer().human) return;
    const result = GameController.playRound(index);
    if (!result.ok) return;
    refresh(index);
    scheduleAIMoveIfNeeded();
  };

  const handleModeChange = () => {
    const isAI = modeSelect.value === "ai";
    nameOEl.hidden = isAI;
    difficultySelect.hidden = !isAI;
  };

  const handleStart = (event) => {
    event.preventDefault();

    GameController.startMatch({
      nameX: nameXEl.value.trim(),
      nameO: nameOEl.value.trim(),
      mode: modeSelect.value,
      difficulty: difficultySelect.value,
    });

    formEl.hidden = true;
    scoreboardEl.hidden = false;
    boardEl.hidden = false;
    newMatchBtn.hidden = false;
    nextRoundBtn.hidden = true;

    refresh();
    scheduleAIMoveIfNeeded();
  };

  const handleNextRound = () => {
    GameController.nextRound();
    nextRoundBtn.hidden = true;
    refresh();
    scheduleAIMoveIfNeeded();
  };

  const handleNewMatch = () => {
    formEl.hidden = false;
    scoreboardEl.hidden = true;
    boardEl.hidden = true;
    boardEl.innerHTML = "";
    statusEl.textContent = "";
    newMatchBtn.hidden = true;
    nextRoundBtn.hidden = true;
  };

  const handleBoardKeydown = (event) => {
    const deltas = { ArrowRight: 1, ArrowLeft: -1, ArrowUp: -3, ArrowDown: 3 };
    const delta = deltas[event.key];
    if (delta === undefined) return;

    const current = document.activeElement;
    if (!current || !current.classList.contains("cell")) return;

    const index = Number(current.dataset.index);
    if (event.key === "ArrowLeft" && index % 3 === 0) return;
    if (event.key === "ArrowRight" && index % 3 === 2) return;

    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex > 8) return;

    event.preventDefault();
    const nextCell = boardEl.children[nextIndex];
    if (nextCell && !nextCell.disabled) nextCell.focus();
  };

  const init = () => {
    formEl.addEventListener("submit", handleStart);
    modeSelect.addEventListener("change", handleModeChange);
    nextRoundBtn.addEventListener("click", handleNextRound);
    newMatchBtn.addEventListener("click", handleNewMatch);
    boardEl.addEventListener("keydown", handleBoardKeydown);
    handleModeChange();
  };

  return { init };
})();

DisplayController.init();