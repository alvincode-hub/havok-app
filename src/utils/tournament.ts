import type { Prize, ScoreRule, ScoreRuleSet } from "@/src/types/api";

export interface PublicScoreRuleLine {
  label: string;
  pointsLabel: string;
}

export function getPublicPrizeLabel(prize: Prize) {
  const rewardType = normalizeLabel(prize.rewardType);
  const threshold = prize.threshold ?? null;

  if (rewardType.includes("cash")) {
    const amount = formatCashValue(prize.value);
    return threshold && threshold > 0
      ? `Top ${threshold} - ${amount}`
      : amount;
  }

  if (rewardType.includes("qualification")) {
    if (threshold && threshold > 0) {
      return `Top ${threshold} qualifies`;
    }

    return "Qualification";
  }

  if (threshold && threshold > 0) {
    return `Top ${threshold} - ${toTitleCase(rewardType || "Recompense")}`;
  }

  return toTitleCase(rewardType || "Recompense");
}

export function buildPublicScoreRuleLines(scoreRules: ScoreRuleSet | null | undefined) {
  const rules = [...(scoreRules?.rule ?? [])].sort((first, second) => {
    if (first.type === second.type) {
      return first.value - second.value;
    }

    if (first.type === "PLACEMENT_STAT_INDEX") {
      return -1;
    }

    if (second.type === "PLACEMENT_STAT_INDEX") {
      return 1;
    }

    return first.type.localeCompare(second.type);
  });

  const lines: PublicScoreRuleLine[] = [];
  const placementRules = rules.filter((rule) => {
    return rule.type === "PLACEMENT_STAT_INDEX";
  });
  const otherRules = rules.filter((rule) => {
    return rule.type !== "PLACEMENT_STAT_INDEX";
  });

  lines.push(...compactPlacementRules(placementRules));

  for (const rule of otherRules) {
    lines.push({
      label: getRuleLabel(rule),
      pointsLabel: getPointsLabel(rule.points),
    });
  }

  return lines;
}

function compactPlacementRules(rules: ScoreRule[]) {
  const lines: PublicScoreRuleLine[] = [];

  if (rules.length === 0) {
    return lines;
  }

  let start = rules[0].value;
  let end = rules[0].value;
  let points = rules[0].points;

  for (let index = 1; index < rules.length; index += 1) {
    const currentRule = rules[index];
    const isSequential = currentRule.value === end + 1;
    const hasSamePoints = currentRule.points === points;

    if (isSequential && hasSamePoints) {
      end = currentRule.value;
      continue;
    }

    lines.push({
      label: start === end ? `Top ${start}` : `Top ${start}-${end}`,
      pointsLabel: getPointsLabel(points),
    });

    start = currentRule.value;
    end = currentRule.value;
    points = currentRule.points;
  }

  lines.push({
    label: start === end ? `Top ${start}` : `Top ${start}-${end}`,
    pointsLabel: getPointsLabel(points),
  });

  return lines;
}

function getRuleLabel(rule: ScoreRule) {
  if (rule.type.includes("ELIMS")) {
    return "Elimination";
  }

  if (rule.type.includes("VICTORY")) {
    return "Victoire";
  }

  return toTitleCase(normalizeLabel(rule.type));
}

function formatCashValue(value: string | null | undefined) {
  const normalizedValue = String(value ?? "").trim();
  const numberValue = Number(normalizedValue);

  if (normalizedValue && !Number.isNaN(numberValue)) {
    return `${new Intl.NumberFormat("fr-CH").format(numberValue)} $`;
  }

  return "Cash prize";
}

function getPointsLabel(points: number) {
  return `${new Intl.NumberFormat("fr-CH").format(points)} pt${
    points > 1 ? "s" : ""
  }`;
}

function normalizeLabel(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/_/g, " ")
    .trim()
    .toLowerCase();
}

function toTitleCase(value: string) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
