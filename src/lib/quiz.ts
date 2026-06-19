export type PersonalityId =
  | "saver"
  | "goal_chaser"
  | "student_budgeter"
  | "lifestyle_spender"
  | "impulse_buyer"
  | "future_investor";

export interface Personality {
  id: PersonalityId;
  name: string;
  emoji: string;
  description: string;
  strengths: string[];
  watchouts: string[];
  recommendations: string[];
}

export const PERSONALITIES: Record<PersonalityId, Personality> = {
  saver: {
    id: "saver",
    name: "The Saver",
    emoji: "🛡️",
    description:
      "You're disciplined and security-focused. Money in the bank gives you peace of mind.",
    strengths: ["Consistent saving", "Low impulse spending", "Emergency-ready"],
    watchouts: ["May under-invest", "Can be overly cautious"],
    recommendations: [
      "Put idle cash to work with a future-investor mindset",
      "Set a stretch goal beyond your emergency fund",
      "Automate a small recurring investment",
    ],
  },
  goal_chaser: {
    id: "goal_chaser",
    name: "The Goal Chaser",
    emoji: "🎯",
    description: "You thrive on targets. A clear goal keeps you motivated and consistent.",
    strengths: ["Goal-driven", "Motivated by progress", "Plans ahead"],
    watchouts: ["May juggle too many goals", "Risk of burnout"],
    recommendations: [
      "Focus on your top 2 goals for momentum",
      "Use streaks to stay consistent",
      "Celebrate milestones to avoid fatigue",
    ],
  },
  student_budgeter: {
    id: "student_budgeter",
    name: "The Student Budgeter",
    emoji: "🎓",
    description: "Making the most of a tight budget. Every euro counts and you know it.",
    strengths: ["Resourceful", "Budget-aware", "Adaptable"],
    watchouts: ["Irregular income", "Limited buffer"],
    recommendations: [
      "Verify your student status to unlock Pro for free",
      "Build a small €100 emergency buffer first",
      "Track subscriptions — they add up fast",
    ],
  },
  lifestyle_spender: {
    id: "lifestyle_spender",
    name: "The Lifestyle Spender",
    emoji: "✨",
    description: "You value experiences and quality. You spend on what makes life good.",
    strengths: ["Enjoys life", "Values experiences", "Generous"],
    watchouts: ["High discretionary spend", "Thin savings rate"],
    recommendations: [
      "Set a 'fun budget' so you can spend guilt-free",
      "Automate savings before spending",
      "Try a no-delivery week challenge",
    ],
  },
  impulse_buyer: {
    id: "impulse_buyer",
    name: "The Impulse Buyer",
    emoji: "⚡",
    description: "You buy in the moment. Spontaneity is fun but it can sting later.",
    strengths: ["Decisive", "Spontaneous", "Open to new things"],
    watchouts: ["Frequent small purchases", "Buyer's remorse"],
    recommendations: [
      "Use a 24-hour rule before non-essentials",
      "Try the no-impulse-buy challenge",
      "Turn on budget alerts",
    ],
  },
  future_investor: {
    id: "future_investor",
    name: "The Future Investor",
    emoji: "📈",
    description: "You think long-term. Growing wealth over time is your game.",
    strengths: ["Long-term thinking", "Comfortable with growth", "Patient"],
    watchouts: ["May neglect short-term liquidity", "Overconfidence"],
    recommendations: [
      "Keep 3 months of expenses liquid",
      "Use the Future Simulator to model growth",
      "Diversify your goals across time horizons",
    ],
  },
};

export interface QuizOption {
  label: string;
  value: string;
  scores: Partial<Record<PersonalityId, number>>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  subtitle?: string;
  options: QuizOption[];
}

export const QUIZ: QuizQuestion[] = [
  {
    id: "spending_habits",
    question: "How would you describe your spending?",
    options: [
      { label: "I plan every purchase", value: "planned", scores: { saver: 3, goal_chaser: 1 } },
      { label: "Mostly planned, some treats", value: "balanced", scores: { goal_chaser: 2, lifestyle_spender: 1 } },
      { label: "I spend on what I enjoy", value: "lifestyle", scores: { lifestyle_spender: 3 } },
      { label: "I buy on impulse a lot", value: "impulse", scores: { impulse_buyer: 3 } },
    ],
  },
  {
    id: "income_range",
    question: "What's your monthly income range?",
    options: [
      { label: "Under €500", value: "lt500", scores: { student_budgeter: 3 } },
      { label: "€500 – €1,500", value: "500_1500", scores: { student_budgeter: 1, saver: 1 } },
      { label: "€1,500 – €3,000", value: "1500_3000", scores: { goal_chaser: 1, future_investor: 1 } },
      { label: "€3,000+", value: "gt3000", scores: { future_investor: 2, lifestyle_spender: 1 } },
    ],
  },
  {
    id: "savings_habits",
    question: "How much of your income do you save?",
    options: [
      { label: "20%+ every month", value: "high", scores: { saver: 3, future_investor: 2 } },
      { label: "Around 10%", value: "mid", scores: { saver: 1, goal_chaser: 1 } },
      { label: "Whatever's left over", value: "low", scores: { lifestyle_spender: 2 } },
      { label: "I struggle to save", value: "none", scores: { impulse_buyer: 2, student_budgeter: 1 } },
    ],
  },
  {
    id: "financial_goals",
    question: "What's your main financial goal right now?",
    options: [
      { label: "Build an emergency fund", value: "emergency", scores: { saver: 2 } },
      { label: "Save for a big purchase", value: "purchase", scores: { goal_chaser: 3 } },
      { label: "Invest and grow wealth", value: "invest", scores: { future_investor: 3 } },
      { label: "Just stop overspending", value: "control", scores: { impulse_buyer: 2 } },
    ],
  },
  {
    id: "student_status",
    question: "Are you currently a student?",
    options: [
      { label: "Yes, full-time", value: "fulltime", scores: { student_budgeter: 3 } },
      { label: "Yes, part-time", value: "parttime", scores: { student_budgeter: 2 } },
      { label: "No", value: "no", scores: {} },
    ],
  },
  {
    id: "spending_categories",
    question: "Where does most of your money go?",
    options: [
      { label: "Essentials (rent, bills, food)", value: "essentials", scores: { saver: 1, student_budgeter: 1 } },
      { label: "Dining out & delivery", value: "dining", scores: { lifestyle_spender: 2, impulse_buyer: 1 } },
      { label: "Shopping & gadgets", value: "shopping", scores: { impulse_buyer: 2 } },
      { label: "Saving & investing", value: "saving", scores: { future_investor: 3 } },
    ],
  },
];

export function computePersonality(answers: Record<string, string>): PersonalityId {
  const totals: Record<PersonalityId, number> = {
    saver: 0,
    goal_chaser: 0,
    student_budgeter: 0,
    lifestyle_spender: 0,
    impulse_buyer: 0,
    future_investor: 0,
  };
  for (const q of QUIZ) {
    const value = answers[q.id];
    const option = q.options.find((o) => o.value === value);
    if (!option) continue;
    for (const [pid, score] of Object.entries(option.scores)) {
      totals[pid as PersonalityId] += score ?? 0;
    }
  }
  let best: PersonalityId = "goal_chaser";
  let bestScore = -1;
  for (const [pid, score] of Object.entries(totals)) {
    if (score > bestScore) {
      bestScore = score;
      best = pid as PersonalityId;
    }
  }
  return best;
}

export function isStudent(answers: Record<string, string>): boolean {
  return answers["student_status"] === "fulltime" || answers["student_status"] === "parttime";
}
