"use client";

import { useState, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { Plus, X, User, Shield, Swords, Zap, Sparkles, Check, MousePointerClick, Skull, ShoppingCart, CreditCard, AlertTriangle, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { CHARACTERS_BY_ELEMENT, characterImage, type Sonata } from "@/lib/data/characters";

/* ─────────────────────────────────────
   TYPES & DATA
   ───────────────────────────────────── */

interface Character {
  id: string;
  name: string;
  tier: string;
  sonata: string;
  rarity: number;
  image?: string;
}

type SlotValue = Character | null;

interface TeamRow {
  id: string;
  slots: [SlotValue, SlotValue, SlotValue];
}

const modes = ["ToA", "Whiwa", "Matrix", "Hologram"] as const;
type Mode = (typeof modes)[number];

const MODE_ICONS: Record<Mode, React.ReactNode> = {
  ToA: <img src="/icons/ui%20icon/toa.webp" alt="ToA" className="h-5 w-5 object-contain" />,
  Whiwa: <img src="/icons/ui%20icon/whiwa.webp" alt="Whiwa" className="h-5 w-5 object-contain" />,
  Matrix: <img src="/icons/ui%20icon/matrix.webp" alt="Matrix" className="h-5 w-5 object-contain" />,
  Hologram: <img src="/icons/ui%20icon/tactical-hologram.webp" alt="Hologram" className="h-5 w-5 object-contain" />,
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

// Sumber data: lib/data/characters.ts (sama dengan seed tabel Character).
// Urutan tampilan roster Planner dipertahankan seperti sebelumnya.
const PLANNER_ELEMENT_ORDER: Sonata[] = ["Electro", "Havoc", "Spectro", "Fusion", "Aero", "Glacio"];

const characters: Character[] = PLANNER_ELEMENT_ORDER.flatMap((element) =>
  CHARACTERS_BY_ELEMENT[element].map((char) => ({
    id: char.id,
    name: char.name,
    sonata: element,
    rarity: char.rarity,
    tier: char.rarity === 5 ? "S" : "A",
    image: characterImage(char.name),
  })),
);

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
  { id: "tempest-mephis", name: "Tempest Mephis", category: "Tactical Hologram \"Calamity\"" },
  { id: "impermanence-heron", name: "Impermanence Heron", category: "Tactical Hologram \"Calamity\"" },
  { id: "mourning-aix", name: "Mourning Aix", category: "Tactical Hologram \"Calamity\"" },
  { id: "feilian-beringal", name: "Feilian Beringal", category: "Tactical Hologram \"Calamity\"" },
  { id: "crownless", name: "Crownless", category: "Tactical Hologram \"Calamity\"" },
  { id: "inferno-rider", name: "Inferno Rider", category: "Tactical Hologram \"Calamity\"" },
  // Tactical Hologram "Phantom Pain"
  { id: "fallacy-of-no-return", name: "Fallacy no Return", category: "Tactical Hologram \"Phantom Pain\"" },
  { id: "sentry-construct", name: "Sentry Construct", category: "Tactical Hologram \"Phantom Pain\"" },
  { id: "hecate", name: "Hecate", category: "Tactical Hologram \"Phantom Pain\"" },
  { id: "dragon-of-dirge", name: "Dragon of Dirge", category: "Tactical Hologram \"Phantom Pain\"" },
  { id: "fleurdelys", name: "Fleurdelys", category: "Tactical Hologram \"Phantom Pain\"" },
  { id: "lorelei", name: "Lorelei", category: "Tactical Hologram \"Phantom Pain\"" },
  { id: "nightmare-kelpie", name: "Nightmare: Kelpie", category: "Tactical Hologram \"Phantom Pain\"" },
  { id: "lady-of-the-sea", name: "Lady of the Sea", category: "Tactical Hologram \"Phantom Pain\"" },
  { id: "lioness-of-glory", name: "Lioness of Glory", category: "Tactical Hologram \"Phantom Pain\"" },
  { id: "the-false-sovereign", name: "The False Sovereign", category: "Tactical Hologram \"Phantom Pain\"" },
  // Tactical Hologram "Synchronization"
  { id: "dreamless", name: "Dreamless", category: "Tactical Hologram \"Synchronization\"" },
  { id: "hyvatia", name: "Hyvatia", category: "Tactical Hologram \"Synchronization\"" },
  { id: "sigillum", name: "Sigillum", category: "Tactical Hologram \"Synchronization\"" },
  { id: "nameless-explorer", name: "Nameless Explorer", category: "Tactical Hologram \"Synchronization\"" },
  { id: "reactor-husk", name: "Reactor Husk", category: "Tactical Hologram \"Synchronization\"" },
  // Tactical Hologram "Sparring"
  { id: "denia", name: "Denia", category: "Tactical Hologram \"Sparring\"" },
  { id: "myriad-snare-rustfire-chasiss", name: "Myriad Snare (Rustfire Chassis)", category: "Tactical Hologram \"Sparring\"" },
].map(boss => ({
  ...boss,
  imageUrl: `/image/boss/${boss.id}.webp`
}));

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
  const isBlocked = disabled || alreadyInTeam;
  const isRarity5 = char.rarity === 5;

  const bgStyle = isRarity5
    ? "bg-yellow-900/40 border-yellow-500"
    : "bg-purple-900/40 border-purple-500";

  const textStyle = isRarity5 ? "text-yellow-500" : "text-purple-400";

  return (
    <button
      type="button"
      onClick={isBlocked ? undefined : onClick}
      disabled={isBlocked}
      className={`group relative flex flex-col items-center gap-1.5 rounded-lg p-1 transition-all duration-200 ${isBlocked
        ? "cursor-not-allowed opacity-50 grayscale"
        : "cursor-pointer hover:scale-105 hover:bg-slate-100"
        }`}
    >
      {/* Icon box */}
      <div
        className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border-2 ${alreadyInTeam ? "border-emerald-500/50" : bgStyle
          } transition-all duration-200 ${!isBlocked ? "group-hover:shadow-lg" : ""
          }`}
      >
        {char.image ? (
          <Image
            src={char.image}
            alt={char.name}
            fill
            sizes="64px"
            className="object-cover rounded-[5px]"
          />
        ) : (
          <User className={`h-7 w-7 ${alreadyInTeam ? "text-emerald-400" : textStyle}`} />
        )}

        {/* Sonata (element) icon — top-left */}
        <div className="absolute top-0 left-0 z-10 flex h-4 w-4 items-center justify-center rounded-br-lg bg-zinc-900/95">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/icons/sonata/${char.sonata.toLowerCase()}.webp`}
            alt={char.sonata}
            className="h-4.5 w-4.5 object-contain opacity-90"
          />
        </div>

        {/* Already-in-team check */}
        {alreadyInTeam && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-emerald-950/60 z-20">
            <Check className="h-5 w-5 text-emerald-400" />
          </div>
        )}

      </div>

      {/* Name */}
      <span
        className={`max-w-[68px] truncate text-center text-[10px] leading-tight ${alreadyInTeam
          ? "text-emerald-400/70"
          : disabled
            ? "text-slate-500"
            : "text-slate-300 group-hover:text-white"
          }`}
      >
        {char.name}
      </span>

      {/* Vigor pill */}
      {showVigor && !alreadyInTeam && (
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide border ${vigor === 0
            ? "bg-red-950/40 text-red-400 border-red-900/50"
            : vigor < maxVigor
              ? "bg-amber-950/40 text-amber-400 border-amber-900/50"
              : "bg-emerald-950/40 text-emerald-400 border-emerald-900/50"
            }`}
        >
          {vigor}/{maxVigor}
        </span>
      )}
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
    const isRarity5 = character.rarity === 5;
    const bgStyle = isRarity5
      ? "bg-yellow-900/40 border-yellow-500"
      : "bg-purple-900/40 border-purple-500";
    const textStyle = isRarity5 ? "text-yellow-500" : "text-purple-400";

    return (
      <button
        type="button"
        onClick={onRemove}
        className={`group relative flex h-[72px] w-[72px] cursor-pointer items-center justify-center rounded-xl border-2 ${bgStyle} transition-all duration-200 hover:border-red-500/70 hover:shadow-lg hover:shadow-red-500/10`}
      >
        {character.image ? (
          <Image
            src={character.image}
            alt={character.name}
            fill
            sizes="72px"
            className="object-cover rounded-[8px]"
          />
        ) : (
          <User className={`h-8 w-8 ${textStyle}`} />
        )}

        {/* Name label */}
        <span className="absolute -bottom-5 max-w-[72px] truncate text-center text-[10px] font-medium text-slate-300">
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
    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-xl border-2 border-dashed border-slate-600/60 bg-slate-800/50 transition-colors">
      <Plus className="h-5 w-5 text-slate-400" />
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
      className={`group/row flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-4 transition-all duration-200 sm:gap-5 ${isActive
        ? "border-emerald-500/50 bg-emerald-950/20 ring-1 ring-emerald-500/20"
        : "border-slate-700/60 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/80"
        }`}
    >
      {/* Row number */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors ${isActive
          ? "bg-emerald-500 text-white"
          : "bg-slate-700 text-slate-300"
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
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-red-950/50 hover:text-red-400"
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
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={isSelected ? undefined : onClick}
      disabled={isSelected}
      className={`group relative flex flex-col items-center gap-1.5 rounded-lg p-1 transition-all duration-200 ${isSelected
        ? "cursor-not-allowed opacity-50 grayscale"
        : "cursor-pointer hover:scale-105 hover:bg-slate-100"
        }`}
    >
      <div className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border-2 ${isSelected ? "border-emerald-500/50" : "border-cyan-500/30"
        } bg-gradient-to-b from-cyan-500/10 to-transparent transition-all duration-200 ${!isSelected ? "group-hover:border-cyan-500/70 group-hover:shadow-lg group-hover:shadow-cyan-500/10" : ""
        }`}>
        {boss.imageUrl && !imgError ? (
          <img
            src={boss.imageUrl}
            alt={boss.name}
            className="w-full h-full object-cover drop-shadow-md"
            onError={() => setImgError(true)}
          />
        ) : (
          <Skull className="h-7 w-7 text-cyan-400/70" />
        )}
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-emerald-950/60">
            <Check className="h-5 w-5 text-emerald-400" />
          </div>
        )}
      </div>
      <span className={`max-w-[68px] truncate text-center text-[10px] leading-tight ${isSelected ? "text-emerald-400" : "text-slate-200 group-hover:text-white"
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
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2 pr-8 transition-all duration-200 hover:border-cyan-800/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-cyan-500/30 bg-cyan-950/30">
        {boss.imageUrl && !imgError ? (
          <img
            src={boss.imageUrl}
            alt={boss.name}
            className="w-full h-full object-cover drop-shadow-md"
            onError={() => setImgError(true)}
          />
        ) : (
          <Skull className="h-5 w-5 text-cyan-400/80" />
        )}
      </div>
      <span className="text-xs font-medium text-slate-700">{boss.name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-all duration-200 hover:bg-red-950/60 hover:text-red-400"
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

function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab");
  const initialMode = modes.find((m) => m.toLowerCase() === tabParam?.toLowerCase()) || "ToA";

  const [activeMode, setActiveMode] = useState<Mode>(initialMode as Mode);
  const [teams, setTeams] = useState<TeamRow[]>(() =>
    makeRows(DEFAULT_ROWS[initialMode as Mode]),
  );
  const [activeTeamIndex, setActiveTeamIndex] = useState<number | null>(null);
  const [selectedBosses, setSelectedBosses] = useState<Boss[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");

  /* ── Account Info Form State ── */
  const [loginMethod, setLoginMethod] = useState("Kuro Games");
  const [accountEmail, setAccountEmail] = useState("");
  const [server, setServer] = useState("");

  /* ── Payment Method State ── */
  const PAYMENT_METHODS = ["QRIS", "E-Wallet", "Virtual Account", "Transfer Bank"] as const;
  type PaymentMethod = (typeof PAYMENT_METHODS)[number];
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");

  /* ── Confirmation Modal State ── */
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormComplete = loginMethod && accountEmail && server && paymentMethod;

  /* ── Price Calculation ── */
  const MODE_PRICES: Record<Mode, number> = {
    ToA: 75000,
    Whiwa: 60000,
    Matrix: 50000,
    Hologram: 100000,
  };

  const filledTeamCount = useMemo(() => {
    return teams.filter((row) => row.slots.some((s) => s !== null)).length;
  }, [teams]);

  const estimatedPrice = useMemo(() => {
    const base = MODE_PRICES[activeMode];
    const teamMultiplier = Math.max(1, filledTeamCount);
    const bossExtra = activeMode === "Hologram" ? selectedBosses.length * 25000 : 0;
    return base * teamMultiplier + bossExtra;
  }, [activeMode, filledTeamCount, selectedBosses.length]);

  /* ── Order Summary Items ── */
  const orderSummaryItems = useMemo(() => {
    const items: { label: string; detail: string }[] = [];
    const productName = `Joki End-Game: ${activeMode}${activeMode === "Hologram" && selectedBosses.length > 0 ? ` (${selectedBosses.length} Boss)` : ""} — ${filledTeamCount} Tim`;
    items.push({ label: "Item Pembelian", detail: productName });
    items.push({ label: "Kategori", detail: "End-Game" });
    items.push({ label: "Jumlah", detail: "1" });
    if (server) items.push({ label: "Server", detail: server });
    return items;
  }, [activeMode, filledTeamCount, selectedBosses, server]);

  /* ── Handle Checkout Validation ── */
  const handleCheckout = () => {
    if (!activeMode) {
      toast.error("Pilih jasa joki terlebih dahulu");
      return;
    }
    if (filledTeamCount === 0) {
      toast.error("Atur komposisi tim di Team Planner terlebih dahulu");
      return;
    }
    if (!accountEmail || !loginMethod || !server) {
      toast.error("Lengkapi informasi akun terlebih dahulu");
      return;
    }
    if (!paymentMethod) {
      toast.error("Pilih metode pembayaran terlebih dahulu");
      return;
    }

    // All validated
    handleOpenConfirm();
  };

  /* ── Handle Open Confirm Modal ── */
  const handleOpenConfirm = () => {
    setIsConfirmOpen(true);
  };

  /* ── Handle Confirm Purchase ── */
  const handleConfirmPurchase = async () => {
    setIsSubmitting(true);
    try {
      const productName = `Joki End-Game: ${activeMode}${activeMode === "Hologram" && selectedBosses.length > 0 ? ` (${selectedBosses.length} Boss)` : ""} — ${filledTeamCount} Tim`;
      const payload = {
        customerInfo: { loginMethod, accountEmail, server },
        mode: "End-Game",
        productName: productName,
        teams: teams.map((row) => row.slots.filter(Boolean).map((c) => c!.name)),
        bosses: selectedBosses.map((b) => b.name),
        paymentMethod,
        totalAmount: estimatedPrice,
      };

      const res = await fetch("/api/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.orderId) {
        setIsConfirmOpen(false);
        router.push(`/invoice/${data.orderId}`);
      }
    } catch (err) {
      console.error("Failed to create invoice:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Switch mode → reset teams ── */
  const switchMode = useCallback((mode: Mode) => {
    setActiveMode(mode);
    setTeams(makeRows(DEFAULT_ROWS[mode]));
    setActiveTeamIndex(null);
    setSelectedBosses([]);
    router.replace(`${pathname}?tab=${mode.toLowerCase()}`, { scroll: false });
  }, [pathname, router]);

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

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/image/background/background.png')" }}
    >
      {/* Overlay Background */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 pt-24 pb-32 lg:px-8 lg:pt-28 lg:pb-36">
        {/* ─── Page Header ─── */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md lg:text-3xl">
            Team Planner
          </h1>
          <p className="text-sm text-slate-200">
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
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${activeMode === mode
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/50"
                }`}
            >
              {MODE_ICONS[mode]}
              {mode}
            </button>
          ))}
        </div>

        {/* ─── TACTICAL HOLOGRAM (Hologram only, above Character Roster) ─── */}
        {activeMode === "Hologram" && (
          <section className="rounded-2xl border border-slate-700/60 bg-slate-900/85 shadow-2xl shadow-black/50 text-white p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-white font-bold uppercase tracking-wide">
                  Tactical Hologram
                </h2>
                <p className="mt-1 text-[11px] text-slate-400">
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
                    <h3 className="mb-3 border-b border-slate-700/60 pb-2 text-[11px] font-bold uppercase tracking-wider text-white">
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
        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/85 shadow-2xl shadow-black/50 text-white p-5 backdrop-blur-sm">
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-100">
                Character Roster
              </h2>
              <p className="mt-1 text-[11px] text-slate-400">
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
                <span className="rounded-md bg-amber-500/20 px-2.5 py-1 text-[10px] font-semibold text-amber-400">
                  Max Vigor: {vigorConfig.max}
                </span>
              )}
            </div>
          </div>

          {/* Elements Filter Tabs */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { name: 'All', icon: null },
              { name: 'Electro', icon: '/icons/sonata/Electro.webp' },
              { name: 'Havoc', icon: '/icons/sonata/Havoc.webp' },
              { name: 'Spectro', icon: '/icons/sonata/Spectro.webp' },
              { name: 'Fusion', icon: '/icons/sonata/Fusion.webp' },
              { name: 'Aero', icon: '/icons/sonata/Aero.webp' },
              { name: 'Glacio', icon: '/icons/sonata/Glacio.webp' }
            ].map((filter) => (
              <button
                key={filter.name}
                type="button"
                onClick={() => setActiveFilter(filter.name)}
                className={`flex items-center justify-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 border ${activeFilter === filter.name
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30"
                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/50"
                  }`}
              >
                {filter.icon && (
                  <img
                    src={filter.icon}
                    alt={`${filter.name} icon`}
                    className="-ml-1.5 w-8 h-8 object-contain opacity-90"
                  />
                )}
                <span>{filter.name}</span>
              </button>
            ))}
          </div>

          <div className={`grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 ${activeTeamIndex === null ? "pointer-events-none opacity-40" : ""
            }`}>
            {characters
              .filter(char => activeFilter === "All" || char.sonata === activeFilter)
              .map((char) => {
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
                <p className="mt-1 text-[11px] text-slate-400">
                  Daftar boss yang akan ditantang
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
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
        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/85 shadow-2xl shadow-black/50 text-white p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-white font-bold tracking-wide uppercase">
                Teams &amp; Scores
              </h2>
              <p className="mt-1 text-[11px] text-slate-400">
                Klik karakter di slot untuk menghapusnya
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
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
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-emerald-700 hover:bg-emerald-950/20 hover:text-emerald-400"
            >
              <Plus className="h-4 w-4" />
              + ADD TEAM
            </button>
          )}
        </section>

        {/* ─── INFORMASI AKUN ─── */}
        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/85 shadow-2xl shadow-black/50 text-white p-6">
          <h2 className="text-white font-bold tracking-wide flex items-center gap-2 mb-4 uppercase">
            <User className="h-4 w-4" />
            Informasi Akun
          </h2>
          <p className="mt-1 text-[11px] text-slate-400 mb-6">
            Masukkan data akun game Anda untuk proses joki
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Metode Login</label>
              <div className="relative">
                <select
                  value={loginMethod}
                  onChange={(e) => setLoginMethod(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 pr-8 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="Kuro Games">Kuro Games</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Akun</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Server</label>
              <div className="relative">
                <select
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 pr-8 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="">Pilih Server...</option>
                  <option value="SEA">SEA</option>
                  <option value="ASIA">ASIA</option>
                  <option value="AMERICA">AMERICA</option>
                  <option value="EUROPE">EUROPE</option>
                  <option value="HK-MO-TW">HK-MO-TW</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── METODE PEMBAYARAN ─── */}
        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/85 shadow-2xl shadow-black/50 text-white p-6">
          <h2 className="text-white font-bold tracking-wide flex items-center gap-2 mb-4 uppercase">
            <CreditCard className="h-4 w-4" />
            Metode Pembayaran
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["QRIS", "E-Wallet", "Virtual Account", "Transfer Bank"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-all duration-200 ${paymentMethod === method
                  ? "border-blue-500 bg-blue-600/20 text-blue-400 shadow-sm"
                  : "border-slate-700/50 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:bg-slate-700"
                  }`}
              >
                <CreditCard className={`h-6 w-6 ${paymentMethod === method ? "text-blue-500" : "text-slate-400"}`} />
                {method}
              </button>
            ))}
          </div>
        </section>

        {/* ─── STICKY FOOTER NAVIGASI PESANAN ─── */}
      </div>

      <div className="fixed bottom-0 left-0 w-full z-50 bg-blue-700 py-3 shadow-[0_-4px_10px_rgba(0,0,0,0.4)]">
        {/* Container Tengah: Membatasi lebar konten agar tidak mentok kiri-kanan */}
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between px-6">

          {/* Bagian Kiri: Info Pesanan & Harga */}
          <div className="flex flex-col">
            <span className="text-slate-200 text-sm font-medium">
              Paket: <span className="font-semibold text-white">{activeMode} {activeMode === "Hologram" && selectedBosses.length > 0 ? `(${selectedBosses.length} Boss)` : ""}</span>
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-200 text-sm">Total:</span>
              {/* Pastikan nominal harga berwarna putih terang dan tebal */}
              <span className="text-white text-xl font-extrabold tracking-wide">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(estimatedPrice)}
              </span>
            </div>
          </div>

          {/* Bagian Kanan: Tombol Action */}
          <button
            type="button"
            onClick={handleCheckout}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-2.5 rounded-md transition-colors flex items-center gap-2"
          >
            Order Sekarang!
          </button>
        </div>
      </div>

      {/* ─── MODAL KONFIRMASI ORDER ─── */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                KONFIRMASI ORDER
              </h3>
              <button type="button" onClick={() => setIsConfirmOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Order Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Ringkasan Pesanan</h4>
                <div className="rounded-lg border border-slate-200 bg-slate-50 divide-y divide-slate-200">
                  {orderSummaryItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm text-slate-600">{item.label}</span>
                      <span className="text-sm font-semibold text-slate-800">{item.detail}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-slate-600">Metode Pembayaran</span>
                    <span className="text-sm font-semibold text-blue-600">{paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
                <span className="text-sm font-semibold text-slate-700">Total Pembayaran</span>
                <span className="text-xl font-bold text-blue-700">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(estimatedPrice)}</span>
              </div>

              {/* T&C Warning */}
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Dengan menekan &quot;BELI SEKARANG&quot;, Anda menyetujui <span className="font-semibold underline cursor-pointer">Syarat &amp; Ketentuan</span> layanan kami. Proses joki akan dimulai setelah pembayaran berhasil dikonfirmasi. Tidak ada pengembalian dana setelah proses dimulai.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 bg-white py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  BATAL
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      BELI SEKARANG
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        Loading...
      </div>
    }>
      <PlannerContent />
    </Suspense>
  );
}
