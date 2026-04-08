import type {
  Comparator,
  ConditionNode,
  RuleEvaluationContext,
  SignalRule,
  SignalRuleId,
} from "./protocol-types";
import { signalRules } from "./signal-rules";
import { rulePriority } from "./rule-priority";
import { lunchTemplates } from "./meal-templates";
import { breathingTemplates, loadTemplates } from "./practice-templates";
import type { BreathingTemplate, LoadTemplate, LunchTemplate } from "./protocol-types";

function formatLeaf(field: string, op: Comparator, value: unknown): string {
  return `${field} ${op}${value !== undefined ? ` ${String(value)}` : ""}`;
}

function evalLeaf(
  node: ConditionNode,
  ctx: RuleEvaluationContext,
  ruleId: string,
  trace: string[],
): boolean {
  const field = node.field;
  const op = node.op;
  if (!field || !op) {
    trace.push(`${ruleId}: leaf invalid (field/op)`);
    return false;
  }
  const raw = ctx[field];

  if (op === "true") {
    const ok = raw === true;
    trace.push(
      `${ruleId}: ${formatLeaf(String(field), op, undefined)} -> ${ok ? "pass" : "fail"} (${String(raw)})`,
    );
    return ok;
  }
  if (op === "false") {
    const ok = raw === false;
    trace.push(
      `${ruleId}: ${formatLeaf(String(field), op, undefined)} -> ${ok ? "pass" : "fail"} (${String(raw)})`,
    );
    return ok;
  }

  if (raw === undefined || raw === null) {
    trace.push(`${ruleId}: ${formatLeaf(String(field), op, node.value)} -> fail (missing)`);
    return false;
  }

  if (op === "eq") {
    const v = node.value;
    if (typeof v === "boolean") {
      const ok = raw === v;
      trace.push(`${ruleId}: ${String(field)} eq ${v} -> ${ok ? "pass" : "fail"} (${String(raw)})`);
      return ok;
    }
    if (typeof v === "number") {
      const n = Number(raw);
      if (Number.isNaN(n)) {
        trace.push(`${ruleId}: ${String(field)} eq ${v} -> fail (not a number)`);
        return false;
      }
      const ok = n === v;
      trace.push(`${ruleId}: ${String(field)} eq ${v} -> ${ok ? "pass" : "fail"} (${n})`);
      return ok;
    }
    trace.push(`${ruleId}: ${String(field)} eq -> fail (bad value)`);
    return false;
  }

  if (op === "gte" || op === "lte") {
    const v = node.value;
    if (typeof v !== "number") {
      trace.push(`${ruleId}: ${String(field)} ${op} -> fail (value not number)`);
      return false;
    }
    const n = Number(raw);
    if (typeof raw === "boolean" || Number.isNaN(n)) {
      trace.push(`${ruleId}: ${String(field)} ${op} ${v} -> fail (not a number)`);
      return false;
    }
    const ok = op === "gte" ? n >= v : n <= v;
    trace.push(
      `${ruleId}: ${String(field)} ${op} ${v} -> ${ok ? "pass" : "fail"} (${n})`,
    );
    return ok;
  }

  const _exhaustive: never = op;
  return _exhaustive;
}

function evalConditionNode(
  node: ConditionNode,
  ctx: RuleEvaluationContext,
  ruleId: string,
  trace: string[],
): boolean {
  if (node.and) {
    if (node.and.length === 0) {
      trace.push(`${ruleId}: AND[] empty -> pass`);
      return true;
    }
    trace.push(`${ruleId}: AND (`);
    for (const child of node.and) {
      const ok = evalConditionNode(child, ctx, ruleId, trace);
      if (!ok) {
        trace.push(`${ruleId}: AND -> fail`);
        return false;
      }
    }
    trace.push(`${ruleId}: AND -> pass`);
    return true;
  }

  if (node.or) {
    if (node.or.length === 0) {
      trace.push(`${ruleId}: OR[] empty -> fail`);
      return false;
    }
    trace.push(`${ruleId}: OR (`);
    for (const child of node.or) {
      const ok = evalConditionNode(child, ctx, ruleId, trace);
      if (ok) {
        trace.push(`${ruleId}: OR -> pass`);
        return true;
      }
    }
    trace.push(`${ruleId}: OR -> fail`);
    return false;
  }

  return evalLeaf(node, ctx, ruleId, trace);
}

export function sortSignalRulesByPriority(
  rules: SignalRule[],
  order: SignalRuleId[],
): SignalRule[] {
  const byId = new Map(rules.map((r) => [r.id, r]));
  const ordered: SignalRule[] = [];
  for (const id of order) {
    const r = byId.get(id);
    if (r) ordered.push(r);
  }
  const rest = rules
    .filter((r) => !order.includes(r.id))
    .sort((a, b) => a.id.localeCompare(b.id));
  return [...ordered, ...rest];
}

function resolveLunch(ids: SignalRule["lunchTemplateIds"]): LunchTemplate {
  for (const id of ids) {
    const t = lunchTemplates[id];
    if (t) return t;
  }
  throw new Error(`rule-engine: no lunch template for [${ids.join(", ")}]`);
}

function resolveBreathing(ids: SignalRule["breathingTemplateIds"]) {
  for (const id of ids) {
    const t = breathingTemplates[id];
    if (t) return t;
  }
  throw new Error(`rule-engine: no breathing template for [${ids.join(", ")}]`);
}

function resolveLoad(id: SignalRule["loadTemplateId"]): LoadTemplate {
  const t = loadTemplates[id];
  if (!t) throw new Error(`rule-engine: unknown load template "${id}"`);
  return t;
}

function matchRules(sorted: SignalRule[], ctx: RuleEvaluationContext): { rule: SignalRule | null; ruleTrace: string[] } {
  const ruleTrace: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const rule = sorted[i];
    ruleTrace.push(
      `rule ${rule.id} (${rule.signal}) order=${i + 1}/${sorted.length}: start`,
    );
    const ok = evalConditionNode(rule.condition, ctx, rule.id, ruleTrace);
    if (ok) {
      ruleTrace.push(`${rule.id}: condition satisfied -> match`);
      return { rule, ruleTrace };
    }
    ruleTrace.push(`${rule.id}: no match`);
  }
  ruleTrace.push("no rule matched");
  return { rule: null, ruleTrace };
}

const ENGINE_NOTES =
  "Движок сигнальных правил: детерминированный порядок из rule-priority; первый подходящий шаблон обеда/дыхания из списка (MVP без ротации).";

/** Объединённый контекст: поля BodySignals и DayContext в одном объекте. */
export type DailyProtocolContext = RuleEvaluationContext & { date?: string };

export interface ResolveDailyProtocolResult {
  matchedRule: string;
  ruleTrace: string[];
  lunchTemplate: LunchTemplate;
  breathingTemplate: BreathingTemplate;
  loadTemplate: LoadTemplate;
  warning: string;
  notes: string;
}

/**
 * Оценка правил в порядке `rulePriority`, первое совпадение → шаблоны.
 * @returns null только если в конфиге нет ни одного правила (нештатно).
 */
export function resolveDailyProtocol(ctx: DailyProtocolContext): ResolveDailyProtocolResult | null {
  const sorted = sortSignalRulesByPriority(signalRules, rulePriority);
  const { rule, ruleTrace } = matchRules(sorted, ctx);
  if (!rule) return null;

  return {
    matchedRule: rule.id,
    ruleTrace,
    lunchTemplate: resolveLunch(rule.lunchTemplateIds),
    breathingTemplate: resolveBreathing(rule.breathingTemplateIds),
    loadTemplate: resolveLoad(rule.loadTemplateId),
    warning: rule.warning,
    notes: ENGINE_NOTES,
  };
}
