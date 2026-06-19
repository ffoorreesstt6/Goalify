export interface ChallengeTemplate {
  key: string;
  title: string;
  description: string;
  emoji: string;
  xp: number;
  durationDays: number;
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    key: "save_100",
    title: "Save €100 Challenge",
    description: "Put aside €100 over the next two weeks.",
    emoji: "💰",
    xp: 100,
    durationDays: 14,
  },
  {
    key: "no_delivery_week",
    title: "No Delivery Week",
    description: "No food delivery for 7 days. Cook instead!",
    emoji: "🍳",
    xp: 60,
    durationDays: 7,
  },
  {
    key: "no_coffee_week",
    title: "No Coffee Week",
    description: "Skip the café for a week and brew at home.",
    emoji: "☕",
    xp: 50,
    durationDays: 7,
  },
  {
    key: "no_impulse",
    title: "No Impulse-Buy Challenge",
    description: "No non-essential purchases for 10 days.",
    emoji: "🛑",
    xp: 80,
    durationDays: 10,
  },
];

export interface Badge {
  key: string;
  name: string;
  emoji: string;
  description: string;
}

export const BADGES: Badge[] = [
  { key: "first_goal", name: "Goal Setter", emoji: "🎯", description: "Created your first goal" },
  { key: "first_save", name: "First Save", emoji: "🌱", description: "Logged your first contribution" },
  { key: "streak_7", name: "On Fire", emoji: "🔥", description: "7-day logging streak" },
  { key: "challenge_done", name: "Challenger", emoji: "🏆", description: "Completed a challenge" },
  { key: "saver_500", name: "Big Saver", emoji: "💎", description: "Saved €500 total" },
  { key: "level_5", name: "Rising Star", emoji: "⭐", description: "Reached level 5" },
];
