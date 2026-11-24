"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

// Display order and plural labels for the chips; unknown types go last.
const TYPE_LABELS: Record<string, string> = {
  Noun: "Nouns",
  Verb: "Verbs",
  Adjective: "Adjectives",
  Adverb: "Adverbs",
  Pronoun: "Pronouns",
  Preposition: "Prepositions",
  Connector: "Connectors",
  Determiner: "Determiners",
  Number: "Numbers",
  Other: "Phrases & other",
};

interface TableFilterProps {
  // Header text of the column whose values become filter chips.
  column: string;
  // 0-based column to hide visually; -1 or undefined keeps every column.
  hiddenColumnIndex?: number;
  children: ReactNode;
}

/**
 * Wraps a markdown table and adds filter chips built from one column.
 * Rows are hidden in the DOM instead of re-rendered, so 2,000 rows stay fast.
 */
export default function TableFilter({
  column,
  hiddenColumnIndex = -1,
  children,
}: TableFilterProps) {
  const scope = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  // Read each row's value once from the rendered table.
  useEffect(() => {
    const table = wrapperRef.current?.querySelector("table");
    if (!table) return;
    const headers = Array.from(table.querySelectorAll("thead th"));
    const index = headers.findIndex(
      (th) => th.textContent?.trim().toLowerCase() === column.toLowerCase(),
    );
    if (index === -1) return;
    const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tbody tr"));
    rows.forEach((row) => {
      row.dataset.filterValue = row.cells[index]?.textContent?.trim() ?? "";
    });
    setValues(rows.map((row) => row.dataset.filterValue ?? ""));
  }, [column]);

  useEffect(() => {
    const rows = wrapperRef.current?.querySelectorAll<HTMLTableRowElement>("tbody tr");
    rows?.forEach((row) => {
      row.hidden = selected !== null && row.dataset.filterValue !== selected;
    });
  }, [selected, values]);

  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
    const order = Object.keys(TYPE_LABELS);
    return Array.from(counts.entries()).sort(([a], [b]) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia === -1 ? order.length : ia) - (ib === -1 ? order.length : ib);
    });
  }, [values]);

  const chip = (label: string, count: number, value: string | null) => {
    const active = selected === value;
    return (
      <button
        key={label}
        type="button"
        aria-pressed={active}
        onClick={() => setSelected(value)}
        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
          active
            ? "border-brand bg-brand text-white dark:text-background"
            : "border-border bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground"
        }`}
      >
        {label}
        <span className={active ? "opacity-80" : "text-muted-foreground/70"}>
          {count.toLocaleString("en-US")}
        </span>
      </button>
    );
  };

  return (
    <div ref={wrapperRef} data-table-filter={scope}>
      {hiddenColumnIndex >= 0 && (
        // Raw CSS: React would HTML-escape the quotes in a text child.
        <style
          dangerouslySetInnerHTML={{
            __html: `[data-table-filter="${scope}"] tr > :nth-child(${hiddenColumnIndex + 1}) { display: none; }`,
          }}
        />
      )}
      {chips.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={`Filter by ${column}`}>
          {chip("All", values.length, null)}
          {chips.map(([value, count]) => chip(TYPE_LABELS[value] ?? value, count, value))}
        </div>
      )}
      {children}
    </div>
  );
}
