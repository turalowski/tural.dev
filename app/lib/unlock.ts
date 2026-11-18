import { cookies } from "next/headers";

export const UNLOCK_COOKIE = "hidden_posts";
export const UNLOCK_CODE = "i-am-hidden-posts";

export function isUnlocked(): boolean {
  return cookies().get(UNLOCK_COOKIE)?.value === UNLOCK_CODE;
}
