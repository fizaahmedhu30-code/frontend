"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Trophy,
  Flame,
  Sparkles,
  Wallet,
  LogIn,
  User,
  RefreshCw,
  X,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Play,
  Gift,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Dices,
  Layers,
  Coins,
  ChevronRight,
  Eye,
  LogOut,
  Home as HomeIcon,
  Gamepad2,
  Smartphone,
  Download,
} from "lucide-react";

const API_BASE = "/api";

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  balance: number;
  bonusBalance?: number;
  currency: string;
}

interface GameItem {
  slug: string;
  name: string;
  category: string;
  rtp: number;
  minBet: number;
  maxBet: number;
  jackpotAmount?: number;
  description: string;
  image: string;
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [games, setGames] = useState<GameItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletTab, setWalletTab] = useState<"deposit" | "withdraw" | "history">("deposit");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Wallet states
  const [depositMethod, setDepositMethod] = useState<"bkash" | "nagad" | "rocket" | "upay">("bkash");
  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [depositTrxId, setDepositTrxId] = useState("");
  const [depositPhone, setDepositPhone] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [walletMessage, setWalletMessage] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Mobile PWA Install state
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  // Admin stats
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);

  // Ticker notifications
  const [tickerIndex, setTickerIndex] = useState(0);
  const tickers = [
    "🇧🇩 Tanvir from Dhaka just won ৳28,400 on Aviator Crash!",
    "🔥 Shakib from Chittagong hit 777 Jackpot for ৳75,000!",
    "⚡ Instant 2-minute deposit & withdrawal active via bKash & Nagad",
    "🎁 Welcome Bonus: Get ৳100 BDT free on registration + 100% deposit match",
    "🎉 Mehedi won ৳12,000 in Color Prediction!",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickers.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [tickers.length]);

  // Capture PWA beforeinstallprompt event
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowInstallBanner(false);
      }
      setInstallPrompt(null);
    } else {
      alert("To install LuckHub BD: Tap your browser's share or menu icon and select 'Add to Home Screen'!");
    }
  };

  // Load token & user
  useEffect(() => {
    const savedToken = localStorage.getItem("luckhub_token");
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    }
    fetchGames();
  }, []);

  const fetchUserProfile = async (jwtToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("luckhub_token");
        setToken(null);
        setUser(null);
      }
    } catch {}
  };

  const fetchGames = async () => {
    try {
      const res = await fetch(`${API_BASE}/games`);
      if (res.ok) {
        const data = await res.json();
        setGames(data.games || []);
      }
    } catch {}
  };

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const email = customEmail || loginEmail;
    const password = customPass || loginPassword;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("luckhub_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setShowAuthModal(false);
      setLoginEmail("");
      setLoginPassword("");
    } catch (err: any) {
      setAuthError(err.message || "Failed to login");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          currency: "BDT",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      localStorage.setItem("luckhub_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err.message || "Registration error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("luckhub_token");
    setToken(null);
    setUser(null);
    setSelectedGame(null);
  };

  const refreshBalance = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => (prev ? { ...prev, balance: data.balance } : null));
      }
    } catch {}
  };

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/wallet/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch {}
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setWalletMessage("");
    try {
      const res = await fetch(`${API_BASE}/wallet/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: depositAmount,
          method: depositMethod,
          reference: depositTrxId,
          accountDetails: {
            accountNumber: depositPhone,
            paymentMethod: depositMethod.toUpperCase(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Deposit request failed");
      setWalletMessage("✅ Deposit credited! BDT added to your balance.");
      setDepositTrxId("");
      fetchTransactions();
      refreshBalance();
    } catch (err: any) {
      setWalletMessage("❌ " + (err.message || "Failed to submit deposit"));
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setWalletMessage("");
    try {
      const res = await fetch(`${API_BASE}/wallet/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          method: withdrawMethod,
          accountDetails: {
            accountNumber: withdrawPhone,
            method: withdrawMethod.toUpperCase(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Withdrawal failed");
      setWalletMessage("✅ Withdrawal submitted! ৳" + withdrawAmount + " BDT will be sent to your " + withdrawMethod + " number.");
      refreshBalance();
      fetchTransactions();
    } catch (err: any) {
      setWalletMessage("❌ " + (err.message || "Failed to submit withdrawal"));
    }
  };

  const fetchAdminData = async () => {
    if (!token) return;
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (statsRes.ok) setAdminStats(await statsRes.json());
      if (usersRes.ok) {
        const u = await usersRes.json();
        setAdminUsers(u.users || []);
      }
    } catch {}
  };

  const filteredGames = games.filter((g) => {
    if (activeCategory === "all") return true;
    return g.category === activeCategory;
  });

  const bdPaymentNumbers: Record<string, string> = {
    bkash: "01712345678",
    nagad: "01812345678",
    rocket: "01912345678-9",
    upay: "01612345678",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Mobile PWA Install Banner */}
      {showInstallBanner && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 px-3 py-2 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>Install LuckHub BD App on your phone for instant access!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="bg-slate-950 hover:bg-slate-900 text-amber-300 px-3 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 shadow"
            >
              <Download className="w-3 h-3" /> Install
            </button>
            <button onClick={() => setShowInstallBanner(false)} className="text-slate-950/70 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950/60 border-b border-amber-500/20 px-3 sm:px-4 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-amber-400 shrink-0">LIVE FEED:</span>
          <span className="text-slate-300 truncate">{tickers[tickerIndex]}</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-slate-400 shrink-0 hidden sm:flex">
          <span className="flex items-center gap-1 text-emerald-400">
            <Shield className="w-3.5 h-3.5" /> 100% Certified BD Casino
          </span>
          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded font-mono">
            ৳ BDT
          </span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#0a0f1d]/95 backdrop-blur border-b border-slate-800 px-3 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setSelectedGame(null)}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300 shrink-0">
              <span className="text-xl sm:text-2xl">🎰</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 bg-clip-text text-transparent">
                  LUCKHUB
                </span>
                <span className="bg-emerald-600 text-[9px] font-bold px-1.5 py-0.2 rounded text-white border border-emerald-400">
                  BD 🇧🇩
                </span>
              </div>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-medium hidden sm:block">
                Official Bangladesh Platform
              </p>
            </div>
          </div>

          {/* User / Auth Bar */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Balance Pill */}
                <div
                  onClick={() => {
                    setShowWalletModal(true);
                    setWalletTab("deposit");
                  }}
                  className="flex items-center bg-[#131b2e] border border-amber-500/30 rounded-xl px-2.5 sm:px-3.5 py-1 shadow-inner cursor-pointer"
                >
                  <div className="flex flex-col text-right mr-1.5 sm:mr-2">
                    <span className="text-[9px] text-slate-400 font-medium">Balance</span>
                    <span className="text-xs sm:text-sm font-extrabold text-amber-400 flex items-center gap-0.5">
                      <span>৳</span> {user.balance.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshBalance();
                    }}
                    title="Refresh Balance"
                    className="p-1 hover:text-amber-400 text-slate-400 transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                {/* Deposit Button (Desktop) */}
                <button
                  onClick={() => {
                    setShowWalletModal(true);
                    setWalletTab("deposit");
                  }}
                  className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" /> Deposit (+100%)
                </button>

                {/* Admin button if admin */}
                {user.role === "admin" && (
                  <button
                    onClick={() => {
                      fetchAdminData();
                      setShowAdminModal(true);
                    }}
                    className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold px-2 py-1 rounded-lg text-xs"
                  >
                    <Shield className="w-3 h-3" /> Admin
                  </button>
                )}

                {/* User Dropdown / Logout */}
                <div className="flex items-center space-x-1 pl-1.5 border-l border-slate-800">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuthModal(true);
                  }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 transition"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setAuthMode("register");
                    setShowAuthModal(true);
                  }}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition transform active:scale-95 flex items-center gap-1"
                >
                  <Gift className="w-3 h-3" /> Sign Up (+৳100)
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area - has pb-24 for mobile bottom navigation dock */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 pb-24 md:pb-8">
        {/* Banner Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121a30] via-[#0d1424] to-[#181128] border border-amber-500/20 p-5 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" /> ৳10,000 BDT Welcome Match + Instant bKash & Nagad
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              BANGLADESH&apos;S PREMIER <br />
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                ONLINE CASINO & GAMES
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Play Aviator Crash, 777 Slots, Teen Patti & Color Prediction. Deposit & withdraw seamlessly in BDT with 0% fee.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={() => {
                  if (!user) {
                    setAuthMode("register");
                    setShowAuthModal(true);
                  } else {
                    setSelectedGame("crash");
                  }
                }}
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/30 hover:brightness-110 transition flex items-center gap-2 text-xs sm:text-sm active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Play Aviator Crash
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    setAuthMode("login");
                    setShowAuthModal(true);
                  } else {
                    setShowWalletModal(true);
                    setWalletTab("deposit");
                  }
                }}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl transition text-xs sm:text-sm flex items-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5 text-emerald-400" /> bKash / Nagad Deposit
              </button>
            </div>
          </div>

          {/* Payment Badges on Banner */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 text-[11px]">Bangladesh Mobile Banking:</span>
            <span className="bg-pink-950/40 border border-pink-700/40 text-pink-300 px-2 py-0.5 rounded-lg font-bold text-[11px]">
              📱 bKash (বিকাশ)
            </span>
            <span className="bg-orange-950/40 border border-orange-700/40 text-orange-300 px-2 py-0.5 rounded-lg font-bold text-[11px]">
              ⚡ Nagad (নগদ)
            </span>
            <span className="bg-purple-950/40 border border-purple-700/40 text-purple-300 px-2 py-0.5 rounded-lg font-bold text-[11px]">
              🚀 Rocket (রকেট)
            </span>
            <span className="bg-blue-950/40 border border-blue-700/40 text-blue-300 px-2 py-0.5 rounded-lg font-bold text-[11px]">
              🔷 Upay (উপায়)
            </span>
          </div>
        </section>

        {/* Categories Bar */}
        <div id="games-section" className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/60">
          {[
            { id: "all", name: "All Games", icon: <Layers className="w-3.5 h-3.5" /> },
            { id: "crash", name: "Aviator Crash", icon: <TrendingUp className="w-3.5 h-3.5 text-rose-400" /> },
            { id: "slots", name: "Lucky Slots", icon: <Coins className="w-3.5 h-3.5 text-amber-400" /> },
            { id: "cards", name: "Teen Patti & Cards", icon: <Sparkles className="w-3.5 h-3.5 text-blue-400" /> },
            { id: "dice", name: "Dice", icon: <Dices className="w-3.5 h-3.5 text-emerald-400" /> },
            { id: "prediction", name: "Color Prediction", icon: <Zap className="w-3.5 h-3.5 text-purple-400" /> },
            { id: "jackpot", name: "Mega Jackpot", icon: <Trophy className="w-3.5 h-3.5 text-yellow-400" /> },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Game Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
              <Flame className="w-5 h-5 text-amber-400" /> Featured Casino Games
            </h2>
            <span className="text-xs text-slate-400">{filteredGames.length} Games Ready</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {filteredGames.map((game) => (
              <div
                key={game.slug}
                className="group relative bg-gradient-to-b from-[#101728] to-[#0c1220] rounded-2xl border border-slate-800 hover:border-amber-500/50 p-3 sm:p-4 transition duration-300 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
              >
                <div>
                  {/* Game Card Header / Icon */}
                  <div className="h-32 sm:h-40 rounded-xl bg-gradient-to-tr from-[#162038] to-[#1e2a4a] flex items-center justify-center relative overflow-hidden mb-2.5 border border-slate-800">
                    <span className="text-5xl sm:text-6xl filter drop-shadow group-hover:scale-110 transition duration-300">
                      {game.image || "🎰"}
                    </span>
                    <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-400 border border-amber-500/30">
                      RTP {game.rtp}%
                    </div>
                    {game.jackpotAmount && (
                      <div className="absolute bottom-1.5 left-1.5 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
                        ৳{game.jackpotAmount.toLocaleString()} JACKPOT
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-400 transition truncate">
                    {game.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 hidden sm:block">{game.description}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[10px] sm:text-[11px] text-slate-400">
                    Min: <span className="text-amber-400 font-bold">৳{game.minBet}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) {
                        setAuthMode("login");
                        setShowAuthModal(true);
                      } else {
                        setSelectedGame(game.slug);
                      }
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 transition transform active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-current" /> Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bangladesh Local VIP & Bonus Showcase */}
        <section className="bg-gradient-to-r from-slate-900 via-[#10182b] to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              🇧🇩 Bangladesh Exclusive Promotion
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">Daily 20% Reload Bonus on bKash & Nagad</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Deposit minimum ৳200 BDT everyday and automatically receive up to ৳2,000 BDT reload bonus into your wallet.
            </p>
          </div>
          <button
            onClick={() => {
              if (!user) {
                setAuthMode("register");
                setShowAuthModal(true);
              } else {
                setShowWalletModal(true);
                setWalletTab("deposit");
              }
            }}
            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition text-center"
          >
            Claim Daily Bonus ৳
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060911] px-4 py-6 text-center text-xs text-slate-500 space-y-2 pb-24 md:pb-6">
        <div className="flex items-center justify-center space-x-2 text-slate-400 font-semibold text-[11px]">
          <span>LuckHub BD</span>
          <span>•</span>
          <span>18+ Play Responsibly</span>
          <span>•</span>
          <span>Bangladesh Licensed</span>
        </div>
        <p className="text-[10px]">© 2026 LuckHub Bangladesh. Currency: Bangladeshi Taka (৳ BDT).</p>
      </footer>

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM APP NAVIGATION BAR (Native App Feel)                 */}
      {/* ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0a0f1d]/95 backdrop-blur-lg border-t border-slate-800/90 px-3 py-1.5 shadow-2xl flex items-center justify-around text-center select-none">
        {/* 1. Home */}
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            setSelectedGame(null);
          }}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-amber-400 transition"
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold">হোম</span>
        </button>

        {/* 2. Games */}
        <button
          onClick={() => {
            document.getElementById("games-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-amber-400 transition"
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px] font-bold">গেমস</span>
        </button>

        {/* 3. Center Deposit Glow Button */}
        <button
          onClick={() => {
            if (!user) {
              setAuthMode("login");
              setShowAuthModal(true);
            } else {
              setShowWalletModal(true);
              setWalletTab("deposit");
            }
          }}
          className="-mt-5 bg-gradient-to-tr from-emerald-500 via-emerald-400 to-green-500 text-slate-950 p-3 rounded-full shadow-lg shadow-emerald-500/40 border-2 border-emerald-300 flex flex-col items-center justify-center transform active:scale-95 transition"
        >
          <Wallet className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[8px] font-black uppercase mt-0.5">+100%</span>
        </button>

        {/* 4. Promos */}
        <button
          onClick={() => setShowPromoModal(true)}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-amber-400 transition"
        >
          <Gift className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-bold">অফার</span>
        </button>

        {/* 5. Profile / Login */}
        <button
          onClick={() => {
            if (!user) {
              setAuthMode("login");
              setShowAuthModal(true);
            } else {
              setShowWalletModal(true);
              setWalletTab("history");
            }
          }}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-amber-400 transition"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">{user ? "প্রোফাইল" : "লগইন"}</span>
        </button>
      </nav>

      {/* ======================= PROMOTIONS MODAL ======================= */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0f172a] border border-amber-500/30 w-full max-w-md rounded-2xl p-5 shadow-2xl relative max-h-[90dvh] overflow-y-auto">
            <button
              onClick={() => setShowPromoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="font-bold text-lg text-white">LuckHub BD Promotions</h3>
                <p className="text-xs text-slate-400">Exclusive bonuses for Bangladeshi players</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { title: "🎉 Welcome Bonus", desc: "Get ৳100 BDT free on registration immediately", tag: "FREE ৳100" },
                { title: "💰 First Deposit 100% Match", desc: "Deposit via bKash/Nagad and get 100% extra up to ৳10,000", tag: "+100%" },
                { title: "🔄 Daily Reload Bonus", desc: "20% daily bonus up to ৳2,000 BDT every single day", tag: "DAILY" },
                { title: "👥 Refer & Earn", desc: "Earn ৳50 BDT cash for every friend who signs up with your link", tag: "৳50 CASH" },
              ].map((promo, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-white text-xs">{promo.title}</h4>
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded">
                      {promo.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{promo.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowPromoModal(false);
                if (!user) {
                  setAuthMode("register");
                  setShowAuthModal(true);
                } else {
                  setShowWalletModal(true);
                  setWalletTab("deposit");
                }
              }}
              className="mt-4 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs"
            >
              Claim Bonuses Now
            </button>
          </div>
        </div>
      )}

      {/* ======================= PLAYABLE GAME MODAL ======================= */}
      {selectedGame && user && (
        <GameModal
          slug={selectedGame}
          token={token!}
          user={user}
          onClose={() => {
            setSelectedGame(null);
            refreshBalance();
          }}
          onBalanceUpdate={(newBal) => setUser((prev) => (prev ? { ...prev, balance: newBal } : null))}
        />
      )}

      {/* ======================= WALLET MODAL ======================= */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0f172a] border border-amber-500/30 w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl relative max-h-[92dvh] overflow-y-auto">
            <button
              onClick={() => {
                setShowWalletModal(false);
                setWalletMessage("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white">LuckHub Wallet (Bangladesh)</h3>
                <p className="text-xs text-slate-400">
                  Current Balance: <span className="text-amber-400 font-bold font-mono">৳{user?.balance.toLocaleString()} BDT</span>
                </p>
              </div>
            </div>

            {/* Wallet Tabs */}
            <div className="flex border-b border-slate-800 mb-4">
              <button
                onClick={() => setWalletTab("deposit")}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${
                  walletTab === "deposit"
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Deposit (জমা)
              </button>
              <button
                onClick={() => setWalletTab("withdraw")}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${
                  walletTab === "withdraw"
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                Withdraw (উত্তোলন)
              </button>
              <button
                onClick={() => {
                  setWalletTab("history");
                  fetchTransactions();
                }}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition ${
                  walletTab === "history"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                History (ইতিহাস)
              </button>
            </div>

            {walletMessage && (
              <div className="mb-4 p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-medium">
                {walletMessage}
              </div>
            )}

            {/* DEPOSIT TAB */}
            {walletTab === "deposit" && (
              <form onSubmit={handleDepositSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Payment Method:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "bkash", name: "bKash", color: "border-pink-500 text-pink-400" },
                      { id: "nagad", name: "Nagad", color: "border-orange-500 text-orange-400" },
                      { id: "rocket", name: "Rocket", color: "border-purple-500 text-purple-400" },
                      { id: "upay", name: "Upay", color: "border-blue-500 text-blue-400" },
                    ].map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setDepositMethod(m.id as any)}
                        className={`p-2 rounded-xl text-xs font-bold border text-center transition ${
                          depositMethod === m.id
                            ? `${m.color} bg-slate-800 shadow-md`
                            : "border-slate-800 text-slate-400 hover:bg-slate-850"
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account Details Box */}
                <div className="bg-[#141e33] border border-amber-500/20 rounded-xl p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>
                      Official {depositMethod.toUpperCase()} Personal Number:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(bdPaymentNumbers[depositMethod]);
                        setCopiedAccount(true);
                        setTimeout(() => setCopiedAccount(false), 2000);
                      }}
                      className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      {copiedAccount ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedAccount ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="text-base font-extrabold text-amber-400 tracking-wider font-mono">
                    {bdPaymentNumbers[depositMethod]}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Send Money to this number from your {depositMethod.toUpperCase()} app, then enter the Transaction ID (TrxID) below.
                  </p>
                </div>

                {/* Amount presets */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Amount (BDT):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 2000, 5000, 10000, 25000].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setDepositAmount(amt)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                          depositAmount === amt
                            ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold"
                            : "border-slate-800 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        ৳{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your {depositMethod.toUpperCase()} Number:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01XXXXXXXXX"
                    value={depositPhone}
                    onChange={(e) => setDepositPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Transaction ID (TrxID):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9J4K8L2M1N"
                    value={depositTrxId}
                    onChange={(e) => setDepositTrxId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95"
                >
                  Submit Deposit Request (৳{depositAmount.toLocaleString()} BDT)
                </button>
              </form>
            )}

            {/* WITHDRAW TAB */}
            {walletTab === "withdraw" && (
              <form onSubmit={handleWithdrawSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Withdrawal Method:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "bkash", name: "bKash" },
                      { id: "nagad", name: "Nagad" },
                      { id: "rocket", name: "Rocket" },
                    ].map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setWithdrawMethod(m.id as any)}
                        className={`p-2 rounded-xl text-xs font-bold border text-center transition ${
                          withdrawMethod === m.id
                            ? "border-amber-500 bg-slate-800 text-amber-400"
                            : "border-slate-800 text-slate-400 hover:bg-slate-850"
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your {withdrawMethod.toUpperCase()} Personal Number:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01XXXXXXXXX"
                    value={withdrawPhone}
                    onChange={(e) => setWithdrawPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Withdrawal Amount (BDT, min ৳200):
                  </label>
                  <input
                    type="number"
                    min={200}
                    max={user?.balance || 50000}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="text-[11px] text-slate-400">
                  Available for withdrawal: <span className="text-amber-400 font-bold">৳{user?.balance.toLocaleString()} BDT</span>
                </div>

                <button
                  type="submit"
                  disabled={(user?.balance || 0) < withdrawAmount}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 disabled:opacity-50 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition active:scale-95"
                >
                  Request Withdrawal (৳{withdrawAmount.toLocaleString()} BDT)
                </button>
              </form>
            )}

            {/* HISTORY TAB */}
            {walletTab === "history" && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {transactions.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No transactions found</p>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white capitalize">
                          {tx.type} ({tx.method})
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-extrabold ${
                            tx.type === "deposit" ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {tx.type === "deposit" ? "+" : "-"}৳{tx.amount} BDT
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            tx.status === "completed"
                              ? "bg-emerald-950 text-emerald-400"
                              : tx.status === "pending"
                              ? "bg-amber-950 text-amber-400"
                              : "bg-rose-950 text-rose-400"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= AUTH MODAL ======================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0f172a] border border-amber-500/30 w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-2xl relative max-h-[92dvh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setAuthError("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1 mb-4">
              <h3 className="font-extrabold text-lg sm:text-xl text-white">
                {authMode === "login" ? "Welcome Back to LuckHub BD" : "Create LuckHub BD Account"}
              </h3>
              <p className="text-xs text-slate-400">
                {authMode === "login"
                  ? "Sign in with your phone or email"
                  : "Register now and get instant ৳100 BDT welcome bonus"}
              </p>
            </div>

            {authError && (
              <div className="mb-3.5 p-2 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs text-center font-medium">
                {authError}
              </div>
            )}

            {authMode === "login" ? (
              <form onSubmit={(e) => handleLogin(e)} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email or Phone:
                  </label>
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="player@luckhub.com or 01XXXXXXXXX"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password:
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition active:scale-95"
                >
                  {authLoading ? "Logging in..." : "Log In"}
                </button>

                {/* 1-Click Test Logins */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <span className="block text-[11px] text-slate-400 text-center font-semibold">
                    1-Click Instant Demo Access:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleLogin(undefined, "player@luckhub.com", "Player@123456")}
                      className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-amber-300 py-1.5 rounded-lg text-[11px] font-bold"
                    >
                      👤 Player (৳5,000)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLogin(undefined, "admin@luckhub.com", "Admin@123456")}
                      className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-emerald-400 py-1.5 rounded-lg text-[11px] font-bold"
                    >
                      🛡️ Admin (৳999K)
                    </button>
                  </div>
                </div>

                <div className="text-center text-xs text-slate-400 pt-1">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError("");
                    }}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    Register Now (+৳100 Free)
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username:
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. shuvo_bd"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bangladeshi Mobile Phone (+880):
                  </label>
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address:
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password:
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                  🎁 <strong>Welcome Bonus:</strong> You will receive ৳100 BDT in your wallet immediately upon signing up!
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-extrabold py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition active:scale-95"
                >
                  {authLoading ? "Registering..." : "Create Account & Claim ৳100"}
                </button>

                <div className="text-center text-xs text-slate-400 pt-1">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    Log In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================= ADMIN MODAL ======================= */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0f172a] border border-amber-500/30 w-full max-w-2xl rounded-2xl p-5 sm:p-6 shadow-2xl relative max-h-[90dvh] overflow-y-auto">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white">LuckHub BD Casino Admin Dashboard</h3>
                <p className="text-xs text-slate-400">Manage Users, BDT Deposits, and Game Settings</p>
              </div>
            </div>

            {/* KPI Cards */}
            {adminStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
                <div className="bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Users</div>
                  <div className="text-base sm:text-lg font-black text-white">{adminStats.totalUsers}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Deposits</div>
                  <div className="text-base sm:text-lg font-black text-emerald-400">৳{adminStats.totalDeposits.toLocaleString()}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Bets</div>
                  <div className="text-base sm:text-lg font-black text-amber-400">{adminStats.totalBets}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-xl">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Gross Revenue</div>
                  <div className="text-base sm:text-lg font-black text-yellow-400">৳{adminStats.totalRevenue.toLocaleString()}</div>
                </div>
              </div>
            )}

            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Registered Users in Bangladesh:
            </h4>
            <div className="space-y-2">
              {adminUsers.map((u) => (
                <div
                  key={u._id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 sm:p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {u.username}
                      <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-normal">
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">{u.email} • {u.phone || "No phone"}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-amber-400">৳{u.balance.toLocaleString()} BDT</div>
                    <span className="text-[9px] text-emerald-400 uppercase font-bold">{u.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// INTERACTIVE GAME MODAL COMPONENT (Mobile-Optimized Touch Controls)
// =========================================================================
function GameModal({
  slug,
  token,
  user,
  onClose,
  onBalanceUpdate,
}: {
  slug: string;
  token: string;
  user: UserProfile;
  onClose: () => void;
  onBalanceUpdate: (newBal: number) => void;
}) {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Slots state
  const [reels, setReels] = useState(["7️⃣", "💎", "⭐"]);
  const [isSpinning, setIsSpinning] = useState(false);

  // Crash state
  const [crashMultiplier, setCrashMultiplier] = useState(1.0);
  const [crashActiveBetId, setCrashActiveBetId] = useState<string | null>(null);
  const [crashFinalPoint, setCrashFinalPoint] = useState<number | null>(null);
  const [crashState, setCrashState] = useState<"idle" | "running" | "crashed" | "cashed_out">("idle");
  const crashIntervalRef = useRef<any>(null);

  // Dice state
  const [diceTarget, setDiceTarget] = useState(50);
  const [dicePrediction, setDicePrediction] = useState<"over" | "under">("over");

  // Color prediction state
  const [colorPick, setColorPick] = useState<"red" | "green" | "violet">("red");

  // Teen Patti state
  const [playerCards, setPlayerCards] = useState<any[]>([]);
  const [dealerCards, setDealerCards] = useState<any[]>([]);

  // Jackpot state
  const [jackpotSlice, setJackpotSlice] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (crashIntervalRef.current) clearInterval(crashIntervalRef.current);
    };
  }, []);

  // 1. SLOTS SPIN
  const playSlots = async () => {
    if (user.balance < betAmount) {
      setErrorMessage("Insufficient balance. Please deposit via bKash / Nagad.");
      return;
    }
    setErrorMessage("");
    setIsSpinning(true);
    setIsPlaying(true);
    setGameResult(null);

    const flutter = setInterval(() => {
      const syms = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "7️⃣", "🔔"];
      setReels([
        syms[Math.floor(Math.random() * syms.length)],
        syms[Math.floor(Math.random() * syms.length)],
        syms[Math.floor(Math.random() * syms.length)],
      ]);
    }, 80);

    try {
      const res = await fetch(`${API_BASE}/games/slots/spin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ betAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Spin failed");

      setTimeout(() => {
        clearInterval(flutter);
        setReels(data.reels);
        setGameResult(data);
        setIsSpinning(false);
        setIsPlaying(false);
        onBalanceUpdate(data.balance);
      }, 1000);
    } catch (err: any) {
      clearInterval(flutter);
      setIsSpinning(false);
      setIsPlaying(false);
      setErrorMessage(err.message || "Failed to spin");
    }
  };

  // 2. CRASH (AVIATOR)
  const startCrash = async () => {
    if (user.balance < betAmount) {
      setErrorMessage("Insufficient balance.");
      return;
    }
    setErrorMessage("");
    setIsPlaying(true);
    setCrashState("running");
    setCrashMultiplier(1.0);
    setGameResult(null);

    try {
      const res = await fetch(`${API_BASE}/games/crash/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ betAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Crash start failed");

      setCrashActiveBetId(data.betId);
      setCrashFinalPoint(data.crashPoint);
      onBalanceUpdate(data.balance);

      const startTime = Date.now();
      const point = data.crashPoint;

      crashIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const currentM = parseFloat((1 + elapsed * 0.45 + (elapsed * elapsed) * 0.08).toFixed(2));

        if (currentM >= point) {
          clearInterval(crashIntervalRef.current);
          setCrashMultiplier(point);
          setCrashState("crashed");
          setIsPlaying(false);
          setGameResult({ isWin: false, payout: 0, crashPoint: point });
        } else {
          setCrashMultiplier(currentM);
        }
      }, 60);
    } catch (err: any) {
      setIsPlaying(false);
      setCrashState("idle");
      setErrorMessage(err.message || "Crash start failed");
    }
  };

  const cashoutCrash = async () => {
    if (!crashActiveBetId || crashState !== "running") return;
    clearInterval(crashIntervalRef.current);

    const m = crashMultiplier;
    try {
      const res = await fetch(`${API_BASE}/games/crash/cashout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ betId: crashActiveBetId, cashoutMultiplier: m }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cashout failed");

      setCrashState("cashed_out");
      setIsPlaying(false);
      setGameResult(data);
      onBalanceUpdate(data.balance);
    } catch (err: any) {
      setErrorMessage(err.message || "Cashout failed");
    }
  };

  // 3. DICE ROLL
  const playDice = async () => {
    if (user.balance < betAmount) {
      setErrorMessage("Insufficient balance.");
      return;
    }
    setErrorMessage("");
    setIsPlaying(true);
    setGameResult(null);

    try {
      const res = await fetch(`${API_BASE}/games/dice/roll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ betAmount, prediction: dicePrediction, target: diceTarget }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Dice roll failed");

      setGameResult(data);
      setIsPlaying(false);
      onBalanceUpdate(data.balance);
    } catch (err: any) {
      setIsPlaying(false);
      setErrorMessage(err.message || "Roll failed");
    }
  };

  // 4. COLOR PREDICTION
  const playColor = async () => {
    if (user.balance < betAmount) {
      setErrorMessage("Insufficient balance.");
      return;
    }
    setErrorMessage("");
    setIsPlaying(true);
    setGameResult(null);

    try {
      const res = await fetch(`${API_BASE}/games/color/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ betAmount, color: colorPick }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Color prediction failed");

      setGameResult(data);
      setIsPlaying(false);
      onBalanceUpdate(data.balance);
    } catch (err: any) {
      setIsPlaying(false);
      setErrorMessage(err.message || "Prediction failed");
    }
  };

  // 5. TEEN PATTI
  const playTeenPatti = async () => {
    if (user.balance < betAmount) {
      setErrorMessage("Insufficient balance.");
      return;
    }
    setErrorMessage("");
    setIsPlaying(true);
    setGameResult(null);

    try {
      const res = await fetch(`${API_BASE}/games/teen-patti/play`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ betAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Teen Patti round failed");

      setPlayerCards(data.playerCards || []);
      setDealerCards(data.dealerCards || []);
      setGameResult(data);
      setIsPlaying(false);
      onBalanceUpdate(data.balance);
    } catch (err: any) {
      setIsPlaying(false);
      setErrorMessage(err.message || "Round failed");
    }
  };

  // 6. RUMMY
  const playRummy = async () => {
    if (user.balance < betAmount) {
      setErrorMessage("Insufficient balance.");
      return;
    }
    setErrorMessage("");
    setIsPlaying(true);
    setGameResult(null);

    try {
      const res = await fetch(`${API_BASE}/games/rummy/play`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ betAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Rummy round failed");

      setGameResult(data);
      setIsPlaying(false);
      onBalanceUpdate(data.balance);
    } catch (err: any) {
      setIsPlaying(false);
      setErrorMessage(err.message || "Round failed");
    }
  };

  // 7. MEGA JACKPOT
  const playJackpot = async () => {
    if (user.balance < betAmount) {
      setErrorMessage("Insufficient balance.");
      return;
    }
    setErrorMessage("");
    setIsPlaying(true);
    setGameResult(null);
    setJackpotSlice("Spinning Wheel...");

    try {
      const res = await fetch(`${API_BASE}/games/jackpot/spin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ betAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Jackpot spin failed");

      setTimeout(() => {
        setJackpotSlice(data.slice);
        setGameResult(data);
        setIsPlaying(false);
        onBalanceUpdate(data.balance);
      }, 1000);
    } catch (err: any) {
      setIsPlaying(false);
      setErrorMessage(err.message || "Spin failed");
    }
  };

  const winChance =
    dicePrediction === "over" ? 100 - diceTarget : diceTarget;
  const diceMultiplier = parseFloat((98 / winChance).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#10172a] to-[#090d18] border border-amber-500/40 w-full max-w-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative text-slate-100 max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">
              {slug === "slots" && "🎰"}
              {slug === "crash" && "🚀"}
              {slug === "dice" && "🎲"}
              {slug === "color" && "🎨"}
              {slug === "teen-patti" && "🃏"}
              {slug === "rummy" && "♠️"}
              {slug === "jackpot" && "🏆"}
            </span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg capitalize text-white">
                {slug.replace("-", " ")}
              </h3>
              <p className="text-[11px] text-slate-400">
                Wallet: <span className="text-amber-400 font-bold font-mono">৳{user.balance.toLocaleString()} BDT</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-3 p-2 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold text-center">
            {errorMessage}
          </div>
        )}

        {/* ================= GAME VIEW: SLOTS ================= */}
        {slug === "slots" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-[#0b101c] border-2 border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-inner flex flex-col items-center justify-center">
              <div className="flex items-center justify-center space-x-2.5 sm:space-x-4 mb-3">
                {reels.map((symbol, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-24 sm:w-28 sm:h-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/50 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shadow-xl shadow-amber-500/10 font-bold"
                  >
                    {symbol}
                  </div>
                ))}
              </div>

              {gameResult && (
                <div
                  className={`text-center font-extrabold text-xs sm:text-sm py-1 px-3 sm:px-4 rounded-full ${
                    gameResult.isWin
                      ? "bg-emerald-950 border border-emerald-500 text-emerald-300 animate-bounce"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {gameResult.isWin
                    ? `🎉 BIG WIN! Multiplier ${gameResult.multiplier}x (+৳${gameResult.payout} BDT)`
                    : "No Win this spin. Try again!"}
                </div>
              )}
            </div>

            {/* Bet & Spin Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs text-slate-400 font-bold">Bet:</span>
                {[10, 50, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    disabled={isSpinning}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                      betAmount === amt
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              <button
                onClick={playSlots}
                disabled={isSpinning}
                className="w-full sm:w-44 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 disabled:opacity-50 text-slate-950 font-black py-3 rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/30 transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                {isSpinning ? "SPINNING..." : "SPIN 🎰"}
              </button>
            </div>
          </div>
        )}

        {/* ================= GAME VIEW: CRASH (AVIATOR) ================= */}
        {slug === "crash" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="h-56 sm:h-64 bg-[#0a0f1d] border border-slate-800 rounded-2xl p-4 relative flex flex-col items-center justify-center overflow-hidden">
              <div className="text-center space-y-1.5 z-10">
                <div
                  className={`text-5xl sm:text-6xl font-black font-mono tracking-tight transition ${
                    crashState === "crashed"
                      ? "text-rose-500"
                      : crashState === "cashed_out"
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {crashMultiplier.toFixed(2)}x
                </div>

                <div className="text-xs font-semibold">
                  {crashState === "idle" && (
                    <span className="text-slate-400">Place bet and launch rocket</span>
                  )}
                  {crashState === "running" && (
                    <span className="text-amber-300 animate-pulse">
                      🚀 Rocket is flying! Cash out before it crashes!
                    </span>
                  )}
                  {crashState === "crashed" && (
                    <span className="text-rose-400 font-bold">
                      💥 CRASHED @ {crashMultiplier.toFixed(2)}x!
                    </span>
                  )}
                  {crashState === "cashed_out" && (
                    <span className="text-emerald-400 font-bold">
                      🎉 Cashed out @ {crashMultiplier.toFixed(2)}x! Won ৳{gameResult?.payout} BDT!
                    </span>
                  )}
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-rose-500/10 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs text-slate-400 font-bold">Bet:</span>
                {[10, 50, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    disabled={crashState === "running"}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                      betAmount === amt
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              {crashState === "running" ? (
                <button
                  onClick={cashoutCrash}
                  className="w-full sm:w-56 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black py-3 rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-500/30 transition active:scale-95 animate-pulse"
                >
                  CASH OUT (৳{Math.round(betAmount * crashMultiplier)} BDT)
                </button>
              ) : (
                <button
                  onClick={startCrash}
                  className="w-full sm:w-48 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 text-white font-black py-3 rounded-2xl text-xs sm:text-sm shadow-xl shadow-rose-500/30 transition active:scale-95"
                >
                  LAUNCH ROCKET 🚀
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= GAME VIEW: DICE ================= */}
        {slug === "dice" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center space-y-3">
              <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono">
                {gameResult ? gameResult.roll : diceTarget}
              </div>

              {gameResult && (
                <div
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    gameResult.isWin
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-500"
                      : "bg-rose-950 text-rose-400 border border-rose-800"
                  }`}
                >
                  {gameResult.isWin ? `🎉 WINNER! Payout: ৳${gameResult.payout} BDT` : "❌ Loss. Try again!"}
                </div>
              )}

              <div className="w-full max-w-md space-y-2">
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={diceTarget}
                  onChange={(e) => setDiceTarget(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Target: {diceTarget}</span>
                  <span>Win Chance: {winChance}%</span>
                  <span>Multiplier: {diceMultiplier}x</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setDicePrediction("over")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    dicePrediction === "over"
                      ? "bg-emerald-500 text-slate-950 border-emerald-400"
                      : "border-slate-800 text-slate-400"
                  }`}
                >
                  Roll Over &gt; {diceTarget}
                </button>
                <button
                  onClick={() => setDicePrediction("under")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    dicePrediction === "under"
                      ? "bg-emerald-500 text-slate-950 border-emerald-400"
                      : "border-slate-800 text-slate-400"
                  }`}
                >
                  Roll Under &lt; {diceTarget}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs text-slate-400 font-bold">Bet:</span>
                {[10, 50, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                      betAmount === amt
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              <button
                onClick={playDice}
                disabled={isPlaying}
                className="w-full sm:w-48 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black py-3 rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/30 transition active:scale-95"
              >
                ROLL DICE 🎲
              </button>
            </div>
          </div>
        )}

        {/* ================= GAME VIEW: COLOR PREDICTION ================= */}
        {slug === "color" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center space-y-3">
              <div className="text-xs text-slate-400">Choose your lucky color for the next round:</div>

              <div className="flex space-x-3">
                {[
                  { id: "red", name: "Red (2x)", bg: "bg-rose-600 hover:bg-rose-500" },
                  { id: "violet", name: "Violet (9x)", bg: "bg-purple-600 hover:bg-purple-500" },
                  { id: "green", name: "Green (2x)", bg: "bg-emerald-600 hover:bg-emerald-500" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColorPick(c.id as any)}
                    className={`px-4 sm:px-6 py-3 sm:py-4 rounded-2xl text-xs font-black text-white border-2 transition ${c.bg} ${
                      colorPick === c.id
                        ? "border-amber-400 scale-105 shadow-xl shadow-amber-500/20"
                        : "border-transparent opacity-85"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {gameResult && (
                <div className="text-center space-y-1">
                  <div className="text-xs text-slate-400">
                    Result: <span className="font-extrabold uppercase text-white">{gameResult.result}</span>
                  </div>
                  <div
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      gameResult.isWin
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500"
                        : "bg-rose-950 text-rose-400 border border-rose-800"
                    }`}
                  >
                    {gameResult.isWin ? `🎉 WINNER! Payout: ৳${gameResult.payout} BDT` : "❌ Loss. Try again!"}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs text-slate-400 font-bold">Bet:</span>
                {[10, 50, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                      betAmount === amt
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              <button
                onClick={playColor}
                disabled={isPlaying}
                className="w-full sm:w-48 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black py-3 rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/30 transition active:scale-95"
              >
                PREDICT COLOR 🎨
              </button>
            </div>
          </div>
        )}

        {/* ================= GAME VIEW: TEEN PATTI ================= */}
        {slug === "teen-patti" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400">Dealer&apos;s Cards:</span>
                <div className="flex space-x-2 mt-1">
                  {(dealerCards.length > 0 ? dealerCards : [{}, {}, {}]).map((c, i) => (
                    <div
                      key={i}
                      className="w-14 h-20 sm:w-16 sm:h-22 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center text-sm font-black shadow"
                    >
                      {c.rank ? `${c.rank}${c.suit}` : "🂠"}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-amber-400">Your Cards:</span>
                <div className="flex space-x-2 mt-1">
                  {(playerCards.length > 0 ? playerCards : [{}, {}, {}]).map((c, i) => (
                    <div
                      key={i}
                      className="w-14 h-20 sm:w-16 sm:h-22 bg-white text-slate-950 border-2 border-amber-500 rounded-xl flex items-center justify-center text-base font-black shadow-lg"
                    >
                      {c.rank ? `${c.rank}${c.suit}` : "🂠"}
                    </div>
                  ))}
                </div>
              </div>

              {gameResult && (
                <div
                  className={`text-center text-xs font-bold py-2 rounded-xl ${
                    gameResult.isWin
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-500"
                      : "bg-rose-950 text-rose-400 border border-rose-800"
                  }`}
                >
                  {gameResult.isWin ? `🎉 YOU WON! Payout: ৳${gameResult.payout} BDT` : "Dealer wins this hand. Try again!"}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs text-slate-400 font-bold">Bet:</span>
                {[20, 50, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                      betAmount === amt
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              <button
                onClick={playTeenPatti}
                disabled={isPlaying}
                className="w-full sm:w-48 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black py-3 rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/30 transition active:scale-95"
              >
                DEAL CARDS 🃏
              </button>
            </div>
          </div>
        )}

        {/* ================= GAME VIEW: RUMMY ================= */}
        {slug === "rummy" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-4 sm:p-6 text-center space-y-3">
              <div className="text-4xl sm:text-5xl">♠️ ♥️ ♦️ ♣️</div>
              <h4 className="text-sm sm:text-base font-bold text-white">Classic Fast Rummy Showdown</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Win 2.0x your BDT bet on matching valid set sequences against the table dealer.
              </p>

              {gameResult && (
                <div
                  className={`text-center text-xs font-bold py-2 rounded-xl ${
                    gameResult.isWin
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-500"
                      : "bg-rose-950 text-rose-400 border border-rose-800"
                  }`}
                >
                  {gameResult.isWin ? `🎉 RUMMY WIN! Payout: ৳${gameResult.payout} BDT` : "Dealer had the better hand. Try again!"}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs text-slate-400 font-bold">Bet:</span>
                {[20, 50, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                      betAmount === amt
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              <button
                onClick={playRummy}
                disabled={isPlaying}
                className="w-full sm:w-48 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black py-3 rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/30 transition active:scale-95"
              >
                PLAY RUMMY ♠️
              </button>
            </div>
          </div>
        )}

        {/* ================= GAME VIEW: MEGA JACKPOT ================= */}
        {slug === "jackpot" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-[#0b101c] border-2 border-amber-500/40 rounded-2xl p-4 sm:p-6 text-center space-y-3">
              <div className="text-5xl sm:text-6xl animate-pulse">🏆</div>
              <div className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                ৳500,000 BDT PROGRESSIVE POOL
              </div>

              <div className="text-base sm:text-lg font-bold text-white bg-slate-900 border border-slate-800 py-2.5 sm:py-3 rounded-xl max-w-sm mx-auto">
                {jackpotSlice || "Spin for the 200x Grand Prize!"}
              </div>

              {gameResult && (
                <div
                  className={`text-center text-xs font-bold py-2 rounded-xl ${
                    gameResult.isWin
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-500"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {gameResult.isWin ? `🎉 JACKPOT WIN! Payout: ৳${gameResult.payout} BDT` : "Better luck on the next spin!"}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs text-slate-400 font-bold">Bet:</span>
                {[50, 100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                      betAmount === amt
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>

              <button
                onClick={playJackpot}
                disabled={isPlaying}
                className="w-full sm:w-52 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 text-slate-950 font-black py-3 rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/30 transition active:scale-95"
              >
                SPIN JACKPOT 🏆
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
