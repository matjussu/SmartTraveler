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

export type FormFieldVariant = "light" | "dark";

export type FormFieldProps = {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  optional?: boolean;
  /** "light" = cream voyage-pivot (défaut, 4 routes cascade). "dark" = home noire (/trip/new). */
  variant?: FormFieldVariant;
  children: ReactNode;
};

export function FormField({
  id,
  label,
  helper,
  error,
  optional = false,
  variant = "light",
  children,
}: FormFieldProps) {
  const isDark = variant === "dark";
  const labelColor = isDark ? "text-white/70" : "text-ink-soft";
  const optionalColor = isDark ? "text-white/40" : "text-ink-mute";
  const helperColor = isDark ? "text-white/45" : "text-ink-mute";
  // Erreur : terracotta-ink sur cream, ambre clair (lisible sur noir) en dark.
  // Littéraux light → var() pour qu'ils thement sous un scope dark (data-route).
  const errorColor = isDark ? "text-[#ff9a5c]" : "text-[var(--terracotta-ink)]";
  const errorDot = isDark ? "bg-[#ff7a1a]" : "bg-[var(--terracotta)]";

  return (
    <div className="flex flex-col">
      <label
        htmlFor={id}
        className={`mb-2 flex items-baseline gap-2 text-[15px] ${labelColor}`}
        style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
      >
        <span>{label}</span>
        {optional && (
          <span
            className={`text-[11px] tracking-[0.06em] ${optionalColor}`}
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
          className={`mt-2 flex items-center gap-1.5 text-[12px] ${errorColor}`}
          style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
          role="alert"
        >
          <span
            aria-hidden
            className={`inline-block h-1 w-1 rounded-full ${errorDot}`}
          />
          <span>{error}</span>
        </p>
      ) : helper ? (
        <p
          id={`${id}-helper`}
          className={`mt-2 text-[12px] ${helperColor}`}
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
  // var() → se theme sous un scope dark (data-route="voyage-dark").
  "focus:outline-none focus:border-[var(--terracotta)]",
  "focus:shadow-[0_0_0_3px_oklch(0.62_0.155_38_/_0.16)]",
  "hover:border-line-strong",
].join(" ");

export const fieldInputErrorClasses = [
  // border-color = terracotta-ink (chaleureux, pas rouge acide) — var() pour theming.
  "border-[var(--terracotta-ink)]",
  "focus:border-[var(--terracotta-ink)]",
  "focus:shadow-[0_0_0_3px_oklch(0.42_0.13_35_/_0.16)]",
].join(" ");

export const fieldInputNormalClasses = "border-line";

/**
 * Variante dark (home noire /trip/new). Fond translucide, texte warm-white,
 * focus ring ambre. `[color-scheme:dark]` rend le datepicker natif sombre.
 */
export const fieldInputDarkClasses = [
  "h-12 w-full rounded-lg border bg-white/[0.04] px-4 [color-scheme:dark]",
  "text-[15px] text-[#f6f6f4] placeholder:text-white/35",
  "transition-[border-color,box-shadow,background-color] duration-180 ease-out",
  "focus:outline-none focus:border-[#ff7a1a]",
  "focus:shadow-[0_0_0_3px_rgba(255,122,26,0.18)]",
  "hover:border-white/20",
].join(" ");

export const fieldInputDarkNormalClasses = "border-white/10";
export const fieldInputDarkErrorClasses = [
  "border-[#ff7a1a]",
  "focus:border-[#ff7a1a]",
  "focus:shadow-[0_0_0_3px_rgba(255,122,26,0.22)]",
].join(" ");

/**
 * Helper pour composer la className d'un input selon son état d'erreur.
 * `variant="dark"` pour la home noire ; défaut "light" = cream voyage-pivot.
 */
export function inputClass(
  hasError: boolean | undefined,
  variant: FormFieldVariant = "light"
): string {
  if (variant === "dark") {
    return [
      fieldInputDarkClasses,
      hasError ? fieldInputDarkErrorClasses : fieldInputDarkNormalClasses,
    ].join(" ");
  }
  return [
    fieldInputClasses,
    hasError ? fieldInputErrorClasses : fieldInputNormalClasses,
  ].join(" ");
}
