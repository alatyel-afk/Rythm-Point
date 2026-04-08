import type {
  BreathingTemplate,
  BreathingTemplateId,
  LoadTemplate,
  LoadTemplateId,
  LunchTemplate,
  LunchTemplateId,
} from "./protocol-rules";

export interface TemplateRegistries {
  lunch: Record<LunchTemplateId, LunchTemplate>;
  breathing: Record<BreathingTemplateId, BreathingTemplate>;
  load: Record<LoadTemplateId, LoadTemplate>;
}

/**
 * Первый id из списка, для которого есть запись в реестре (порядок в массиве = приоритет).
 */
export class TemplateResolver {
  constructor(private readonly registries: TemplateRegistries) {}

  resolveLunch(ids: LunchTemplateId[]): LunchTemplate {
    for (const id of ids) {
      const t = this.registries.lunch[id];
      if (t) return t;
    }
    throw new Error(
      `TemplateResolver: no lunch template resolved from [${ids.join(", ")}]`,
    );
  }

  resolveBreathing(ids: BreathingTemplateId[]): BreathingTemplate {
    for (const id of ids) {
      const t = this.registries.breathing[id];
      if (t) return t;
    }
    throw new Error(
      `TemplateResolver: no breathing template resolved from [${ids.join(", ")}]`,
    );
  }

  resolveLoad(id: LoadTemplateId): LoadTemplate {
    const t = this.registries.load[id];
    if (!t) {
      throw new Error(`TemplateResolver: unknown load template id "${id}"`);
    }
    return t;
  }
}
