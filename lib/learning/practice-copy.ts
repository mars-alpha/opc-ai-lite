import type { PracticeContent } from "./practice-evaluator";

export function buildPracticeCopyText(
  instructions: ReadonlyArray<{ key: string; label: string }>,
  content: PracticeContent,
  valuesOnly = true
) {
  return instructions
    .map((item) => {
      const value = (content[item.key] ?? "").trim();
      if (!value) return "";
      return valuesOnly ? value : item.label + "：" + value;
    })
    .filter(Boolean)
    .join("\n");
}
