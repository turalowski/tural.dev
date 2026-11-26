"use client";

import { useEffect, useState } from "react";

// Seasonal art for the empty side gutters on wide screens: a tree on the left,
// a New Year countdown with a firework on the right. Shown from Nov 20 to
// Jan 15 only; outside that window it renders nothing.

const TREE = [
  "          *",
  "         /o\\",
  "        /.*.\\",
  "       /o.~.o\\",
  "      /*.o.*.~\\",
  "     /.~.*.o.*.\\",
  "    /o.*.~.o.~.*\\",
  "   /.~.o.*.~.o.~.\\",
  "         |_|",
];

const FIREWORK = [
  "    .  '  .",
  "  '  \\ | /  '",
  " --  - * -  --",
  "  .  / | \\  .",
  "    '  .  '",
];

const BOX_INNER = 15; // odd, so text has a true centre column

function center(text: string, width = BOX_INNER) {
  const left = Math.floor((width - text.length) / 2);
  return " ".repeat(left) + text + " ".repeat(width - text.length - left);
}

function countdownArt(lines: string[]) {
  const mid = Math.floor(BOX_INNER / 2) + 1; // column of the box's centre
  return [
    `╭${"─".repeat(BOX_INNER)}╮`,
    ...lines.map((line) => `│${center(line)}│`),
    `╰${"─".repeat(mid - 1)}┬${"─".repeat(BOX_INNER - mid)}╯`,
    `${" ".repeat(mid)}│`,
    `${" ".repeat(mid)}▼`,
    ...FIREWORK.map((line) => " ".repeat(mid - 7) + line),
  ];
}

const ORNAMENT_COLORS: Record<string, string> = {
  o: "text-red-500",
  "*": "text-amber-500",
  "~": "text-brand",
};

// Colours ornaments and makes them twinkle; staggered so they don't blink in sync.
function Art({ lines, twinkle }: { lines: string[]; twinkle: string }) {
  let n = 0;
  return (
    <pre className="new-year-art">
      {lines.map((line, row) => (
        <div key={row}>
          {Array.from(line).map((ch, col) =>
            twinkle.includes(ch) && ORNAMENT_COLORS[ch] ? (
              <span
                key={col}
                className={`new-year-twinkle ${ORNAMENT_COLORS[ch]}`}
                style={{ animationDelay: `${(n++ * 0.37) % 2.4}s` }}
              >
                {ch}
              </span>
            ) : (
              ch
            ),
          )}
        </div>
      ))}
    </pre>
  );
}

function seasonState(now: Date) {
  const month = now.getMonth();
  const day = now.getDate();
  const inSeason = (month === 10 && day >= 20) || month === 11 || (month === 0 && day <= 15);
  if (!inSeason) return null;

  if (month === 0) {
    return { lines: ["Happy", "New Year", String(now.getFullYear())] };
  }
  const year = now.getFullYear() + 1;
  const midnight = new Date(year, 0, 1).getTime();
  const days = Math.ceil((midnight - now.getTime()) / 86_400_000);
  return {
    lines: [String(year), days === 1 ? "in 1 day" : `in ${days} days`],
  };
}

export default function NewYearSides() {
  const [state, setState] = useState<ReturnType<typeof seasonState>>(null);

  // Decided on the client so statically built pages still follow today's date.
  useEffect(() => setState(seasonState(new Date())), []);

  if (!state) return null;

  // Each side column spans the gutter next to the 50rem content column and the
  // full height of the content, so the art is centred against the content and
  // (being sticky) stays on screen while a long article scrolls.
  return (
    <div aria-hidden="true">
      <div className="new-year-side left-0">
        <div className="new-year-sticky">
          <Art lines={TREE} twinkle="o*~" />
        </div>
      </div>
      <div className="new-year-side right-0">
        <div className="new-year-sticky">
          <Art lines={countdownArt(state.lines)} twinkle="*" />
        </div>
      </div>
    </div>
  );
}
