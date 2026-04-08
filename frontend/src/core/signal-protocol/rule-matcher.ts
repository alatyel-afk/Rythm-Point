import type {
  Comparator,
  ConditionNode,
  RuleEvaluationContext,
  SignalRule,
} from "./protocol-rules";

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

export interface RuleMatchResult {
  rule: SignalRule | null;
  rule_trace: string[];
}

/**
 * Правила сортируются по `priority` по возрастанию; первое совпадение `condition` — основной протокол.
 */
export const RuleMatcher = {
  match(rules: SignalRule[], ctx: RuleEvaluationContext): RuleMatchResult {
    const rule_trace: string[] = [];
    const sorted = [...rules].sort((a, b) => a.priority - b.priority);

    for (const rule of sorted) {
      rule_trace.push(`rule ${rule.id} (${rule.signal}) priority=${rule.priority}: start`);
      const ok = evalConditionNode(rule.condition, ctx, rule.id, rule_trace);
      if (ok) {
        rule_trace.push(`${rule.id}: condition satisfied -> match`);
        return { rule, rule_trace };
      }
      rule_trace.push(`${rule.id}: no match`);
    }

    rule_trace.push("no rule matched");
    return { rule: null, rule_trace };
  },
};
