export const QUOTES: string[] = [
  "Small quests add up to big adventures.",
  "You don't need to feel motivated to start — starting is what makes the motivation show up.",
  "One checked box today beats ten planned for someday.",
  "Progress is quiet. Show up anyway.",
  "The board doesn't care how you feel about it. Add one quest and begin.",
  "Discipline is just motivation that decided to stick around.",
  "You're not behind. You're just mid-quest.",
  "Today only needs one win. Go get it.",
  "Future you is built entirely out of what today-you decides to finish.",
  "Streaks aren't about perfection — they're about showing up again.",
  "Done is a direction, not a destination.",
  "The hardest part of any quest is opening the board. You just did that.",
  "Momentum is built one small, unremarkable task at a time.",
  "You don't have to see the whole staircase, just the next step.",
  "A tired mind still finishes small quests. Start with one.",
  "Nobody remembers the easy days. They remember the ones you showed up for anyway.",
  "Every expert was once staring at an empty todo list too.",
  "Consistency beats intensity — log the small stuff.",
  "Rest is part of the quest, not a break from it.",
  "The version of you that finishes this is closer than you think.",
  "Great days are just ordinary days with one thing actually done.",
  "You're allowed to move slowly. Just keep moving.",
  "Clarity comes from doing, not from waiting to feel ready.",
  "Today's quest log is proof you're still in the game.",
  "One percent better, repeated, becomes unrecognizable progress.",
  "The board resets every day. So can your energy.",
  "Nothing on this list is too small to count.",
  "You've survived every hard day so far. That's a perfect record.",
  "Direction matters more than speed.",
  "Show up for the boring parts — they're where the streak lives.",
  "A quest half-finished is still further than a quest never started.",
  "Your only competition is the version of you from yesterday.",
  "It's okay to add a quest just for you today.",
  "Small, steady, and unglamorous wins the long game.",
  "The next quest is easier once the first one is checked off.",
  "You don't need permission to start over today.",
  "Effort compounds quietly until one day it doesn't.",
  "The goal isn't a perfect streak — it's a life you keep choosing.",
  "Today is a fresh page, not a continuation of a bad one.",
  "Whatever you finish today was worth doing.",
];

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  return Math.floor(diff / 86400000);
}

/** Deterministic "quote of the day" — same for everyone on a given calendar day (UTC), rotates daily. */
export function getQuoteOfDay(date: Date = new Date()): string {
  const idx = dayOfYear(date) % QUOTES.length;
  return QUOTES[idx];
}
