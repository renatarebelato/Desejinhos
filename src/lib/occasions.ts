export const OCCASIONS = [
  { value: "geral", label: "Geral", emoji: "✨" },
  { value: "aniversario", label: "Aniversário", emoji: "🎂" },
  { value: "namoro_casamento", label: "Namoro / Casamento", emoji: "💞" },
  { value: "dia_das_maes", label: "Dia das Mães", emoji: "🌷" },
  { value: "dia_dos_pais", label: "Dia dos Pais", emoji: "👔" },
  { value: "dia_das_criancas", label: "Dia das Crianças", emoji: "🧸" },
  { value: "dia_da_mulher", label: "Dia da Mulher", emoji: "💐" },
  { value: "natal", label: "Natal", emoji: "🎄" },
] as const;

export type Occasion = (typeof OCCASIONS)[number]["value"];

export const occasionInfo = (v: string) => OCCASIONS.find((o) => o.value === v) ?? OCCASIONS[0];

export const PRIORITIES = [
  { value: 3, label: "Quero muito", emoji: "🔥" },
  { value: 2, label: "Gostaria", emoji: "💛" },
  { value: 1, label: "Seria legal", emoji: "🙂" },
] as const;

export const priorityInfo = (v: number) => PRIORITIES.find((p) => p.value === v) ?? PRIORITIES[1];

export const formatBRL = (n: number | null | undefined) =>
  n == null ? null : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
