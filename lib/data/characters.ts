/**
 * MASTER DATA KARAKTER (Resonator) — dikelompokkan per Sonata/Elemen.
 *
 * Dipakai oleh:
 * - prisma/seed-characters.ts  → mengisi tabel `Character` di database
 * - app/dashboard/planner      → roster Team Planner (data statis client)
 *
 * Menu "Build Karakter" TIDAK membaca file ini secara langsung; ia mengambil
 * data dari tabel `Character` (lihat app/dashboard/page.tsx).
 */

export const ELEMENTS = ["Aero", "Electro", "Fusion", "Glacio", "Havoc", "Spectro"] as const;
/** Sonata utama / elemen. (Tidak dinamai `Element` agar tidak menimpa tipe DOM global.) */
export type Sonata = (typeof ELEMENTS)[number];

export type Character = {
  id: string;
  name: string;
  element: Sonata;
  rarity: 4 | 5;
};

/** Daftar karakter dari Planner, dipetakan berdasarkan Sonata utamanya. */
export const CHARACTERS_BY_ELEMENT: Record<Sonata, Omit<Character, "element">[]> = {
  Aero: [
    { id: "aalto", name: "Aalto", rarity: 4 },
    { id: "yangyang", name: "Yangyang", rarity: 4 },
    { id: "cartethyia", name: "Cartethyia", rarity: 5 },
    { id: "ciaccona", name: "Ciaccona", rarity: 5 },
    { id: "iuno", name: "Iuno", rarity: 5 },
    { id: "jianxin", name: "Jianxin", rarity: 5 },
    { id: "jiyan", name: "Jiyan", rarity: 5 },
    { id: "qingxiao", name: "Qingxiao", rarity: 5 },
    { id: "qiuyuan", name: "Qiuyuan", rarity: 5 },
    { id: "rover-aero", name: "Rover (Aero)", rarity: 5 },
    { id: "sigrika", name: "Sigrika", rarity: 5 },
  ],
  Electro: [
    { id: "buling", name: "Buling", rarity: 4 },
    { id: "lumi", name: "Lumi", rarity: 4 },
    { id: "yuanwu", name: "Yuanwu", rarity: 4 },
    { id: "augusta", name: "Augusta", rarity: 5 },
    { id: "calcharo", name: "Calcharo", rarity: 5 },
    { id: "hsin", name: "Hsin", rarity: 5 },
    { id: "rebecca", name: "Rebecca", rarity: 5 },
    { id: "rover-electro", name: "Rover (Electro)", rarity: 5 },
    { id: "suoming", name: "Suoming", rarity: 5 },
    { id: "xiangli-yao", name: "Xiangli Yao", rarity: 5 },
    { id: "yinlin", name: "Yinlin", rarity: 5 },
  ],
  Fusion: [
    { id: "chixia", name: "Chixia", rarity: 4 },
    { id: "mortefi", name: "Mortefi", rarity: 4 },
    { id: "aemeath", name: "Aemeath", rarity: 5 },
    { id: "brant", name: "Brant", rarity: 5 },
    { id: "changli", name: "Changli", rarity: 5 },
    { id: "denia", name: "Denia", rarity: 5 },
    { id: "encore", name: "Encore", rarity: 5 },
    { id: "galbrena", name: "Galbrena", rarity: 5 },
    { id: "jingran", name: "Jingran", rarity: 5 },
    { id: "lupa", name: "Lupa", rarity: 5 },
    { id: "mornye", name: "Mornye", rarity: 5 },
  ],
  Glacio: [
    { id: "baizhi", name: "Baizhi", rarity: 4 },
    { id: "sanhua", name: "Sanhua", rarity: 4 },
    { id: "youhu", name: "Youhu", rarity: 4 },
    { id: "carlotta", name: "Carlotta", rarity: 5 },
    { id: "hiyuki", name: "Hiyuki", rarity: 5 },
    { id: "lingyang", name: "Lingyang", rarity: 5 },
    { id: "lucilla", name: "Lucilla", rarity: 5 },
    { id: "suisui", name: "Suisui", rarity: 5 },
    { id: "zhezhi", name: "Zhezhi", rarity: 5 },
  ],
  Havoc: [
    { id: "danjin", name: "Danjin", rarity: 4 },
    { id: "taoqi", name: "Taoqi", rarity: 4 },
    { id: "camellya", name: "Camellya", rarity: 5 },
    { id: "cantarella", name: "Cantarella", rarity: 5 },
    { id: "chisa", name: "Chisa", rarity: 5 },
    { id: "phrolova", name: "Phrolova", rarity: 5 },
    { id: "roccia", name: "Roccia", rarity: 5 },
    { id: "rover-havoc", name: "Rover (Havoc)", rarity: 5 },
    { id: "yangyang-xuanling", name: "Yangyang Xuanling", rarity: 5 },
  ],
  Spectro: [
    { id: "jinhsi", name: "Jinhsi", rarity: 5 },
    { id: "lucy", name: "Lucy", rarity: 5 },
    { id: "luuk-herssen", name: "Luuk Herssen", rarity: 5 },
    { id: "lynae", name: "Lynae", rarity: 5 },
    { id: "phoebe", name: "Phoebe", rarity: 5 },
    { id: "rover-spectro", name: "Rover (Spectro)", rarity: 5 },
    { id: "shorekeeper", name: "The Shorekeeper", rarity: 5 },
    { id: "verina", name: "Verina", rarity: 5 },
    { id: "zani", name: "Zani", rarity: 5 },
  ],
};

/** Versi datar (flat) dari CHARACTERS_BY_ELEMENT. */
export const CHARACTERS: Character[] = ELEMENTS.flatMap((element) =>
  CHARACTERS_BY_ELEMENT[element].map((c) => ({ ...c, element })),
);

/** Path potret karakter di /public/image/character. */
export function characterImage(name: string) {
  return `/image/character/${name.toLowerCase().replace(/ /g, "-").replace(/[()]/g, "")}.webp`;
}

/** Path ikon Sonata di /public/icons/sonata (nama file diawali huruf kapital). */
export function elementIcon(element: Sonata) {
  return `/icons/sonata/${element}.webp`;
}
