"use client";

import { ReactNode } from "react";

/**
 * Pattern de champ formulaire voyage-pivot.
 *
 * Établi sur /trip/new (pilote cascade) — réutilisé tel quel sur
 * /trip/[id]/destinations, /trip/[id]/constraints, /trip/[id]/edit.
 *
 * Le composant ne gère QUE le scaffold (label + helper + error).
 * L'input lui-même est passé en `children` pour rester flexible
 * (text, date, number, select, custom autocomplete…).
 *
 * Signature visuelle :
 *  - Label : Instrument Serif italic, 15px, ink-soft, mb-2
 *  - Helper : Instrument Serif italic, 12px, ink-mute
 *  - Error : passe le helper en text-terracotta + permet à l'input
 *    d'appliquer une border-terracotta via le contexte error.
 */

export type FormFieldProps = {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
};

export function FormField({
  id,
  label,
  helper,
  error,
  optional = false,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={id}
        className="mb-2 flex items-baseline gap-2 text-[15px] text-ink-soft"
        style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
      >
        <span>{label}</span>
        {optional && (
          <span
            className="text-[11px] tracking-[0.06em] text-ink-mute"
            style={{ fontStyle: "italic" }}
          >
            — facultatif
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          className="mt-2 flex items-center gap-1.5 text-[12px] text-[oklch(0.42_0.13_35)]"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          role="alert"
        >
          <span
            aria-hidden
            className="inline-block h-1 w-1 rounded-full bg-[oklch(0.62_0.155_38)]"
          />
          <span>{error}</span>
        </p>
      ) : helper ? (
        <p
          id={`${id}-helper`}
          className="mt-2 text-[12px] text-ink-mute"
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
        >
          {helper}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Classes utilitaires de l'input voyage-pivot.
 * À appliquer directement sur <input>, <select>, ou wrappeur custom
 * pour garantir une apparence cohérente sur les 4 formulaires de la cascade.
 *
 * Note : transition spécifique (border-color + box-shadow) et NON `all`.
 * Focus ring = terracotta subtil ; error state = border-terracotta-ink.
 */
export const fieldInputClasses = [
  "h-12 w-full rounded-lg border bg-card px-4",
  "text-[15px] text-ink placeholder:text-ink-mute/70",
  "transition-[border-color,box-shadow,background-color] duration-180 ease-out",
  "focus:outline-none focus:border-[oklch(0.62_0.155_38)]",
  "focus:shadow-[0_0_0_3px_oklch(0.62_0.155_38_/_0.16)]",
  "hover:border-line-strong",
].join(" ");

export const fieldInputErrorClasses = [
  // border-color = terracotta-ink (chaleureux, pas rouge acide)
  "border-[oklch(0.42_0.13_35)]",
  "focus:border-[oklch(0.42_0.13_35)]",
  "focus:shadow-[0_0_0_3px_oklch(0.42_0.13_35_/_0.16)]",
].join(" ");

export const fieldInputNormalClasses = "border-line";

/**
 * Helper pour composer la className d'un input selon son état d'erreur.
 */
export function inputClass(hasError: boolean | undefined): string {
  return [
    fieldInputClasses,
    hasError ? fieldInputErrorClasses : fieldInputNormalClasses,
  ].join(" ");
}
