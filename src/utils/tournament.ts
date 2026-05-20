import type { Prize, ScoreRule, ScoreRuleSet } from "@/src/types/api";

export interface PublicScoreRuleLine {
  actionLabel: string;
  capLabel?: string | null;
  conditionLabel: string;
  pointsLabel: string;
}

export interface PublicPrizeDisplay {
  subtitle?: string;
  title: string;
}

export function shouldDisplayPrize(prize: Prize) {
  const rewardType = normalizeLabel(
    prize.rewardTypeDisplayName ?? prize.rewardType,
  );
  const scoringType = normalizeLabel(
    prize.scoringTypeDisplayName ?? prize.scoringType,
  );
  const threshold = Number(prize.threshold ?? null);
  const isQualificationPrize =
    rewardType.includes("qualification") ||
    rewardType.includes("qualif") ||
    rewardType.includes("token");
  const isPointsQualification =
    scoringType.includes("value") ||
    scoringType.includes("points") ||
    scoringType.includes("condition");

  if (isQualificationPrize && isPointsQualification && threshold === 0) {
    return false;
  }

  return true;
}

export function getPublicPrizeDisplay(prize: Prize): PublicPrizeDisplay {
  const rewardType = normalizeLabel(
    prize.rewardTypeDisplayName ?? prize.rewardType,
  );
  const threshold = prize.threshold ?? null;
  const qualificationLabel = String(
    prize.qualificationWindowName ??
    prize.qualificationTournamentName ??
    prize.value ??
    "",
  ).trim();

  if (rewardType.includes("cash") || rewardType.includes("ecomm")) {
    const amount = formatCashPrize(prize);

    if (threshold && threshold > 0) {
      return {
        title: `Top ${threshold} :`,
        subtitle: amount,
      };
    }

    return { title: amount };
  }

  if (
    rewardType.includes("qualification") ||
    rewardType.includes("qualif") ||
    rewardType.includes("token")
  ) {
    if (threshold && threshold > 0) {
      return {
        title: `Top ${threshold} :`,
        subtitle: qualificationLabel ? `Qualifie pour ${qualificationLabel}` : "Qualification",
      };
    }

    return {
      title: "Qualification",
      subtitle: qualificationLabel ? `Qualifie pour ${qualificationLabel}` : undefined,
    };
  }

  if (threshold && threshold > 0) {
    return {
      title: `Top ${threshold} :`,
      subtitle: toTitleCase(rewardType || "Recompense"),
    };
  }

  return { title: toTitleCase(rewardType || "Recompense") };
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
  lines.push(...compactOtherRules(otherRules));

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
      actionLabel: "Placement",
      capLabel: getCapLabel(end - start + 1),
      conditionLabel: getPlacementLabel(start, end),
      pointsLabel: getPointsLabel(points),
    });

    start = currentRule.value;
    end = currentRule.value;
    points = currentRule.points;
  }

  lines.push({
    actionLabel: "Placement",
    capLabel: getCapLabel(end - start + 1),
    conditionLabel: getPlacementLabel(start, end),
    pointsLabel: getPointsLabel(points),
  });

  return lines;
}

function compactOtherRules(rules: ScoreRule[]) {
  const groupedRules = new Map<string, PublicScoreRuleLine & { count: number }>();

  for (const rule of rules) {
    const actionLabel = getRuleActionLabel(rule);
    const conditionLabel = getRuleConditionLabel(rule);
    const pointsLabel = getPointsLabel(rule.points);
    const key = `${actionLabel}__${conditionLabel}__${pointsLabel}`;
    const existingRule = groupedRules.get(key);

    if (existingRule) {
      existingRule.count += 1;
      existingRule.capLabel = getCapLabel(existingRule.count);
      continue;
    }

    groupedRules.set(key, {
      actionLabel,
      capLabel: null,
      conditionLabel,
      count: 1,
      pointsLabel,
    });
  }

  return [...groupedRules.values()].map(({ count, ...ruleLine }) => {
    return {
      ...ruleLine,
      capLabel: getCapLabel(count),
    };
  });
}

function getRuleActionLabel(rule: ScoreRule) {
  if (rule.type.includes("ELIMS")) {
    return "Eliminations";
  }

  if (rule.type.includes("VICTORY")) {
    return "Victoire royale";
  }

  return toTitleCase(normalizeLabel(rule.type));
}

function getRuleConditionLabel(rule: ScoreRule) {
  if (rule.type.includes("ELIMS")) {
    return "Chaque elim";
  }

  if (rule.type.includes("VICTORY")) {
    return "Finir 1er";
  }

  return rule.value > 0 ? `Valeur ${rule.value}` : "Condition standard";
}

function getCapLabel(count: number) {
  return count > 1 ? `x${count} max` : null;
}

function getPlacementLabel(start: number, end: number) {
  if (start === 1 && end === 1) {
    return "Victoire royale";
  }

  return start === end ? `Top ${start}` : `Top ${start}-${end}`;
}

function formatCashValue(value: string | null | undefined) {
  const normalizedValue = String(value ?? "").trim();
  const numberValue = Number(normalizedValue);

  if (normalizedValue && !Number.isNaN(numberValue)) {
    return new Intl.NumberFormat("fr-CH").format(numberValue);
  }

  return "";
}

function formatCashPrize(prize: Prize) {
  const explicitPrice = formatCashValue(
    prize.price === undefined || prize.price === null ? null : String(prize.price),
  );
  const legacyValue = formatCashValue(prize.value);
  const quantityValue =
    typeof prize.quantity === "number" && Number.isFinite(prize.quantity)
      ? new Intl.NumberFormat("fr-CH").format(prize.quantity)
      : "";
  const currency = normalizeCurrency(prize.currency ?? prize.value);

  if (explicitPrice) {
    return [explicitPrice, currency].filter(Boolean).join(" ");
  }

  if (legacyValue) {
    return [legacyValue, currency].filter(Boolean).join(" ");
  }

  if (quantityValue && currency) {
    return `${quantityValue} ${currency}`;
  }

  if (quantityValue) {
    return quantityValue;
  }

  return "Cash prize";
}

function normalizeCurrency(value: string | null | undefined) {
  const normalizedValue = String(value ?? "").trim().toUpperCase();

  if (!normalizedValue) {
    return "$";
  }

  if (normalizedValue === "USD" || normalizedValue === "EUR" || normalizedValue === "CHF") {
    return normalizedValue;
  }

  if (normalizedValue === "$" || normalizedValue === "€" || normalizedValue === "CHF") {
    return normalizedValue;
  }

  return "";
}

function getPointsLabel(points: number) {
  const formattedPoints = new Intl.NumberFormat("fr-CH").format(points);

  return `+${formattedPoints}`;
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
