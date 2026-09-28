export interface MainQuest {
  id: string;
  name: string;
  price: number;
}

export interface MainQuestRegion {
  region: string;
  quests: MainQuest[];
}

export const mainQuestsData: MainQuestRegion[] = [
  {
    "region": "Jinzhou",
    "quests": [
      { "id": "jz-01", "name": "Utterance of Marvels: Part 1", "price": 10000 },
      { "id": "jz-02", "name": "Utterance of Marvels: Part 2", "price": 10000 },
      { "id": "jz-03", "name": "Chapter I Act I", "price": 15000 },
      { "id": "jz-04", "name": "Chapter I Act II", "price": 15000 },
      { "id": "jz-05", "name": "Chapter I Act III", "price": 15000 },
      { "id": "jz-06", "name": "Chapter I Act IV", "price": 15000 },
      { "id": "jz-07", "name": "Chapter I Act V", "price": 15000 },
      { "id": "jz-08", "name": "Chapter I Act VI: Part I", "price": 15000 },
      { "id": "jz-09", "name": "Chapter I Act VI: Part II", "price": 15000 },
      { "id": "jz-10", "name": "Chapter I Segue: A New Companion", "price": 10000 },
      { "id": "jz-11", "name": "Chapter I Act VII", "price": 20000 },
      { "id": "jz-12", "name": "Chapter I Act VIII", "price": 20000 }
    ]
  },
  {
    "region": "Rinascita",
    "quests": [
      { "id": "rn-01", "name": "Chapter II Prologue", "price": 10000 },
      { "id": "rn-02", "name": "Chapter II Act I", "price": 15000 },
      { "id": "rn-03", "name": "Chapter II Act II", "price": 15000 },
      { "id": "rn-04", "name": "Chapter II Act III", "price": 15000 },
      { "id": "rn-05", "name": "Chapter II Act IV", "price": 15000 },
      { "id": "rn-06", "name": "Chapter II Act V", "price": 15000 },
      { "id": "rn-07", "name": "Chapter II Act VI", "price": 15000 },
      { "id": "rn-08", "name": "Chapter II Act VII", "price": 15000 },
      { "id": "rn-09", "name": "Chapter II Segue: Rust, Sword and the Sun", "price": 10000 },
      { "id": "rn-10", "name": "Chapter II Act VIII", "price": 20000 },
      { "id": "rn-11", "name": "Chapter II Act IX", "price": 20000 },
      { "id": "rn-12", "name": "Chapter II Act X", "price": 20000 },
      { "id": "rn-13", "name": "Chapter II Act XI", "price": 20000 },
      { "id": "rn-14", "name": "Chapter II Segue: A Stranger in a Strange Land", "price": 10000 },
      { "id": "rn-15", "name": "Chapter II Act XII", "price": 25000 },
      { "id": "rn-16", "name": "Chapter II Segue: Flowing Starlight in the Iris", "price": 10000 }
    ]
  },
  {
    "region": "Lahai-Roi",
    "quests": [
      { "id": "lr-01", "name": "Chapter III Prologue", "price": 10000 },
      { "id": "lr-02", "name": "Chapter III Act I", "price": 15000 },
      { "id": "lr-03", "name": "Chapter III Act II", "price": 15000 },
      { "id": "lr-04", "name": "Chapter III Act III", "price": 15000 },
      { "id": "lr-05", "name": "Chapter III Segue: All That Sunlight Touches", "price": 10000 },
      { "id": "lr-06", "name": "Chapter III Act IV", "price": 15000 },
      { "id": "lr-07", "name": "Chapter III Segue: Rabbit Reflected in Shades", "price": 10000 },
      { "id": "lr-08", "name": "Chapter III Segue: Whises in the Bell", "price": 10000 },
      { "id": "lr-09", "name": "Chapter III Act V", "price": 20000 },
      { "id": "lr-10", "name": "Chapter III Segue: Whises in the Bell Epilogue", "price": 10000 },
      { "id": "lr-11", "name": "Chapter III Segue: Beneath a Melting Night Sky", "price": 10000 },
      { "id": "lr-12", "name": "Chapter III Segue: We Choose the Sky", "price": 10000 }
    ]
  },
  {
    "region": "Mengzhou",
    "quests": [
      { "id": "mz-01", "name": "Chapter IV Act I", "price": 20000 },
      { "id": "mz-02", "name": "Chapter IV Act II", "price": 20000 },
      { "id": "mz-03", "name": "Chapter IV Segue: The Chant of Unseen Ties", "price": 10000 },
      { "id": "mz-04", "name": "Chapter IV Act III", "price": 25000 },
      { "id": "mz-05", "name": "Chapter IV Segue: The Nethermancer's Requiem", "price": 10000 }
    ]
  }
];
