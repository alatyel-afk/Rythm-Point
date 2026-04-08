import type { ProtocolEngineInput, ProtocolEngineOutput, SignalRule } from "./protocol-rules";
import { RuleMatcher } from "./rule-matcher";
import { TemplateResolver, type TemplateRegistries } from "./template-resolver";
import { PROTOCOL_RULES } from "./rules/default-protocol-rules";
import {
  BREATHING_TEMPLATES,
  LUNCH_TEMPLATES,
  LOAD_TEMPLATES,
} from "./templates";

const ENGINE_NOTES =
  "Сигнальный протокол собран детерминированно по правилам и шаблонам; ядро без подстановок LLM.";

export interface DailyProtocolAssemblerDeps {
  rules?: SignalRule[];
  resolver?: TemplateResolver;
}

function defaultResolver(): TemplateResolver {
  const registries: TemplateRegistries = {
    lunch: LUNCH_TEMPLATES,
    breathing: BREATHING_TEMPLATES,
    load: LOAD_TEMPLATES,
  };
  return new TemplateResolver(registries);
}

function mergeContext(input: ProtocolEngineInput) {
  return { ...input.dayContext, ...input.bodySignals };
}

/**
 * Сборка дневного протокола: матчинг по приоритету → разрешение шаблонов.
 */
export const DailyProtocolAssembler = {
  assemble(
    input: ProtocolEngineInput,
    deps?: DailyProtocolAssemblerDeps,
  ): ProtocolEngineOutput {
    const rules = deps?.rules ?? PROTOCOL_RULES;
    const resolver = deps?.resolver ?? defaultResolver();
    const ctx = mergeContext(input);

    const { rule, rule_trace } = RuleMatcher.match(rules, ctx);

    if (!rule) {
      throw new Error(
        "DailyProtocolAssembler: no rule matched; add a fallback rule with condition { and: [] }",
      );
    }

    return {
      date: input.date,
      matched_rule: rule.id,
      rule_trace,
      lunch_template: resolver.resolveLunch(rule.lunchTemplateIds),
      breathing_template: resolver.resolveBreathing(rule.breathingTemplateIds),
      load_template: resolver.resolveLoad(rule.loadTemplateId),
      warning: rule.warning,
      notes: ENGINE_NOTES,
    };
  },
};
