// Extra behaviour for specific articles, keyed by the `id` in their frontmatter.
// An article gets a feature only when its id matches exactly.

export const WORD_FILTER_POST_ID = "english-polish-2000-words";

export interface PostFeatures {
  // Header of the table column to build filter chips from.
  tableFilterColumn?: string;
}

export function getPostFeatures(id?: string): PostFeatures {
  if (id === WORD_FILTER_POST_ID) {
    return { tableFilterColumn: "Type" };
  }
  return {};
}
