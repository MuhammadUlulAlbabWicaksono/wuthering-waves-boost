export type AreaItem = string | { name: string; price: number };
export type RegionContent = AreaItem[] | Record<string, AreaItem[]>;
export type ExplorationData = Record<string, RegionContent>;

export const explorationData: ExplorationData = {
  "Huanglong": [
    "Central Plains", "Desorock Highland", "Dim Forest", "Gorges of Spirits", 
    "Jinzhou", "Mt.Firmament", "Norfall Barrens", "Port City of Guixu", 
    "Tiger's Maw", "Whining Aix's Mire", "Wuming Bay", "Eastern Xuan Peaks", 
    "Southern Yuan Hills", "Western Fang Peaks", "Xuanfang Hold"
  ],
  "Rinascita": [
    "Ragunna City", "Avinoleum", "Averado Vault", "Beohr Waters", 
    "Fabricatorium of the Deep", "Fagaceae Peninsula", "Hallowed Reach", 
    "Nimbus Sanctum", "Peniten's End", "Riccioli Islands", "Sanguis Plateaus", 
    "Septimont", "Thessaleo Fells", "Whisperwind Haven", "Vault Underground"
  ],
  "Lahai-Roi": {
    "Lahai-Roi": [
      "Bjartr Woods", "Etching Plains", "Fangspire Chasm", "Giant's Gaze", 
      "Mawburrow Desert", "Rebirth Uplands", "Stagnant Run", "Startoch Academy", "Starward Riseway"
    ],
    "Frostlands Surface": [
      "Frostlands Transit Port", "Mount Gjallar", "Starblind Crashsite", "Tidelost Forest", "Upphaf Forest Ruins"
    ],
    "Dimmr Plains": [
      "Dimmr Deep", "Sealed Fissure", "Silent Creg", "Solisia Landing"
    ]
  },
  "The Black Shores": [
    "Black Shore Archipelago", "Chronorift Metropolis", "Tethys' Deep"
  ]
};
