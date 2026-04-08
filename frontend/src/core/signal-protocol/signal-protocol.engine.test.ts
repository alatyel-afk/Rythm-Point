import { describe, expect, it } from "vitest";
import type { BodySignal } from "@/lib/api";
import type { SignalRule } from "./types";
import { RuleMatcher } from "./rule-matcher";
import { TemplateResolver } from "./template-resolver";
import { DailyProtocolAssembler } from "./daily-protocol-assembler";
import { LUNCH_TEMPLATES, BREATHING_TEMPLATES, LOAD_TEMPLATES } from "./templates";

const emptySignals = (d: string): BodySignal => ({ day_date: d });

describe("RuleMatcher", () => {
  const rules: SignalRule[] = [
    {
      id: "second",
      priority: 20,
      name: "Second",
      when: [{ field: "energy_level", op: "<=", value: 2 }],
      lunchTemplateId: "default_lunch",
      breathingTemplateId: "default_breath",
      loadTemplateId: "default_load",
    },
    {
      id: "first",
      priority: 10,
      name: "First",
      when: [{ field: "energy_level", op: "<=", value: 2 }],
      lunchTemplateId: "default_lunch",
      breathingTemplateId: "default_breath",
      loadTemplateId: "default_load",
    },
  ];

  it("evaluates by ascending priority (lower number first)", () => {
    const signals: BodySignal = { ...emptySignals("2026-04-07"), energy_level: 1 };
    const { rule } = RuleMatcher.match(rules, signals);
    expect(rule?.id).toBe("first");
  });

  it("returns first matching rule only", () => {
    const signals: BodySignal = { ...emptySignals("2026-04-07"), energy_level: 1 };
    const { rule, rule_trace } = RuleMatcher.match(rules, signals);
    expect(rule?.id).toBe("first");
    expect(rule_trace.some((l) => l.includes("first") && l.includes("match"))).toBe(true);
    expect(rule_trace.some((l) => l.includes("second") && l.includes("start"))).toBe(false);
  });

  it("empty when always matches", () => {
    const fallback: SignalRule[] = [
      {
        id: "never",
        priority: 10,
        name: "Never",
        when: [{ field: "energy_level", op: "==", value: 99 }],
        lunchTemplateId: "default_lunch",
        breathingTemplateId: "default_breath",
        loadTemplateId: "default_load",
      },
      {
        id: "always",
        priority: 20,
        name: "Always",
        when: [],
        lunchTemplateId: "default_lunch",
        breathingTemplateId: "default_breath",
        loadTemplateId: "default_load",
      },
    ];
    const { rule } = RuleMatcher.match(fallback, emptySignals("2026-04-07"));
    expect(rule?.id).toBe("always");
  });

  it("missing numeric field fails condition", () => {
    const r: SignalRule[] = [
      {
        id: "needs_energy",
        priority: 10,
        name: "Needs energy",
        when: [{ field: "energy_level", op: "<=", value: 2 }],
        lunchTemplateId: "default_lunch",
        breathingTemplateId: "default_breath",
        loadTemplateId: "default_load",
      },
      {
        id: "fb",
        priority: 100,
        name: "Fb",
        when: [],
        lunchTemplateId: "default_lunch",
        breathingTemplateId: "default_breath",
        loadTemplateId: "default_load",
      },
    ];
    const { rule, rule_trace } = RuleMatcher.match(r, emptySignals("2026-04-07"));
    expect(rule?.id).toBe("fb");
    expect(rule_trace.some((l) => l.includes("fail (missing)"))).toBe(true);
  });

  it("head_overload 5 matches more specific rule before >=4", () => {
    const headRules: SignalRule[] = [
      {
        id: "severe",
        priority: 28,
        name: "Severe",
        when: [{ field: "head_overload", op: ">=", value: 5 }],
        lunchTemplateId: "nervous_simple",
        breathingTemplateId: "bhramari",
        loadTemplateId: "no_intensify",
      },
      {
        id: "moderate",
        priority: 30,
        name: "Moderate",
        when: [{ field: "head_overload", op: ">=", value: 4 }],
        lunchTemplateId: "nervous_simple",
        breathingTemplateId: "calm_exhale",
        loadTemplateId: "default_load",
      },
    ];
    const { rule } = RuleMatcher.match(headRules, {
      ...emptySignals("2026-04-07"),
      head_overload: 5,
    });
    expect(rule?.id).toBe("severe");
  });
});

describe("TemplateResolver", () => {
  it("throws on unknown id", () => {
    const r = new TemplateResolver({
      lunch: LUNCH_TEMPLATES,
      breathing: BREATHING_TEMPLATES,
      load: LOAD_TEMPLATES,
    });
    expect(() => r.resolveLunch("no_such")).toThrow(/unknown lunch template/);
  });
});

describe("DailyProtocolAssembler", () => {
  it("returns full JSON shape", () => {
    const out = DailyProtocolAssembler.assemble({
      date: "2026-04-07",
      signals: { ...emptySignals("2026-04-07"), ankles_evening: 3 },
    });
    expect(out.date).toBe("2026-04-07");
    expect(out.matched_rule).toBe("rule_ankles_retention");
    expect(out.rule_trace.length).toBeGreaterThan(0);
    expect(out.lunch_template.id).toBe("retention_light");
    expect(out.breathing_template.id).toBe("default_breath");
    expect(out.load_template.id).toBe("soft_walk_only");
    expect(typeof out.warning).toBe("string");
    expect(out.notes.length).toBeGreaterThan(0);
  });
});
