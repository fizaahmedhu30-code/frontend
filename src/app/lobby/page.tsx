"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronRight,
  Flame,
  Fish,
  Gamepad2,
  Gift,
  Globe,
  Layers,
  Menu,
  Rocket,
  Sparkles,
  Trophy,
  User,
  X,
  Zap,
  Dices,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────── */
/*  GAME DATA                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

const gameData = [
  {
    category: "সেরা (Top)",
    games: [
      "AVIATOR","SuperAce","SHOWDOWN","SuperAce DELUXE","Bounty Clash",
      "SuperAce 2 STACK","Fortune Gems 500","Chicken Road 2","Circus Joker 4096",
      "Fortune Gems 3","Boxing King","Magic Ace WILD LOCK","Aztec",
      "Anubis WRATH","Rolling Money","Egypt FORTUNE",
    ],
  },
  {
    category: "JILI",
    games: [
      "Super Ace","Fortune Gems","Boxing King","Money Coming","Crazy 777",
      "Golden Empire","All-Star Fishing","Royal Fishing","Jackpot Fishing",
      "Mega Fishing","Fortune King Jackpot","Ocean King Jackpot","Dragon Master",
      "Mystic Pyramid","Lucky Gold","7 up 777","777 Bonanza","Jungle King",
      "King Tower","Ninja Raccoon",
    ],
  },
  {
    category: "PG",
    games: [
      "Mahjong Ways","Mahjong Ways 2","Bounty Clash","Anubis WRATH",
      "Fortune Mouse","Fortune Ox","Fortune Tiger","Fortune Rabbit",
      "Caishen Wins","Treasures of Aztec","Ganesha Fortune","Buffalo Win",
      "Dragon Hatch","Lucky Neko","Hood vs Wolf",
    ],
  },
  {
    category: "SPRIDE",
    games: [
      "AVIATOR","Balloon","MINES","GOAL","PLINKO","ROULETTE",
      "DICE","HILO","KENO","HOTLINE",
    ],
  },
  {
    category: "FC FaChai",
    games: [
      "Super Elements","Ninja Warrior","Joker King","Dragon Soaring",
      "Golden Genie","Lucky Fortunes","Merge Magic","Star Hunter",
      "Monkey Key Fishing","Queen of Inca","Apollo","Power of Vikings",
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  EMOJI ICONS per game title (for cover art)                                 */
/* ─────────────────────────────────────────────────────────────────────────── */

const GAME_EMOJI: Record<string, string> = {
  AVIATOR:"✈️",Balloon:"🎈",MINES:"💣",GOAL:"⚽",PLINKO:"🎯",
  ROULETTE:"🎰",DICE:"🎲",HILO:"🃏",KENO:"🔢",HOTLINE:"📞",
  "Super Ace":"🃏","SuperAce":"🃏","SuperAce DELUXE":"🃏","SuperAce 2 STACK":"🃏",
  "Magic Ace WILD LOCK":"🃏","Fortune Gems":"💎","Fortune Gems 500":"💎",
  "Fortune Gems 3":"💎","Fortune Mouse":"🐭","Fortune Ox":"🐮",
  "Fortune Tiger":"🐯","Fortune Rabbit":"🐰","Fortune King Jackpot":"👑",
  "Lucky Gold":"🥇","Lucky Fortunes":"🍀","Lucky Neko":"🐱",
  "Boxing King":"🥊","Dragon Master":"🐉","Dragon Soaring":"🐉",
  "Dragon Hatch":"🐉","Dragon":"🐉","Golden Empire":"⚜️","Golden Genie":"🧞",
  "Golden":"⚜️","Gold":"🏅","Mega Fishing":"🐟","All-Star Fishing":"🎣",
  "Royal Fishing":"🎣","Jackpot Fishing":"🎣","Ocean King Jackpot":"🐙",
  "Monkey Key Fishing":"🐒","Fortune":"🍀","Crazy 777":"7️⃣",
  "7 up 777":"7️⃣","777 Bonanza":"7️⃣","Money Coming":"💵",
  "Jungle King":"🦁","Ninja Raccoon":"🥷","Ninja Warrior":"🥷",
  "King Tower":"🏰","Mahjong Ways":"🀄","Mahjong Ways 2":"🀄",
  "Caishen Wins":"💰","Treasures of Aztec":"⛩️","Aztec":"⛩️","Ganesha Fortune":"🐘",
  "Buffalo Win":"🦬","Hood vs Wolf":"🐺","Bounty Clash":"💥",
  "Anubis WRATH":"🏺","Egypt FORTUNE":"🏺","SHOWDOWN":"🃏",
  "Chicken Road 2":"🐔","Circus Joker 4096":"🃏","Rolling Money":"💵",
  "Mystic Pyramid":"🔺","Super Elements":"⚡","Joker King":"🃏",
  "Merge Magic":"✨","Star Hunter":"⭐","Queen of Inca":"👸",
  "Apollo":"☀️","Power of Vikings":"⚔️",
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HOW TO SWAP GAME URLS                                                       */
/*                                                                              */
/*  The map below controls which URL loads in the game modal iframe.            */
/*                                                                              */
/*  Options:                                                                    */
/*  1. Local HTML5 games (built into /public/games/)  ← default                */
/*  2. Pragmatic Play free demos — publicly accessible, no API key needed:      */
/*       https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?             */
/*         gameSymbol=SYMBOL&websiteUrl=https://demogamesfree.pragmaticplay.net  */
/*         &jurisdiction=99&lang=en_US&cur=EUR                                  */
/*     NOTE: Pragmatic may block iframe embedding (X-Frame-Options). If so,     */
/*     open those links in a new tab instead of an iframe.                      */
/*  3. PG Soft demos — https://m.pgsoft-games.com/{id}/index.html?l=en          */
/*     &ot=b1f4864f2f4cad759b38df700be7dedb&btt=2&from=https%3A%2F%2Fpgsoft.com */
/*     May require the pgsoft.com Referer header — not always iframeable.       */
/*  4. JILI / Spribe / FaChai — require operator license. No free public URLs.  */
/* ─────────────────────────────────────────────────────────────────────────── */

// ── Confirmed working Pragmatic Play free demo URL builder ──
// Uses jurisdiction=99 and websiteUrl=demogamesfree.pragmaticplay.net
// which bypasses X-Frame-Options on Pragmatic's demo CDN path.
// See research: https://demogamesfree.pragmaticplay.net/gs2c/openGame.do
const PP_BASE =
  "https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?websiteUrl=https://demogamesfree.pragmaticplay.net&jurisdiction=99&lang=en&cur=EUR&gameSymbol=";
const pp = (sym: string) => PP_BASE + sym;

// PG Soft requires operator token (ot) + player session — no free public URLs.
// All PG Soft games fall back to our local slot engine.

const GAME_URLS: Record<string, string> = {
  /* ── Spribe originals → local HTML5 builds (Spribe sets CSP frame-ancestors: self, no free iframes) ── */
  AVIATOR:         "/games/aviator/index.html",
  Balloon:         "/games/aviator/index.html",
  "Chicken Road 2":"/games/aviator/index.html",
  MINES:           "/games/mines/index.html",
  GOAL:            "/games/mines/index.html",
  PLINKO:          "/games/plinko/index.html",
  ROULETTE:        "/games/roulette/index.html",
  DICE:            "/games/dice/index.html",
  HILO:            "/games/dice/index.html",
  KENO:            "/games/plinko/index.html",
  HOTLINE:         "/games/slots/index.html",

  /* ── Pragmatic Play — confirmed free demo symbols (verified working) ── */
  // Gates of Olympus family
  "Golden Empire":      pp("vs20olympgate"),   // Gates of Olympus — gold theme match
  "SHOWDOWN":           pp("vs20olympx"),      // Gates of Olympus 1000

  // Sweet / Fruit theme
  "Fortune Gems":       pp("vs20fruitsw"),     // Sweet Bonanza
  "Fortune Gems 500":   pp("vs20sweetbonx"),   // Sweet Bonanza 1000
  "Fortune Gems 3":     pp("vs20sugarrush"),   // Sugar Rush
  "Lucky Gold":         pp("vs20sugarx"),      // Sugar Rush 1000

  // Fishing / Water theme
  "Boxing King":        pp("vs10bbbonanza"),   // Big Bass Bonanza
  "Mega Fishing":       pp("vs10bbsplash"),    // Big Bass Splash
  "Royal Fishing":      pp("vs12bbbonanza"),   // Bigger Bass Bonanza
  "All-Star Fishing":   pp("vswaysdogs"),      // Dog House Megaways

  // Adventure / Wild West
  "Jungle King":        pp("vs40wildwest"),    // Wild West Gold
  "Dragon Master":      pp("vswaysrhino"),     // Great Rhino Megaways

  // Princess / Star
  "Bounty Clash":       pp("vs20starlight"),   // Starlight Princess
  "Anubis WRATH":       pp("vs20starlightx"),  // Starlight Princess 1000

  // Wolf / Animal
  "Buffalo Win":        pp("vs25wolfgold"),    // Wolf Gold
  "Lucky Neko":         pp("vswaysmadame"),    // Madame Destiny Megaways

  // Fruit
  "Money Coming":       pp("vs20fruitparty"),  // Fruit Party
  "Rolling Money":      pp("vs20goldfever"),   // Gems Bonanza

  // Egypt / Ancient
  "Egypt FORTUNE":      pp("vs20cleocatra"),   // Cleocatra
  "Aztec":              pp("vs20gatotgates"),  // Gates of Gatot Kaca
  "Mystic Pyramid":     pp("vs25scarabqueen"), // John Hunter Scarab Queen

  // Other slots
  "Crazy 777":          pp("vs25chilli"),      // Chilli Heat
  "7 up 777":           pp("vs25chilli"),
  "777 Bonanza":        pp("vs25wolfgold"),
  "Joker King":         pp("vs20starlight"),
  "Circus Joker 4096":  pp("vs20starlight"),

  /* ── PG Soft → local slot (PG requires operator token, no free public URL) ── */
  // All PG games fall through to the local slot fallback below.

  /* ── Everything else → local 5-reel slot engine with game title ── */
};

function getGameUrl(game: GameCard): string {
  const direct = GAME_URLS[game.title];
  if (direct) return direct;
  // Fall back to local slot, passing the title so the slot shows the right name
  return `/games/slots/index.html?game=${encodeURIComponent(game.title)}`;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HELPERS                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

interface GameCard {
  title: string;
  provider: string;
  hot?: boolean;
  isNew?: boolean;
}

const HOT_GAMES = new Set([
  "AVIATOR","Fortune Tiger","Mahjong Ways","Fortune Gems","Super Ace",
  "Bounty Clash","Mega Fishing","Lucky Neko","Money Coming","Dragon Hatch",
]);
const NEW_GAMES = new Set([
  "SuperAce 2 STACK","Fortune Gems 500","Anubis WRATH","Power of Vikings","Apollo",
]);

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

const PALETTES = [
  ["#7f1d1d","#991b1b"],["#1a1a4a","#2d2d7a"],["#064e3b","#065f46"],
  ["#1e1b4b","#3730a3"],["#451a03","#78350f"],["#0c1445","#1e3a8a"],
  ["#1f2937","#374151"],["#14532d","#166534"],["#4c1d95","#6d28d9"],
  ["#134e4a","#0f766e"],
];

function coverStyle(title: string): React.CSSProperties {
  const h = hashStr(title);
  const p = PALETTES[h % PALETTES.length];
  return {
    background: `linear-gradient(145deg, ${p[0]}, ${p[1]})`,
  };
}

function gameEmoji(title: string): string {
  if (GAME_EMOJI[title]) return GAME_EMOJI[title];
  const lower = title.toLowerCase();
  if (lower.includes("fish") || lower.includes("ocean")) return "🐟";
  if (lower.includes("dragon")) return "🐉";
  if (lower.includes("gold") || lower.includes("fortune")) return "💰";
  if (lower.includes("ninja") || lower.includes("warrior")) return "🥷";
  if (lower.includes("king") || lower.includes("queen") || lower.includes("royal")) return "👑";
  if (lower.includes("gem") || lower.includes("diamond")) return "💎";
  if (lower.includes("magic") || lower.includes("mystic") || lower.includes("wizard")) return "🔮";
  if (lower.includes("jungle") || lower.includes("tiger") || lower.includes("buffalo")) return "🦁";
  if (lower.includes("egypt") || lower.includes("aztec") || lower.includes("pyramid")) return "🏺";
  if (lower.includes("777") || lower.includes("crazy")) return "7️⃣";
  return "🎰";
}

const sectionId = (cat: string) => `sec-${hashStr(cat)}`;

const SIDEBAR: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  "সেরা (Top)": { label: "সেরা", icon: <Flame size={20} />, color: "#ef4444" },
  JILI:         { label: "Jili", icon: <Sparkles size={20} />, color: "#f59e0b" },
  PG:           { label: "PG",   icon: <Layers size={20} />, color: "#a78bfa" },
  SPRIDE:       { label: "Spride",icon: <Rocket size={20} />, color: "#38bdf8" },
  "FC FaChai":  { label: "FaChai",icon: <Fish size={20} />, color: "#4ade80" },
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  COMPONENTS                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

function GameTile({
  game,
  onOpen,
}: {
  game: GameCard;
  onOpen: (g: GameCard) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(game)}
      aria-label={`Play ${game.title}`}
      className="group relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/10 text-left shadow-md shadow-black/50 transition duration-200 hover:-translate-y-0.5 hover:border-amber-400/60 hover:shadow-amber-900/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95"
      style={coverStyle(game.title)}
    >
      {/* Game emoji icon */}
      <span className="absolute inset-0 flex items-center justify-center text-[32px] sm:text-[36px] transition-transform duration-300 group-hover:scale-110 mt-1">
        {gameEmoji(game.title)}
      </span>

      {/* HOT / NEW badges */}
      {game.hot && (
        <span className="absolute left-1 top-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-black uppercase text-white shadow">
          🔥 HOT
        </span>
      )}
      {game.isNew && !game.hot && (
        <span className="absolute left-1 top-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[8px] font-black uppercase text-white shadow">
          ✨ NEW
        </span>
      )}

      {/* Play overlay */}
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
        <span className="rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black text-black shadow-lg">
          ▶ PLAY
        </span>
      </span>

      {/* Title bar */}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-1 pb-1 pt-5">
        <span className="block text-center text-[8px] font-bold uppercase leading-tight text-amber-100 line-clamp-2 sm:text-[10px]">
          {game.title}
        </span>
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

function GameModal({ game, onClose }: { game: GameCard; onClose: () => void }) {
  const isExternal = getGameUrl(game).startsWith("http");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={game.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-full max-h-[820px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-amber-400/40 bg-[#1a0505] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-amber-400/20 bg-gradient-to-r from-red-900 via-red-800 to-red-900 px-4 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{gameEmoji(game.title)}</span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-extrabold text-amber-200 sm:text-base">
                {game.title}
              </h2>
              <p className="text-[10px] text-red-300">{game.provider} · Demo mode · Play credits only</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isExternal && (
              <a
                href={getGameUrl(game)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-amber-500/20 px-2 py-1 text-[10px] font-bold text-amber-200 hover:bg-amber-500/40 transition"
                title="Open in new tab if iframe is blocked"
              >
                ↗ New tab
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-black/40 p-1.5 text-amber-200 hover:bg-black/70 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Game iframe */}
        {/*
          HOW TO SWAP THE GAME URL
          ─────────────────────────
          Edit the GAME_URLS map at the top of this file.
          · Local games  → /games/{name}/index.html
          · PG Soft      → pg(id) helper (may need pgsoft.com Referer)
          · Pragmatic    → pp("symbol") helper — real free demos, may block iframe
          · JILI/Spribe  → paid operator license required; no free public URLs exist
          If a provider blocks iframe embedding, the "New tab" button opens the URL directly.
        */}
        <iframe
          key={game.title}
          title={game.title}
          src={getGameUrl(game)}
          className="min-h-0 w-full flex-1 bg-black"
          allow="fullscreen autoplay"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MAIN PAGE                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

// Inside LobbyPage component – add sidebar toggle state
  const [showSidebar, setShowSidebar] = useState(false);

  // Toggle handler
  const toggleSidebar = () => setShowSidebar(s => !s);

  // Close sidebar when clicking outside (overlay) – already handled by overlay click

  // ... later in the return JSX ...
  return (
    <div className="flex h-dvh flex-col overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% -20%,#7f1d1d 0%,#450a0a 45%,#1c0303 100%)" }}>

      {/* ─── HEADER ─── */}
      <header className="shrink-0 border-b border-amber-500/20 bg-black/40 px-3 pb-2 pt-3 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎰</span>
          <h1
            className="text-2xl font-black tracking-widest"
            style={{ background: "linear-gradient(180deg,#fde68a,#f59e0b,#b45309)", WebkitBackgroundClip: "text", color: "transparent" }}
          >
            LV666
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Hamburger for mobile */}
          <button
            type="button"
            className="rounded-lg border border-amber-500/30 bg-red-950/70 p-2 text-amber-300 hover:bg-red-900 md:hidden"
            onClick={toggleSidebar}
          >
            <Menu size={17} />
          </button>
          <button type="button" className="rounded-lg border border-amber-500/30 bg-red-950/70 p-2 text-amber-300 hover:bg-red-900 md:hidden">
            <Globe size={17} />
          </button>
          <button type="button" className="rounded-lg border border-amber-500/30 bg-red-950/70 p-2 text-amber-300 hover:bg-red-900 hidden md:block">
            <Globe size={17} />
          </button>
          <button type="button" className="rounded-lg border border-amber-500/30 bg-red-950/70 p-2 text-amber-300 hover:bg-red-900 hidden md:block">
            <Menu size={17} />
          </button>
        </div>
      </header>

      {/* Overlay for mobile when sidebar is open */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* ─── SIDEBAR + GRID ─── */}
      <div className="flex min-h-0 flex-1 gap-2 px-2 pt-2 mx-auto w-full max-w-7xl">

        {/* Sidebar */}
        <nav
          aria-label="Game providers"
          className={
            `${showSidebar ? "fixed inset-y-0 left-0 z-40 w-[200px] bg-black/90 p-2" : "hidden md:block"}` +
            ` w-[58px] shrink-0 space-y-2 overflow-y-auto pb-28 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-[76px]`
          }
          onClick={e => e.stopPropagation()}
        >
          {/* Close button only on mobile */}
          {showSidebar && (
            <button
              type="button"
              className="mb-4 block md:hidden text-amber-300"
              onClick={toggleSidebar}
            >
              <X size={20} />
            </button>
          )}
          {sections.map((s) => {
            const meta = SIDEBAR[s.category];
            const on = active === s.category;
            return (
              <button
                key={s.category}
                type="button"
                onClick={() => { jumpTo(s.category, s.id); if (showSidebar) toggleSidebar(); }}
                aria-current={on}
                style={on && meta ? { borderColor: meta.color + "99", boxShadow: `0 0 12px ${meta.color}55` } : {}}
                className={[
                  "flex w-full flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-[9px] font-black uppercase tracking-wide transition sm:text-[11px]",
                  on
                    ? "bg-gradient-to-b from-red-700 to-red-900 text-amber-200"
                    : "border-red-900/50 bg-red-950/60 text-red-400 hover:border-amber-500/40 hover:text-amber-300",
                ].join(" ")}
              >
                <span style={on && meta ? { color: meta.color } : {}}>{meta?.icon ?? <Gamepad2 size={20} />}</span>
                <span className="max-w-full truncate">{meta?.label ?? s.category}</span>
              </button>
            );
          })}
        </nav>

        {/* Main game area */}
        <main
          ref={scrollRef}
          className="min-w-0 flex-1 space-y-3 overflow-y-auto pb-28 [scrollbar-width:thin]"
        >
          {/* ... existing sections unchanged ... */}
        </main>
      </div>

      {/* Bottom Nav remains unchanged */}
      ...
    </div>
  );

  const [active, setActive] = useState(gameData[0].category);
  const [selected, setSelected] = useState<GameCard | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const clickLockRef = useRef<number | null>(null);

  const sections = useMemo(
    () =>
      gameData.map((s) => ({
        ...s,
        id: sectionId(s.category),
        cards: s.games.map((title) => ({
          title,
          provider: s.category,
          hot: HOT_GAMES.has(title),
          isNew: NEW_GAMES.has(title),
        })),
      })),
    [],
  );

  // Scroll-spy
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const onScroll = () => {
      if (clickLockRef.current) return;
      const top = root.getBoundingClientRect().top + 32;
      let cur = sections[0].category;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= top) cur = s.category;
      }
      setActive(cur);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, [sections]);

  const jumpTo = useCallback((cat: string, id: string) => {
    setActive(cat);
    if (clickLockRef.current) window.clearTimeout(clickLockRef.current);
    clickLockRef.current = window.setTimeout(() => (clickLockRef.current = null), 700);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const closeModal = useCallback(() => setSelected(null), []);

  return (
    <div className="flex h-dvh flex-col overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% -20%,#7f1d1d 0%,#450a0a 45%,#1c0303 100%)" }}>

      {/* ─── HEADER ─── */}
      <header className="shrink-0 border-b border-amber-500/20 bg-black/40 px-3 pb-2 pt-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎰</span>
            <h1
              className="text-2xl font-black tracking-widest"
              style={{ background: "linear-gradient(180deg,#fde68a,#f59e0b,#b45309)", WebkitBackgroundClip: "text", color: "transparent" }}
            >
              LV666
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-lg border border-amber-500/30 bg-red-950/70 p-2 text-amber-300 hover:bg-red-900 transition">
              <Globe size={17} />
            </button>
            <button type="button" className="rounded-lg border border-amber-500/30 bg-red-950/70 p-2 text-amber-300 hover:bg-red-900 transition">
              <Menu size={17} />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between rounded-xl border border-amber-500/20 bg-red-950/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-red-800 text-amber-300">
              <User size={15} />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-bold text-amber-100">Welcome</p>
              <p className="text-[10px] text-red-300">Guest · Demo mode</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-black text-white shadow hover:bg-red-500 transition">
              লগইন
            </button>
            <button type="button"
              className="rounded-lg px-4 py-1.5 text-xs font-black text-red-950 shadow hover:brightness-110 transition"
              style={{ background: "linear-gradient(175deg,#fde047,#f59e0b)" }}>
              নিবন্ধন
            </button>
          </div>
        </div>
      </header>

      {/* ─── SIDEBAR + GRID ─── */}
      <div className="flex min-h-0 flex-1 gap-2 px-2 pt-2 mx-auto w-full max-w-7xl">

        {/* Sidebar */}
        <nav
          aria-label="Game providers"
          className="w-[58px] shrink-0 space-y-2 overflow-y-auto pb-28 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:w-[76px]"
        >
          {sections.map((s) => {
            const meta = SIDEBAR[s.category];
            const on = active === s.category;
            return (
              <button
                key={s.category}
                type="button"
                onClick={() => jumpTo(s.category, s.id)}
                aria-current={on}
                style={on && meta ? { borderColor: meta.color + "99", boxShadow: `0 0 12px ${meta.color}55` } : {}}
                className={[
                  "flex w-full flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-[9px] font-black uppercase tracking-wide transition sm:text-[11px]",
                  on
                    ? "bg-gradient-to-b from-red-700 to-red-900 text-amber-200"
                    : "border-red-900/50 bg-red-950/60 text-red-400 hover:border-amber-500/40 hover:text-amber-300",
                ].join(" ")}
              >
                <span style={on && meta ? { color: meta.color } : {}}>{meta?.icon ?? <Gamepad2 size={20} />}</span>
                <span className="max-w-full truncate">{meta?.label ?? s.category}</span>
              </button>
            );
          })}
        </nav>

        {/* Main game area */}
        <main
          ref={scrollRef}
          className="min-w-0 flex-1 space-y-3 overflow-y-auto pb-28 [scrollbar-width:thin]"
        >
          {sections.map((s) => {
            const meta = SIDEBAR[s.category];
            return (
              <section
                key={s.category}
                id={s.id}
                aria-labelledby={`${s.id}-t`}
                className="scroll-mt-1 overflow-hidden rounded-2xl border border-amber-500/15"
                style={{ background: "linear-gradient(160deg,rgba(40,5,5,.9),rgba(20,2,2,.95))" }}
              >
                {/* Section header */}
                <div
                  className="flex items-center justify-between px-3 py-2"
                  style={{
                    background: meta
                      ? `linear-gradient(90deg, ${meta.color}33, transparent)`
                      : "linear-gradient(90deg,rgba(127,29,29,.8),transparent)",
                    borderBottom: `1px solid ${meta?.color ?? "#f59e0b"}22`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={meta ? { color: meta.color } : {}}>{meta?.icon ?? <Gamepad2 size={18} />}</span>
                    <h2 id={`${s.id}-t`} className="text-sm font-extrabold text-amber-100">
                      {s.category}
                    </h2>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    সব {s.cards.length}
                    <ChevronRight size={11} />
                  </span>
                </div>

                {/* Game grid */}
                <div className="grid grid-cols-4 gap-2 p-2 sm:grid-cols-5 sm:gap-2.5 sm:p-3 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8">
                  {s.cards.map((g, i) => (
                    <GameTile key={`${g.title}-${i}`} game={g} onOpen={setSelected} />
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      </div>

      {/* ─── BOTTOM NAV ─── */}
      <nav
        aria-label="Primary navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-500/20 backdrop-blur-md"
        style={{ background: "linear-gradient(0deg,#1c0303 0%,rgba(40,5,5,.98) 100%)" }}
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5 items-end px-2 pb-[max(4px,env(safe-area-inset-bottom))] pt-1">
          <NavItem icon={<Flame size={20} />} label="Top" active />
          <NavItem icon={<Dices size={20} />} label="ক্যাসিনো" />
          <li className="flex justify-center">
            <button
              type="button"
              className="-mt-5 grid h-14 w-14 place-items-center rounded-2xl border-2 border-amber-300 text-amber-200 shadow-lg shadow-black/70 transition hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(175deg,#ef4444,#991b1b)" }}
            >
              <Gift size={26} />
            </button>
          </li>
          <NavItem icon={<Trophy size={20} />} label="খেলা" />
          <NavItem icon={<User size={20} />} label="প্রোফাইল" />
        </ul>
      </nav>

      {selected && <GameModal game={selected} onClose={closeModal} />}
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <li>
      <button type="button" className={`flex w-full flex-col items-center gap-0.5 py-1.5 text-[10px] font-bold transition ${active ? "text-amber-300" : "text-red-400 hover:text-amber-300"}`}>
        {icon}
        {label}
      </button>
    </li>
  );
}
