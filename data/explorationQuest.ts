export interface ExplorationQuestItem {
  name: string;
  astrite: number;
}

export const explorationQuestData: Record<string, ExplorationQuestItem[]> = {
  "Huanglong": [
    { name: "Stygian Lacrimosa", astrite: 100 },
    { name: "Glorious Loong's Pearl", astrite: 40 },
    { name: "Peak of the Arch-Shaped Rock", astrite: 30 },
    { name: "Where the Waterfalls Meet", astrite: 30 },
    { name: "Among the Shoals and Islands", astrite: 30 },
    { name: "Boundary of Yellow and White", astrite: 30 },
    { name: "Glorious Loong's Pearl: The Last Rite", astrite: 40 }, 
    { name: "Vigil of Endless Night", astrite: 80 }
  ],
  "Rinascita": [
    { name: "Shadow of The Towers: Twilight Rise", astrite: 30 },
    { name: "Shadow of The Towers: Resounding Rise", astrite: 30 },
    { name: "Shadow of The Towers: Command Rise", astrite: 40 },
    { name: "Where wind Returns to Celestial Realms", astrite: 40 },
    { name: "Hymn of the Sea of Clouds: Rainbow", astrite: 30 },
    { name: "Hymn of the Sea of Clouds: Storm", astrite: 30 },
    { name: "Silent as a Falling Leaf", astrite: 100 },
    { name: "Should the Shooting Stars Blaze", astrite: 30 },
    { name: "Where Sky is Clear and Glory Shines: Trial Grounds", astrite: 30 },
    { name: "Where Sky is Clear and Glory Shines: Guardian Tower", astrite: 50 },
    { name: "When the Sky Watches us Meet", astrite: 50 },
    { name: "Flames in the Deep", astrite: 40 }
  ],
  "Roya Frostlands": [
    { name: "The Song of Ice and Steel", astrite: 50 },
    { name: "Unfrozen Hope", astrite: 20 },
    { name: "Broken Dimmr Heart", astrite: 30 },
    { name: "A Perfect Day for Flying", astrite: 30 }
  ],
  "Mengzhou": [
    { name: "Faithful Heart Tes-tes at Skyfall", astrite: 100 },
    { name: "Autopuppets in Fog Veiled Chambers", astrite: 50 },
    { name: "Code Red: Corehazard", astrite: 100 }
  ]
};
