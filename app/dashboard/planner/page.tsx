"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, X, User, Shield, Swords, Zap, Sparkles, Check, MousePointerClick, Skull, CreditCard, Smartphone, QrCode } from "lucide-react";

/* ─────────────────────────────────────
   TYPES & DATA
   ───────────────────────────────────── */

interface Character {
  id: string;
  name: string;
  tier: string;
  imageUrl: string;
}

type SlotValue = Character | null;

interface TeamRow {
  id: string;
  slots: [SlotValue, SlotValue, SlotValue];
}

const modes = ["ToA", "Whiwa", "Matrix", "Hologram"] as const;
type Mode = (typeof modes)[number];

const MODE_ICONS: Record<Mode, React.ReactNode> = {
  ToA: <Swords className="h-4 w-4" />,
  Whiwa: <Shield className="h-4 w-4" />,
  Matrix: <Zap className="h-4 w-4" />,
  Hologram: <Sparkles className="h-4 w-4" />,
};

const DEFAULT_ROWS: Record<Mode, number> = {
  ToA: 4,
  Whiwa: 2,
  Matrix: 3,
  Hologram: 1,
};

const VIGOR_CONFIG: Record<Mode, { max: number; cost: number }> = {
  ToA: { max: 10, cost: 5 },
  Whiwa: { max: 10, cost: 5 },
  Matrix: { max: 2, cost: 1 },
  Hologram: { max: 10, cost: 5 },
};

const characters: Character[] = [
  { id: "jinhsi", name: "Jinhsi", tier: "S", imageUrl: "" },
  { id: "changli", name: "Changli", tier: "S", imageUrl: "" },
  { id: "zhezhi", name: "Zhezhi", tier: "S", imageUrl: "" },
  { id: "xiangli-yao", name: "Xiangli Yao", tier: "S", imageUrl: "" },
  { id: "shorekeeper", name: "Shorekeeper", tier: "S", imageUrl: "" },
  { id: "camellya", name: "Camellya", tier: "S", imageUrl: "" },
  { id: "roccia", name: "Roccia", tier: "A", imageUrl: "" },
  { id: "carlotta", name: "Carlotta", tier: "S", imageUrl: "" },
  { id: "phoebe", name: "Phoebe", tier: "S", imageUrl: "" },
  { id: "brant", name: "Brant", tier: "S", imageUrl: "" },
  { id: "cantarella", name: "Cantarella", tier: "S", imageUrl: "" },
  { id: "zani", name: "Zani", tier: "S", imageUrl: "" },
  { id: "verina", name: "Verina", tier: "S", imageUrl: "" },
  { id: "sanhua", name: "Sanhua", tier: "A", imageUrl: "" },
  { id: "encore", name: "Encore", tier: "S", imageUrl: "" },
  { id: "yinlin", name: "Yinlin", tier: "S", imageUrl: "" },
];

/* ─────────────────────────────────────
   BOSS DATA (Hologram Mode)
   ───────────────────────────────────── */

interface Boss {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

const mockBosses: Boss[] = [
  // Tactical Hologram "Calamity"
  { id: "tempest-mephis", name: "Tempest Mephis", category: "Tactical Hologram \"Calamity\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "impermanence-heron", name: "Impermanence Heron", category: "Tactical Hologram \"Calamity\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "mourning-aix", name: "Mourning Aix", category: "Tactical Hologram \"Calamity\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "feilian-beringal", name: "Feilian Beringal", category: "Tactical Hologram \"Calamity\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "crownless", name: "Crownless", category: "Tactical Hologram \"Calamity\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "inferno-rider", name: "Inferno Rider", category: "Tactical Hologram \"Calamity\"", imageUrl: "/images/boss-placeholder.webp" },
  // Tactical Hologram "Phantom Pain"
  { id: "fallacy-no-return", name: "Fallacy no Return", category: "Tactical Hologram \"Phantom Pain\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "sentry-construct", name: "Sentry Construct", category: "Tactical Hologram \"Phantom Pain\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "hecate", name: "Hecate", category: "Tactical Hologram \"Phantom Pain\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "dragon-of-dirge", name: "Dragon of Dirge", category: "Tactical Hologram \"Phantom Pain\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "fleurdelys", name: "Fleurdelys", category: "Tactical Hologram \"Phantom Pain\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "lorelei", name: "Lorelei", category: "Tactical Hologram \"Phantom Pain\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "nightmare-kelpie", name: "Nightmare: Kelpie", category: "Tactical Hologram \"Phantom Pain\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "lady-of-the-sea", name: "Lady of the Sea", category: "Tactical Hologram \"Phantom Pain\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "lioness-of-glory", name: "Lioness of Glory", category: "Tactical Hologram \"Phantom Pain\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "the-false-sovereign", name: "The False Sovereign", category: "Tactical Hologram \"Phantom Pain\"", imageUrl: "/images/boss-placeholder.webp" },
  // Tactical Hologram "Synchronization"
  { id: "dreamless", name: "Dreamless", category: "Tactical Hologram \"Synchronization\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "hyvatia", name: "Hyvatia", category: "Tactical Hologram \"Synchronization\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "sigillum", name: "Sigillum", category: "Tactical Hologram \"Synchronization\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "nameless-explorer", name: "Nameless Explorer", category: "Tactical Hologram \"Synchronization\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "reactor-husk", name: "Reactor Husk", category: "Tactical Hologram \"Synchronization\"", imageUrl: "/images/boss-placeholder.webp" },
  // Tactical Hologram "Sparring"
  { id: "denia", name: "Denia", category: "Tactical Hologram \"Sparring\"", imageUrl: "/images/boss-placeholder.webp" },
  { id: "myriad-snare", name: "Myriad Snare (Rustfire Chassis)", category: "Tactical Hologram \"Sparring\"", imageUrl: "/images/boss-placeholder.webp" },
];

const bossCategories = [...new Set(mockBosses.map((b) => b.category))];

/* ─────────────────────────────────────
   HELPERS
   ───────────────────────────────────── */

let rowCounter = 0;
function makeEmptyRow(): TeamRow {
  rowCounter += 1;
  return {
    id: `row-${rowCounter}-${Date.now()}`,
    slots: [null, null, null],
  };
}

function makeRows(count: number): TeamRow[] {
  return Array.from({ length: count }, () => makeEmptyRow());
}

function countUsage(charId: string, teams: TeamRow[]): number {
  let count = 0;
  for (const row of teams) {
    for (const slot of row.slots) {
      if (slot?.id === charId) count++;
    }
  }
  return count;
}

const TIER_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  S: {
    border: "border-amber-500/50",
    bg: "bg-gradient-to-b from-amber-500/10 to-transparent",
    text: "text-amber-400",
  },
  A: {
    border: "border-violet-500/50",
    bg: "bg-gradient-to-b from-violet-500/10 to-transparent",
    text: "text-violet-400",
  },
  B: {
    border: "border-zinc-600",
    bg: "bg-zinc-800",
    text: "text-zinc-400",
  },
};

/* ─────────────────────────────────────
   CHARACTER ROSTER ICON
   ───────────────────────────────────── */

function CharacterIcon({
  char,
  vigor,
  maxVigor,
  disabled,
  alreadyInTeam,
  showVigor,
  onClick,
}: {
  char: Character;
  vigor: number;
  maxVigor: number;
  disabled: boolean;
  alreadyInTeam: boolean;
  showVigor: boolean;
  onClick: () => void;
}) {
  const tierStyle = TIER_COLORS[char.tier] ?? TIER_COLORS.B;
  const isBlocked = disabled || alreadyInTeam;

  return (
    <button
      type="button"
      onClick={isBlocked ? undefined : onClick}
      disabled={isBlocked}
      className={`group relative flex flex-col items-center gap-1.5 rounded-lg p-1 transition-all duration-200 ${
        isBlocked
          ? "cursor-not-allowed opacity-50 grayscale"
          : "cursor-pointer hover:scale-105 hover:bg-zinc-800/60"
      }`}
    >
      {/* Icon box */}
      <div
        className={`relative flex h-16 w-16 items-center justify-center rounded-lg border-2 ${
          alreadyInTeam ? "border-emerald-500/50" : tierStyle.border
        } ${tierStyle.bg} transition-all duration-200 ${
          !isBlocked ? "group-hover:shadow-lg group-hover:shadow-amber-500/5" : ""
        }`}
      >
        {char.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={char.imageUrl}
            alt={char.name}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          <User className="h-7 w-7 text-zinc-400" />
        )}

        {/* Tier badge */}
        <span
          className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${tierStyle.text} bg-zinc-900 ring-1 ring-zinc-800`}
        >
          {char.tier}
        </span>

        {/* Already-in-team check */}
        {alreadyInTeam && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-emerald-950/60">
            <Check className="h-5 w-5 text-emerald-400" />
          </div>
        )}

        {/* Vigor overlay */}
        {showVigor && !alreadyInTeam && (
          <span
            className={`absolute inset-x-0 bottom-0 rounded-b-md py-0.5 text-center text-[10px] font-bold leading-none backdrop-blur-sm ${
              vigor === 0
                ? "bg-red-950/80 text-red-400"
                : vigor < maxVigor
                  ? "bg-zinc-900/80 text-amber-400"
                  : "bg-zinc-900/80 text-emerald-400"
            }`}
          >
            {vigor}
          </span>
        )}
      </div>

      {/* Name */}
      <span
        className={`max-w-[68px] truncate text-center text-[10px] leading-tight ${
          alreadyInTeam
            ? "text-emerald-400/70"
            : disabled
              ? "text-zinc-600"
              : "text-zinc-400 group-hover:text-zinc-200"
        }`}
      >
        {char.name}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────
   TEAM SLOT
   ───────────────────────────────────── */

function TeamSlot({
  character,
  onRemove,
}: {
  character: SlotValue;
  onRemove: () => void;
}) {
  if (character) {
    const tierStyle = TIER_COLORS[character.tier] ?? TIER_COLORS.B;
    return (
      <button
        type="button"
        onClick={onRemove}
        className={`group relative flex h-[72px] w-[72px] cursor-pointer items-center justify-center rounded-xl border-2 ${tierStyle.border} ${tierStyle.bg} transition-all duration-200 hover:border-red-500/70 hover:shadow-lg hover:shadow-red-500/10`}
      >
        {character.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.imageUrl}
            alt={character.name}
            className="h-full w-full rounded-[10px] object-cover"
          />
        ) : (
          <User className="h-8 w-8 text-zinc-300" />
        )}

        {/* Name label */}
        <span className="absolute -bottom-5 max-w-[72px] truncate text-center text-[10px] font-medium text-zinc-400">
          {character.name}
        </span>

        {/* Hover remove indicator */}
        <div className="absolute inset-0 flex items-center justify-center rounded-[10px] bg-red-950/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <X className="h-5 w-5 text-red-400" />
        </div>
      </button>
    );
  }

  return (
    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-xl border-2 border-dashed border-zinc-700/60 bg-zinc-900/40 transition-colors">
      <Plus className="h-5 w-5 text-zinc-600" />
    </div>
  );
}

/* ─────────────────────────────────────
   TEAM ROW
   ───────────────────────────────────── */

function TeamRowComponent({
  row,
  index,
  isActive,
  onSelect,
  onRemoveChar,
  onDeleteRow,
}: {
  row: TeamRow;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onRemoveChar: (slotIndex: number) => void;
  onDeleteRow: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`group/row flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-4 transition-all duration-200 sm:gap-5 ${
        isActive
          ? "border-emerald-500/50 bg-emerald-950/10 ring-1 ring-emerald-500/20"
          : "border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700/80 hover:bg-zinc-900/80"
      }`}
    >
      {/* Row number */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
          isActive
            ? "bg-emerald-500 text-white"
            : "bg-zinc-800 text-zinc-400"
        }`}
      >
        {index + 1}
      </div>

      {/* 3 Slots */}
      <div className="flex items-start gap-3">
        {row.slots.map((slot, si) => (
          <TeamSlot
            key={`${row.id}-slot-${si}`}
            character={slot}
            onRemove={() => onRemoveChar(si)}
          />
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Delete row button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteRow();
        }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-all duration-200 hover:bg-red-950/50 hover:text-red-400"
        title="Hapus baris tim"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────
   BOSS ROSTER ICON
   ───────────────────────────────────── */

function BossIcon({
  boss,
  isSelected,
  onClick,
}: {
  boss: Boss;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={isSelected ? undefined : onClick}
      disabled={isSelected}
      className={`group relative flex flex-col items-center gap-1.5 rounded-lg p-1 transition-all duration-200 ${
        isSelected
          ? "cursor-not-allowed opacity-50 grayscale"
          : "cursor-pointer hover:scale-105 hover:bg-zinc-800/60"
      }`}
    >
      <div className={`relative flex h-16 w-16 items-center justify-center rounded-lg border-2 ${
        isSelected ? "border-emerald-500/50" : "border-cyan-500/30"
      } bg-gradient-to-b from-cyan-500/10 to-transparent transition-all duration-200 ${
        !isSelected ? "group-hover:border-cyan-500/70 group-hover:shadow-lg group-hover:shadow-cyan-500/10" : ""
      }`}>
        <Skull className="h-7 w-7 text-cyan-400/70" />
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-emerald-950/60">
            <Check className="h-5 w-5 text-emerald-400" />
          </div>
        )}
      </div>
      <span className={`max-w-[68px] truncate text-center text-[10px] leading-tight ${
        isSelected ? "text-emerald-400/70" : "text-zinc-400 group-hover:text-zinc-200"
      }`}>
        {boss.name}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────
   SELECTED BOSS ITEM
   ───────────────────────────────────── */

function SelectedBossItem({
  boss,
  onRemove,
}: {
  boss: Boss;
  onRemove: () => void;
}) {
  return (
    <div className="group relative flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-2 pr-8 transition-all duration-200 hover:border-cyan-800/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-950/30">
        <Skull className="h-5 w-5 text-cyan-400/80" />
      </div>
      <span className="text-xs font-medium text-zinc-300">{boss.name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-zinc-600 transition-all duration-200 hover:bg-red-950/60 hover:text-red-400"
        title="Hapus boss"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────── */

export default function PlannerPage() {
  const [activeMode, setActiveMode] = useState<Mode>("ToA");
  const [teams, setTeams] = useState<TeamRow[]>(() =>
    makeRows(DEFAULT_ROWS.ToA),
  );
  const [activeTeamIndex, setActiveTeamIndex] = useState<number | null>(null);
  const [selectedBosses, setSelectedBosses] = useState<Boss[]>([]);

  /* ── Checkout State ── */
  const [loginMethod, setLoginMethod] = useState("");
  const [server, setServer] = useState("");
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");

  /* ── Switch mode → reset teams ── */
  const switchMode = useCallback((mode: Mode) => {
    setActiveMode(mode);
    setTeams(makeRows(DEFAULT_ROWS[mode]));
    setActiveTeamIndex(null);
    setSelectedBosses([]);
  }, []);

  /* ── Vigor calculator ── */
  const vigorConfig = VIGOR_CONFIG[activeMode];

  const getRemainingVigor = useCallback(
    (charId: string) => {
      const used = countUsage(charId, teams);
      return Math.max(0, vigorConfig.max - used * vigorConfig.cost);
    },
    [teams, vigorConfig],
  );

  /* ── Disabled characters set ── */
  const disabledSet = useMemo(() => {
    const set = new Set<string>();
    for (const char of characters) {
      if (getRemainingVigor(char.id) <= 0) set.add(char.id);
    }
    return set;
  }, [getRemainingVigor]);

  /* ── Characters already in the active team ── */
  const charsInActiveTeam = useMemo(() => {
    const set = new Set<string>();
    if (activeTeamIndex !== null && teams[activeTeamIndex]) {
      for (const slot of teams[activeTeamIndex].slots) {
        if (slot) set.add(slot.id);
      }
    }
    return set;
  }, [activeTeamIndex, teams]);

  /* ── Is a team selected and does it have room? ── */
  const activeTeamHasRoom = useMemo(() => {
    if (activeTeamIndex === null) return false;
    const row = teams[activeTeamIndex];
    if (!row) return false;
    return row.slots.some((s) => s === null);
  }, [activeTeamIndex, teams]);

  /* ── Click handler: add character to selected team ── */
  const handleAddCharacter = useCallback(
    (character: Character) => {
      if (activeTeamIndex === null) return;
      const remaining = getRemainingVigor(character.id);
      if (remaining < vigorConfig.cost) return;

      setTeams((prev) => {
        const targetRow = prev[activeTeamIndex];
        if (!targetRow) return prev;

        // Prevent duplicate in same team
        if (targetRow.slots.some((slot) => slot?.id === character.id)) return prev;

        const newSlots = [...targetRow.slots] as TeamRow["slots"];
        const emptyIdx = newSlots.findIndex((s) => s === null);
        if (emptyIdx === -1) return prev;

        newSlots[emptyIdx] = character;
        return prev.map((row, i) =>
          i === activeTeamIndex ? { ...row, slots: newSlots } : row,
        );
      });
    },
    [activeTeamIndex, getRemainingVigor, vigorConfig.cost],
  );

  /* ── Click handler: remove character from slot ── */
  const handleRemoveCharacter = useCallback(
    (rowIndex: number, slotIndex: number) => {
      setTeams((prev) =>
        prev.map((row, ri) => {
          if (ri !== rowIndex) return row;
          const newSlots = [...row.slots] as TeamRow["slots"];
          newSlots[slotIndex] = null;
          return { ...row, slots: newSlots };
        }),
      );
    },
    [],
  );

  /* ── Delete entire row ── */
  const deleteRow = useCallback(
    (rowIndex: number) => {
      setTeams((prev) => prev.filter((_, i) => i !== rowIndex));
      setActiveTeamIndex((prev) => {
        if (prev === null) return null;
        if (prev === rowIndex) return null;
        if (prev > rowIndex) return prev - 1;
        return prev;
      });
    },
    [],
  );

  /* ── Add row (Matrix only) ── */
  const addRow = useCallback(() => {
    setTeams((prev) => [...prev, makeEmptyRow()]);
  }, []);

  /* ── Boss handlers (Hologram only) ── */
  const selectedBossIds = useMemo(
    () => new Set(selectedBosses.map((b) => b.id)),
    [selectedBosses],
  );

  const handleAddBoss = useCallback((boss: Boss) => {
    setSelectedBosses((prev) => {
      if (prev.some((b) => b.id === boss.id)) return prev;
      return [...prev, boss];
    });
  }, []);

  const handleRemoveBoss = useCallback((index: number) => {
    setSelectedBosses((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /* ── Checkout Handlers & Calculations ── */
  const calculatedExtraCost = useMemo(() => {
    let sTierCount = 0;
    teams.forEach((row) => {
      row.slots.forEach((char) => {
        if (char && char.tier === "S") sTierCount++;
      });
    });
    return `+${sTierCount * 5}%`; // Example logic: +5% per S tier character
  }, [teams]);

  const finalPrice = useMemo(() => {
    const basePrice = 100000;
    const extraPercent = parseInt(calculatedExtraCost.replace("+", "").replace("%", "")) || 0;
    return basePrice + (basePrice * extraPercent) / 100;
  }, [calculatedExtraCost]);

  const handleCheckout = useCallback(() => {
    const orderPayload = {
      mode: activeMode,
      teams: teams,
      hologramBosses: selectedBosses,
      extraCost: calculatedExtraCost,
      publicData: { email, uid, server, loginMethod, whatsapp },
      payment: selectedPayment,
    };
    console.log("Order Payload:", orderPayload);
    alert("Mempersiapkan Invoice...");
  }, [activeMode, teams, selectedBosses, calculatedExtraCost, email, uid, server, loginMethod, whatsapp, selectedPayment]);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ─── Page Header ─── */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
            Team Planner
          </h1>
          <p className="text-sm text-zinc-500">
            Atur komposisi tim untuk setiap mode permainan. Vigor berkurang
            setiap penempatan.
          </p>
        </div>

        {/* ─── Mode Tabs ─── */}
        <div className="flex flex-wrap gap-2">
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => switchMode(mode)}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeMode === mode
                  ? "bg-white text-zinc-900 shadow-lg shadow-white/5"
                  : "bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              {MODE_ICONS[mode]}
              {mode}
            </button>
          ))}
        </div>

        {/* ─── TACTICAL HOLOGRAM (Hologram only, above Character Roster) ─── */}
        {activeMode === "Hologram" && (
          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Tactical Hologram
                </h2>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Klik boss untuk menambahkan ke daftar target
                </p>
              </div>
              <span className="rounded-md bg-cyan-950/40 px-2.5 py-1 text-[10px] font-semibold text-cyan-400">
                {selectedBosses.length} Target
              </span>
            </div>

            <div className="space-y-5">
              {bossCategories.map((category) => {
                const bossesInCategory = mockBosses.filter((b) => b.category === category);
                return (
                  <div key={category}>
                    <h3 className="mb-3 border-b border-zinc-800 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                      {category}
                    </h3>
                    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
                      {bossesInCategory.map((boss) => (
                        <BossIcon
                          key={boss.id}
                          boss={boss}
                          isSelected={selectedBossIds.has(boss.id)}
                          onClick={() => handleAddBoss(boss)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── CHARACTER ROSTER ─── */}
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                Character Roster
              </h2>
              <p className="mt-1 text-[11px] text-zinc-600">
                {activeTeamIndex !== null
                  ? <>
                      Menambahkan ke <span className="font-semibold text-emerald-400">Tim {activeTeamIndex + 1}</span> — klik karakter untuk memilih
                    </>
                  : "Pilih tim di bawah terlebih dahulu"
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {activeTeamIndex === null && (
                <span className="flex items-center gap-1 rounded-md bg-amber-950/40 px-2.5 py-1 text-[10px] font-semibold text-amber-400">
                  <MousePointerClick className="h-3 w-3" />
                  Pilih tim dulu
                </span>
              )}
              {(activeMode === "ToA" || activeMode === "Matrix") && (
                <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-[10px] font-semibold text-zinc-500">
                  Max Vigor: {vigorConfig.max}
                </span>
              )}
            </div>
          </div>

          <div className={`grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 ${
            activeTeamIndex === null ? "pointer-events-none opacity-40" : ""
          }`}>
            {characters.map((char) => {
              const vigor = getRemainingVigor(char.id);
              const isDisabled = disabledSet.has(char.id) || !activeTeamHasRoom;
              const inTeam = charsInActiveTeam.has(char.id);
              return (
                <CharacterIcon
                  key={char.id}
                  char={char}
                  vigor={vigor}
                  maxVigor={vigorConfig.max}
                  disabled={isDisabled}
                  alreadyInTeam={inTeam}
                  showVigor={activeMode === "ToA" || activeMode === "Matrix"}
                  onClick={() => handleAddCharacter(char)}
                />
              );
            })}
          </div>
        </section>

        {/* ─── TARGET BOSS HOLOGRAM (Hologram only) ─── */}
        {activeMode === "Hologram" && selectedBosses.length > 0 && (
          <section className="rounded-2xl border border-cyan-900/40 bg-cyan-950/10 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  Target Boss Hologram
                </h2>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Daftar boss yang akan ditantang
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-[10px] font-semibold text-zinc-500">
                  {selectedBosses.length} Boss
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBosses([])}
                  className="flex items-center gap-1 rounded-md bg-red-950/40 px-2.5 py-1 text-[10px] font-semibold text-red-400 transition-all duration-200 hover:bg-red-950/70 hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                  Hapus Semua
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {selectedBosses.map((boss, idx) => (
                <SelectedBossItem
                  key={`${boss.id}-${idx}`}
                  boss={boss}
                  onRemove={() => handleRemoveBoss(idx)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ─── TEAMS & SCORES ─── */}
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                Teams &amp; Scores
              </h2>
              <p className="mt-1 text-[11px] text-zinc-600">
                Klik karakter di slot untuk menghapusnya
              </p>
            </div>
            <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-[10px] font-semibold text-zinc-500">
              {teams.length} Tim
            </span>
          </div>

          <div className="space-y-3">
            {teams.map((row, ri) => (
              <TeamRowComponent
                key={row.id}
                row={row}
                index={ri}
                isActive={activeTeamIndex === ri}
                onSelect={() => setActiveTeamIndex(activeTeamIndex === ri ? null : ri)}
                onRemoveChar={(si) => handleRemoveCharacter(ri, si)}
                onDeleteRow={() => deleteRow(ri)}
              />
            ))}
          </div>

          {/* Add Team — Matrix only */}
          {activeMode === "Matrix" && (
            <button
              type="button"
              onClick={addRow}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 py-3 text-sm font-semibold text-zinc-400 transition-all duration-200 hover:border-emerald-700 hover:bg-emerald-950/20 hover:text-emerald-400"
            >
              <Plus className="h-4 w-4" />
              + ADD TEAM
            </button>
          )}
        </section>

        {/* ─── CHECKOUT SECTION ─── */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <div className="mb-6 flex flex-col gap-1 border-b border-zinc-800/80 pb-4">
            <h2 className="text-lg font-bold text-white">Ringkasan Pesanan</h2>
            <p className="text-xs text-zinc-500">
              Periksa kembali konfigurasi pesanan Anda sebelum melanjutkan.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between rounded-lg bg-zinc-950/50 p-3 text-sm">
              <span className="text-zinc-400">Mode Terpilih</span>
              <span className="font-semibold text-zinc-200">{activeMode}</span>
            </div>

            {activeMode === "Hologram" && selectedBosses.length > 0 && (
              <div className="flex justify-between rounded-lg bg-zinc-950/50 p-3 text-sm">
                <span className="text-zinc-400">Target Boss</span>
                <span className="max-w-[200px] truncate text-right font-semibold text-zinc-200" title={selectedBosses.map((b) => b.name).join(", ")}>
                  {selectedBosses.map((b) => b.name).join(", ")}
                </span>
              </div>
            )}

            <div className="flex justify-between rounded-lg bg-zinc-950/50 p-3 text-sm">
              <span className="text-zinc-400">Kalkulasi Biaya Ekstra</span>
              <span className="font-semibold text-rose-400">{calculatedExtraCost}</span>
            </div>

            <div className="flex items-end justify-between rounded-lg bg-cyan-950/20 p-4 pt-6 text-sm border border-cyan-900/30">
              <span className="text-zinc-400">Total Harga Akhir</span>
              <span className="text-xl font-bold text-cyan-400">
                Rp {finalPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-800/80 pt-6">
            <h3 className="mb-4 text-sm font-semibold text-zinc-300">Data Akun & Kontak</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400">Platform Login</label>
                <select
                  value={loginMethod}
                  onChange={(e) => setLoginMethod(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-zinc-300 focus:border-cyan-700 focus:outline-none"
                >
                  <option value="" disabled>Pilih Platform</option>
                  <option value="Kuro Games">Kuro Games</option>
                  <option value="Google">Google</option>
                  <option value="X/Twitter">X/Twitter</option>
                  <option value="Apple">Apple</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400">Server</label>
                <select
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-zinc-300 focus:border-cyan-700 focus:outline-none"
                >
                  <option value="" disabled>Pilih Server</option>
                  <option value="SEA">SEA</option>
                  <option value="Asia">Asia</option>
                  <option value="America">America</option>
                  <option value="Europe">Europe</option>
                  <option value="HMT">HMT</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400">UID Akun</label>
                <input
                  type="text"
                  placeholder="Masukkan UID"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-cyan-700 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400">Email Akun</label>
                <input
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-cyan-700 focus:outline-none"
                />
              </div>

              <div className="col-span-1 flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs text-zinc-400">Nomor WhatsApp</label>
                <input
                  type="tel"
                  placeholder="awali dengan 62..."
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-cyan-700 focus:outline-none"
                />
              </div>
            </div>
            
            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-500/80">
              <Shield className="mt-0.5 h-3 w-3 shrink-0" />
              Demi keamanan, password hanya akan diminta melalui chat WhatsApp setelah pembayaran terverifikasi.
            </p>
          </div>

          <div className="mt-8 border-t border-zinc-800/80 pt-6">
            <h3 className="mb-4 text-sm font-semibold text-zinc-300">Metode Pembayaran</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={() => setSelectedPayment("QRIS")}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 ${
                  selectedPayment === "QRIS"
                    ? "border-cyan-500 bg-cyan-950/20 text-cyan-400"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                }`}
              >
                <QrCode className="h-6 w-6" />
                <span className="text-xs font-semibold">QRIS (Instant)</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedPayment("E-Wallet")}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 ${
                  selectedPayment === "E-Wallet"
                    ? "border-cyan-500 bg-cyan-950/20 text-cyan-400"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                }`}
              >
                <Smartphone className="h-6 w-6" />
                <span className="text-xs font-semibold">E-Wallet</span>
                <span className="text-[10px] text-zinc-500">GoPay, OVO, DANA</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPayment("VA")}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 ${
                  selectedPayment === "VA"
                    ? "border-cyan-500 bg-cyan-950/20 text-cyan-400"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900"
                }`}
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-xs font-semibold">Virtual Account</span>
                <span className="text-[10px] text-zinc-500">BCA, Mandiri, BNI, BRI</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            className="mt-6 w-full rounded-lg bg-zinc-100 py-4 font-bold text-zinc-950 transition-all duration-200 hover:bg-zinc-300"
          >
            Generate Invoice & Lanjut ke WA
          </button>
        </section>
      </div>
    </div>
  );
}
