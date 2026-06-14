export const OG_BADGE_QUESTION =
  "What are you supposed to yell when turning off of Cty Rd 5?";

export const PENDING_BADGE_ANSWER_KEY = "pendingBadgeAnswer";

export function savePendingBadgeAnswer(answer: string) {
  if (answer.trim()) {
    localStorage.setItem(PENDING_BADGE_ANSWER_KEY, answer.trim());
  } else {
    localStorage.removeItem(PENDING_BADGE_ANSWER_KEY);
  }
}
