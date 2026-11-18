import { cookies } from "next/headers";

export const UNLOCK_COOKIE = "hidden_posts";

export function isUnlocked(): boolean {
  return cookies().get(UNLOCK_COOKIE)?.value === "1";
}
