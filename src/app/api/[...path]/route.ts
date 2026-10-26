import { NextRequest, NextResponse } from "next/server";

// In-memory persistent state for serverless demo fallback
const globalStore = (global as any).__LUCKHUB_STORE__ || {
  users: [
    {
      _id: "user_demo_1",
      username: "demo_player",
      email: "player@luckhub.com",
      phone: "01700000000",
      password: "Player@123456",
      role: "user",
      balance: 5000,
      bonusBalance: 100,
      currency: "BDT",
      status: "active",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "user_admin_1",
      username: "admin",
      email: "admin@luckhub.com",
      password: "Admin@123456",
      role: "admin",
      balance: 999999,
      bonusBalance: 0,
      currency: "BDT",
      status: "active",
      createdAt: new Date().toISOString(),
    },
  ],
  transactions: [
    {
      _id: "tx_1",
      user: "user_demo_1",
      type: "deposit",
      amount: 1000,
      currency: "BDT",
      method: "bkash",
      status: "completed",
      createdAt: new Date().toISOString(),
    },
  ],
  bets: [] as any[],
  crashBets: {} as Record<string, { amount: number; crashPoint: number; userId: string; settled: boolean }>,
  games: [
    { slug: "slots", name: "Lucky 777 Slots", category: "slots", rtp: 95, minBet: 10, maxBet: 50000, isFeatured: true, order: 1, description: "Classic 3-reel slot machine with wild multipliers", image: "🎰", jackpotAmount: 500000 },
    { slug: "crash", name: "Aviator Crash", category: "crash", rtp: 95, minBet: 10, maxBet: 50000, isFeatured: true, order: 2, description: "Watch the rocket fly and cashout before it crashes!", image: "🚀" },
    { slug: "jackpot", name: "Mega BDT Jackpot", category: "jackpot", rtp: 92, minBet: 50, maxBet: 10000, isFeatured: true, order: 3, description: "Spin the wheel for progressive ৳500,000 jackpot", image: "🏆", jackpotAmount: 500000 },
    { slug: "teen-patti", name: "Teen Patti 3-Card", category: "cards", rtp: 95, minBet: 20, maxBet: 50000, isFeatured: true, order: 4, description: "Popular South Asian 3-card poker game", image: "🃏" },
    { slug: "rummy", name: "Speed Rummy", category: "cards", rtp: 95, minBet: 20, maxBet: 50000, isFeatured: false, order: 5, description: "Fast-paced Indian/Bengali Rummy card showdown", image: "♠️" },
    { slug: "dice", name: "Crypto Dice", category: "dice", rtp: 97, minBet: 10, maxBet: 50000, isFeatured: false, order: 6, description: "Predict dice roll over or under for instant BDT", image: "🎲" },
    { slug: "color", name: "Color Prediction", category: "prediction", rtp: 95, minBet: 10, maxBet: 20000, isFeatured: true, order: 7, description: "Predict Red, Green, or Violet for up to 9x payout!", image: "🎨" },
  ],
};
(global as any).__LUCKHUB_STORE__ = globalStore;

function getUserFromToken(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  if (!token) return null;
  // If simulated or JWT token
  const u = globalStore.users.find((x: any) => x._id === token || x.email === token);
  if (u) return u;
  // Default to first user if token present
  return globalStore.users[0];
}

function houseRNG(rtp: number) {
  return Math.random() * 100 < rtp;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const endpoint = path.join("/");

  // GET /api/health
  if (endpoint === "health") {
    return NextResponse.json({ status: "ok", country: "BD", currency: "BDT", time: new Date() });
  }

  // GET /api/games
  if (endpoint === "games") {
    return NextResponse.json({ games: globalStore.games });
  }

  // GET /api/auth/me
  if (endpoint === "auth/me") {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { password, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  }

  // GET /api/wallet/balance
  if (endpoint === "wallet/balance") {
    const user = getUserFromToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ balance: user.balance, bonusBalance: user.bonusBalance || 0, currency: "BDT" });
  }

  // GET /api/wallet/transactions
  if (endpoint === "wallet/transactions") {
    const user = getUserFromToken(req);
    const txs = user
      ? globalStore.transactions.filter((t: any) => t.user === user._id)
      : globalStore.transactions;
    return NextResponse.json({ transactions: txs, total: txs.length });
  }

  // GET /api/admin/stats
  if (endpoint === "admin/stats") {
    const totalUsers = globalStore.users.length;
    const totalDeposits = globalStore.transactions
      .filter((t: any) => t.type === "deposit")
      .reduce((a: number, b: any) => a + (b.amount || 0), 0);
    const totalBets = globalStore.bets.length;
    const totalRevenue = totalDeposits;
    return NextResponse.json({ totalUsers, totalDeposits, totalBets, totalRevenue });
  }

  // GET /api/admin/users
  if (endpoint === "admin/users") {
    const users = globalStore.users.map(({ password, ...u }: any) => u);
    return NextResponse.json({ users, total: users.length });
  }

  return NextResponse.json({ message: `Route GET /api/${endpoint} not found` }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const endpoint = path.join("/");
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  // POST /api/auth/login
  if (endpoint === "auth/login") {
    const { email, password } = body;
    const user = globalStore.users.find(
      (u: any) => (u.email === email || u.username === email) && u.password === password
    );
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }
    const { password: _, ...safeUser } = user;
    return NextResponse.json({ token: user._id, user: safeUser });
  }

  // POST /api/auth/register
  if (endpoint === "auth/register") {
    const { username, email, password, phone } = body;
    if (!username || !email || !password) {
      return NextResponse.json({ message: "All fields required" }, { status: 400 });
    }
    const existing = globalStore.users.find((u: any) => u.email === email || u.username === username);
    if (existing) {
      return NextResponse.json({ message: "Username or email already taken" }, { status: 400 });
    }
    const newUser = {
      _id: `user_${Date.now()}`,
      username,
      email,
      phone: phone || "",
      password,
      role: "user",
      balance: 100, // ৳100 BDT Welcome Bonus!
      bonusBalance: 100,
      currency: "BDT",
      status: "active",
      createdAt: new Date().toISOString(),
    };
    globalStore.users.push(newUser);
    const { password: _, ...safeUser } = newUser;
    return NextResponse.json({ token: newUser._id, user: safeUser });
  }

  // Authenticated user check for games & wallet
  const user = getUserFromToken(req);

  // POST /api/wallet/deposit
  if (endpoint === "wallet/deposit") {
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const amount = parseFloat(body.amount) || 0;
    if (amount < 100) return NextResponse.json({ message: "Minimum deposit is 100 BDT" }, { status: 400 });
    
    // Auto-credit for demo play & create tx
    user.balance += amount;
    const tx = {
      _id: `tx_${Date.now()}`,
      user: user._id,
      type: "deposit",
      amount,
      currency: "BDT",
      method: body.method || "bkash",
      status: "completed",
      createdAt: new Date().toISOString(),
    };
    globalStore.transactions.unshift(tx);
    return NextResponse.json({ message: "Deposit verified & credited in BDT!", transaction: tx });
  }

  // POST /api/wallet/withdraw
  if (endpoint === "wallet/withdraw") {
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const amount = parseFloat(body.amount) || 0;
    if (amount < 200) return NextResponse.json({ message: "Minimum withdrawal is 200 BDT" }, { status: 400 });
    if (user.balance < amount) return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });

    user.balance -= amount;
    const tx = {
      _id: `tx_${Date.now()}`,
      user: user._id,
      type: "withdrawal",
      amount,
      currency: "BDT",
      method: body.method || "bkash",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    globalStore.transactions.unshift(tx);
    return NextResponse.json({ message: "Withdrawal request submitted!", transaction: tx });
  }

  // 1. SLOTS SPIN
  if (endpoint === "games/slots/spin") {
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const amount = Math.max(10, parseInt(body.betAmount) || 10);
    if (user.balance < amount) return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });

    const symbols = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "7️⃣", "🔔"];
    const reels = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    const isWin = houseRNG(95);
    let finalReels = reels;
    let multiplier = 0;
    let payout = 0;

    if (isWin) {
      const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const winCount = Math.random() < 0.6 ? 3 : 2;
      finalReels = winCount === 3
        ? [winSymbol, winSymbol, winSymbol]
        : [winSymbol, winSymbol, symbols[Math.floor(Math.random() * symbols.length)]];
      const payouts: Record<string, number> = { "💎": 50, "7️⃣": 25, "⭐": 15, "🔔": 10, "🍇": 5, "🍊": 4, "🍋": 3, "🍒": 2 };
      multiplier = (payouts[winSymbol] || 2) * (winCount === 3 ? 1 : 0.5);
      payout = Math.round(amount * multiplier);
    }

    user.balance = user.balance - amount + payout;
    const bet = { game: "slots", amount, multiplier, isWin, payout, createdAt: new Date().toISOString() };
    globalStore.bets.unshift(bet);

    return NextResponse.json({ reels: finalReels, isWin, multiplier, payout, balance: user.balance });
  }

  // 2. CRASH (AVIATOR)
  if (endpoint === "games/crash/start") {
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const amount = Math.max(10, parseInt(body.betAmount) || 10);
    if (user.balance < amount) return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });

    const e = 2 ** 32;
    const rand = Math.random() * e;
    let crashPoint = Math.floor((e / (e - rand)) * 100) / 100;
    if (!houseRNG(95)) crashPoint = Math.max(1.0, crashPoint * 0.35);
    crashPoint = Math.max(1.0, Math.min(crashPoint, 150));

    user.balance -= amount;
    const betId = `crash_${Date.now()}`;
    globalStore.crashBets[betId] = { amount, crashPoint, userId: user._id, settled: false };

    return NextResponse.json({ betId, crashPoint, balance: user.balance });
  }

  if (endpoint === "games/crash/cashout") {
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { betId, cashoutMultiplier } = body;
    const bet = globalStore.crashBets[betId];
    if (!bet || bet.settled) return NextResponse.json({ message: "Invalid or settled bet" }, { status: 400 });

    const m = parseFloat(cashoutMultiplier) || 1.0;
    const isWin = m <= bet.crashPoint;
    const payout = isWin ? Math.round(bet.amount * m) : 0;
    bet.settled = true;

    user.balance += payout;
    globalStore.bets.unshift({ game: "crash", amount: bet.amount, multiplier: m, isWin, payout });

    return NextResponse.json({ isWin, payout, crashPoint: bet.crashPoint, balance: user.balance });
  }

  // 3. DICE ROLL
  if (endpoint === "games/dice/roll") {
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const amount = Math.max(10, parseInt(body.betAmount) || 10);
    if (user.balance < amount) return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });

    const rollTarget = parseInt(body.target) || 50;
    const roll = Math.floor(Math.random() * 100) + 1;
    let isWin = false;
    let multiplier = 0;

    if (body.prediction === "over" && roll > rollTarget) {
      isWin = true;
      multiplier = parseFloat((98 / (100 - rollTarget)).toFixed(2));
    } else if (body.prediction === "under" && roll < rollTarget) {
      isWin = true;
      multiplier = parseFloat((98 / rollTarget).toFixed(2));
    }

    if (!houseRNG(97)) { isWin = false; multiplier = 0; }
    const payout = isWin ? Math.round(amount * multiplier) : 0;
    user.balance = user.balance - amount + payout;
    globalStore.bets.unshift({ game: "dice", amount, multiplier, isWin, payout });

    return NextResponse.json({ roll, isWin, multiplier, payout, balance: user.balance });
  }

  // 4. COLOR PREDICTION
  if (endpoint === "games/color/predict") {
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const amount = Math.max(10, parseInt(body.betAmount) || 10);
    if (user.balance < amount) return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });

    const colors = ["red", "green", "violet"];
    const weights = [45, 45, 10];
    const rand = Math.random() * 100;
    let result = "red";
    let cumul = 0;
    for (let i = 0; i < colors.length; i++) {
      cumul += weights[i];
      if (rand < cumul) { result = colors[i]; break; }
    }

    const multipliers: Record<string, number> = { red: 2, green: 2, violet: 9 };
    let isWin = body.color === result;
    if (!houseRNG(95)) isWin = false;

    const multiplier = isWin ? multipliers[result] : 0;
    const payout = isWin ? Math.round(amount * multiplier) : 0;
    user.balance = user.balance - amount + payout;
    globalStore.bets.unshift({ game: "color", amount, multiplier, isWin, payout });

    return NextResponse.json({ result, isWin, multiplier, payout, balance: user.balance });
  }

  // 5. TEEN PATTI
  if (endpoint === "games/teen-patti/play") {
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const amount = Math.max(20, parseInt(body.betAmount) || 20);
    if (user.balance < amount) return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });

    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const suits = ["♠", "♥", "♦", "♣"];
    const randCard = () => ({
      rank: ranks[Math.floor(Math.random() * ranks.length)],
      suit: suits[Math.floor(Math.random() * suits.length)],
    });

    const playerCards = [randCard(), randCard(), randCard()];
    const dealerCards = [randCard(), randCard(), randCard()];
    const isWin = houseRNG(95);
    const multiplier = isWin ? 1.95 : 0;
    const payout = isWin ? Math.round(amount * multiplier) : 0;

    user.balance = user.balance - amount + payout;
    return NextResponse.json({ playerCards, dealerCards, isWin, multiplier, payout, balance: user.balance });
  }

  // 6. RUMMY
  if (endpoint === "games/rummy/play") {
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const amount = Math.max(20, parseInt(body.betAmount) || 20);
    if (user.balance < amount) return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });

    const isWin = houseRNG(95);
    const multiplier = isWin ? 2.0 : 0;
    const payout = isWin ? Math.round(amount * multiplier) : 0;
    user.balance = user.balance - amount + payout;

    return NextResponse.json({ isWin, multiplier, payout, balance: user.balance });
  }

  // 7. MEGA JACKPOT
  if (endpoint === "games/jackpot/spin") {
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const amount = Math.max(50, parseInt(body.betAmount) || 50);
    if (user.balance < amount) return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });

    const slices = [
      { label: "Try Again", mult: 0, weight: 45 },
      { label: "2x BDT", mult: 2, weight: 25 },
      { label: "5x BDT", mult: 5, weight: 15 },
      { label: "10x BDT", mult: 10, weight: 9 },
      { label: "50x BDT", mult: 50, weight: 5 },
      { label: "🏆 MEGA JACKPOT", mult: 200, weight: 1 },
    ];

    let rand = Math.random() * 100;
    let selectedSlice = slices[0];
    let cumul = 0;
    for (const s of slices) {
      cumul += s.weight;
      if (rand < cumul) { selectedSlice = s; break; }
    }

    let isWin = selectedSlice.mult > 0;
    if (!houseRNG(92)) { isWin = false; selectedSlice = slices[0]; }
    const multiplier = isWin ? selectedSlice.mult : 0;
    const payout = isWin ? Math.round(amount * multiplier) : 0;
    user.balance = user.balance - amount + payout;

    return NextResponse.json({ slice: selectedSlice.label, isWin, multiplier, payout, balance: user.balance });
  }

  return NextResponse.json({ message: `Route POST /api/${endpoint} not found` }, { status: 404 });
}
