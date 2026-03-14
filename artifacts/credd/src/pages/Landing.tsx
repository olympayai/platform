import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Wallet,
  ShieldCheck,
  Eye,
  FileText,
  ArrowRight,
  Check,
  ChevronRight,
  Activity,
  Menu,
  X,
} from "lucide-react";

const NAV_LINKS = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Integration", href: "#integration" },
];

const STEPS = [
  {
    n: "01",
    title: "Set your rules",
    desc: "Define what your agent can spend on, where, how much, and how often. Merchant allowlists, spend limits, time windows — all configurable.",
  },
  {
    n: "02",
    title: "Agent requests access",
    desc: "Before any transaction, your agent declares what it needs to buy or get paid for. Intent is recorded and attached to the request.",
  },
  {
    n: "03",
    title: "Credd checks and issues",
    desc: "If the request passes your rules, a card or account is issued and locked to that exact transaction. ALLOW, DENY, or escalate to REVIEW.",
  },
  {
    n: "04",
    title: "Agent completes the transaction",
    desc: "Your agent uses the issued card or account to complete the purchase or receive the payment — within the locked constraints.",
  },
  {
    n: "05",
    title: "Automatic verification",
    desc: "Every transaction is checked against the original request. Anything that doesn't match gets flagged and routed for human approval.",
  },
];

const FEATURES = [
  {
    n: "01",
    icon: CreditCard,
    title: "Cards and Accounts That Match the Job",
    desc: "Single-use cards for one-time purchases. Multi-use cards with velocity limits, active hours, and merchant locks. Virtual accounts for agents that receive payments. All issued instantly.",
  },
  {
    n: "02",
    icon: ShieldCheck,
    title: "Spend Policies That Stick",
    desc: "Set what each agent can buy or receive, where, and how much. Agents declare intent before every transaction. Violations freeze the card immediately.",
  },
  {
    n: "03",
    icon: Eye,
    title: "Live Transaction View",
    desc: "See every authorization and settlement as it happens. Full audit trail per transaction. Pull compliance reports any time.",
  },
  {
    n: "04",
    icon: FileText,
    title: "Built-in Audit Evidence",
    desc: "Every transaction comes with intent attestation and a full decision trail. If a charge gets questioned, you already have the proof.",
  },
];

const USE_CASES = [
  { n: "01", title: "Procurement Agents", category: "Buying & Purchasing" },
  { n: "02", title: "E-commerce Purchasing Agents", category: "Shopping & Procurement" },
  { n: "03", title: "SaaS Subscription Management", category: "Recurring Payments" },
  { n: "04", title: "Travel & Booking Automation", category: "Flights, Hotels, Rentals" },
  { n: "05", title: "Contractor & Freelancer Payments", category: "Paying People" },
];

const INTEGRATION_STEPS = [
  {
    n: "Step 01",
    title: "Create your account",
    items: ["Register and set up your workspace", "Get your API credentials"],
  },
  {
    n: "Step 02",
    title: "Set your policies",
    items: ["Define spending limits and merchant rules", "Fund your account and issue your first card"],
  },
  {
    n: "Step 03",
    title: "Start spending",
    items: ["Agents start transacting autonomously", "Monitor every purchase in real-time"],
  },
];

function Ticker() {
  const items = [
    "SPEND_LIMITS:CONFIGURABLE",
    "MERCHANT_RULES:ACTIVE",
    "APPROVAL:REQUIRED",
    "CHECKS:REALTIME",
    "CARD_OR_ACCOUNT:ISSUED",
    "ISSUANCE:INSTANT",
    "MERCHANT:VERIFIED",
    "SPEND_LIMIT:ENFORCED",
    "VERIFIED:AUTOMATIC",
    "MISMATCHES:NONE",
  ];
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-t border-b border-white/10 py-3 bg-white/[0.02]">
      <div className="flex animate-[ticker_30s_linear_infinite] whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center mx-6 text-[11px] font-mono tracking-widest text-white/40">
            {item}
            <span className="mx-6 text-white/10">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function VirtualCard() {
  return (
    <div className="relative w-[320px] select-none">
      <div className="rounded-2xl bg-white text-black p-6 shadow-2xl border border-black/10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <span className="font-bold text-sm tracking-tight">Credd AI</span>
          </div>
          <span className="text-[10px] font-mono bg-black text-white rounded px-2 py-0.5">VIRTUAL</span>
        </div>
        <div className="font-mono text-lg tracking-[0.2em] mb-6 text-black/80">
          •••• •••• •••• 4242
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-black/40 mb-0.5">Agent</p>
            <p className="font-mono text-sm font-bold">procurement-bot</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-black/40 mb-0.5">Limit</p>
            <p className="font-mono text-sm font-bold">$500.00</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-black/40 mb-0.5">Status</p>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-black"></div>
              <p className="font-mono text-sm font-bold">ACTIVE</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -bottom-4 -right-4 bg-black text-white rounded-xl px-4 py-2.5 shadow-xl border border-white/10 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
          <span>ALLOW — $24.99</span>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/90 backdrop-blur-md border-b border-white/10" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-white" />
            <span className="font-bold text-white tracking-tight">Credd AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <button
                key={l.label}
                onClick={() => scrollTo(l.href)}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-all"
            >
              Get Started Free
            </button>
          </div>

          <button className="md:hidden text-white/60 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-black border-b border-white/10 px-6 pb-4 space-y-2">
            {NAV_LINKS.map((l) => (
              <button
                key={l.label}
                onClick={() => scrollTo(l.href)}
                className="block w-full text-left text-sm text-white/60 hover:text-white py-2"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg mt-2"
            >
              Get Started Free
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-28 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-white/15 rounded-full px-3 py-1 text-[11px] text-white/50 font-mono mb-8">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></div>
              FINANCIAL OS FOR AUTONOMOUS AGENTS
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-6">
              Give your AI agent its own card and bank account.
            </h1>
            <p className="text-lg text-white/50 leading-relaxed mb-10 max-w-lg">
              Set spend limits, lock them to the right merchants, and watch every transaction in real time. No risk to your own accounts.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-white text-black font-semibold px-6 py-3 rounded-lg hover:bg-white/90 transition-all flex items-center gap-2"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollTo("#how-it-works")}
                className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1.5"
              >
                How it works <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="animate-float">
              <VirtualCard />
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <Ticker />

      {/* How it Works */}
      <section id="how-it-works" className="py-28 px-6 max-w-6xl mx-auto">
        <div className="mb-16">
          <p className="text-[11px] font-mono tracking-widest text-white/30 mb-4">HOW IT WORKS</p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight max-w-xl">
            Built for agents that spend and get paid.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className={`bg-black p-8 hover:bg-white/[0.03] transition-colors ${
                i === STEPS.length - 1 && STEPS.length % 3 !== 0 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <p className="text-[11px] font-mono text-white/25 mb-5 tracking-widest">Step {step.n}</p>
              <h3 className="text-base font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 px-6 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="mb-16">
          <p className="text-[11px] font-mono tracking-widest text-white/30 mb-4">FEATURES</p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight max-w-xl">
            Everything you need to trust your agents with real money.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.n}
              className="border border-white/[0.08] rounded-2xl p-8 hover:border-white/20 hover:bg-white/[0.02] transition-all group"
            >
              <div className="flex items-start gap-5">
                <div>
                  <p className="text-[10px] font-mono text-white/20 mb-4 tracking-widest">{f.n}</p>
                  <div className="p-2.5 border border-white/10 rounded-lg w-fit mb-5 group-hover:border-white/25 transition-colors">
                    <f.icon className="h-5 w-5 text-white/60" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-3">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-28 px-6 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="mb-16">
          <p className="text-[11px] font-mono tracking-widest text-white/30 mb-4">USE CASES</p>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Agents in production.</h2>
        </div>

        <div className="space-y-px border border-white/[0.06] rounded-2xl overflow-hidden">
          {USE_CASES.map((uc) => (
            <div
              key={uc.n}
              className="flex items-center justify-between bg-black hover:bg-white/[0.03] transition-colors px-8 py-6 group cursor-pointer border-b border-white/[0.04] last:border-0"
            >
              <div className="flex items-center gap-8">
                <span className="text-[11px] font-mono text-white/20 w-6">{uc.n}</span>
                <div>
                  <p className="font-semibold text-white group-hover:text-white/80 transition-colors">{uc.title}</p>
                  <p className="text-sm text-white/35 mt-0.5">{uc.category}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </section>

      {/* Integration */}
      <section id="integration" className="py-28 px-6 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="mb-5">
          <p className="text-[11px] font-mono tracking-widest text-white/30 mb-4">INTEGRATION</p>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-mono text-white/20 bg-white/[0.05] border border-white/10 rounded px-2 py-0.5">SETUP</span>
            <ArrowRight className="h-3 w-3 text-white/20" />
            <span className="text-[10px] font-mono text-white/20 bg-white/[0.05] border border-white/10 rounded px-2 py-0.5">LIVE</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Go live in minutes.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {INTEGRATION_STEPS.map((step) => (
            <div key={step.n} className="border border-white/[0.08] rounded-2xl p-7">
              <p className="text-[10px] font-mono text-white/20 tracking-widest mb-5">{step.n}</p>
              <h3 className="text-base font-semibold text-white mb-5">{step.title}</h3>
              <ul className="space-y-2.5">
                {step.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/40">
                    <span className="text-white/20 mt-0.5">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-5">
            Ready to get started?
          </h2>
          <p className="text-white/40 text-lg mb-10">Up and running in minutes.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white text-black font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/90 transition-all inline-flex items-center gap-2"
          >
            Open Dashboard <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-white/60" />
            <span className="font-bold text-sm text-white/60">Credd AI</span>
          </div>
          <p className="text-xs text-white/25 font-mono text-center">
            The financial OS for AI agents. All transaction policies enforced at the platform level.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Docs"].map((l) => (
              <button key={l} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
