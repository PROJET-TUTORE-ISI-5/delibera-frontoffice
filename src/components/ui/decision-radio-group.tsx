"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { DECISION_STATES, type EtatDecision } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const DOT: Record<string, string> = { green: "bg-status-success", orange: "bg-status-warning", red: "bg-status-danger" };

/** Choix d'un état de décision par le jury (charte : boutons radio, choix unique). */
function DecisionRadioGroup({
  states = ["ADMIS", "SOUS_CONDITION", "AJOURNE"],
  value,
  defaultValue,
  onValueChange,
  suffix,
  className,
  name = "etat",
}: {
  states?: EtatDecision[];
  value?: EtatDecision;
  defaultValue?: EtatDecision;
  onValueChange?: (v: EtatDecision) => void;
  /** Texte ajouté après un libellé (ex. { SOUS_CONDITION: "(UE exigées)" }). */
  suffix?: Partial<Record<EtatDecision, React.ReactNode>>;
  className?: string;
  name?: string;
}) {
  const id = React.useId();
  return (
    <RadioGroup name={name} value={value} defaultValue={defaultValue} onValueChange={(v) => onValueChange?.(v as EtatDecision)} className={cn("gap-1", className)}>
      {states.map((s) => (
        <Label
          key={s}
          htmlFor={`${id}-${s}`}
          className="flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2 font-normal hover:bg-black/4 has-[[data-state=checked]]:bg-brand-blue-tint has-[[data-state=checked]]:font-medium dark:hover:bg-white/5"
        >
          <RadioGroupItem id={`${id}-${s}`} value={s} />
          <span className={cn("size-1.5 rounded-full", DOT[DECISION_STATES[s].variant])} />
          <span className="uppercase tracking-wide">{DECISION_STATES[s].label}</span>
          {suffix?.[s] ? <span className="font-normal text-fg-tertiary normal-case">{suffix[s]}</span> : null}
        </Label>
      ))}
    </RadioGroup>
  );
}

export { DecisionRadioGroup };
