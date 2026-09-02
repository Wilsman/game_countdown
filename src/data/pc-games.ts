export interface PcGame {
  id: string;
  title: string;
  image: string;
  publisher: string;
  developer: string;
  releaseDate: string;
  targetDate: string;
  dateType: 'exact' | 'approx' | 'tba';
  platforms: string[];
  hype: number;
}

export const pcGames: PcGame[] = [
  {
    "id": "game-129",
    "title": "The Blood of Dawnwalker",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1776185417/tbod_kbithi.webp",
    "publisher": "Bandai Namco",
    "developer": "Rebel Wolves",
    "releaseDate": "2026-09-03",
    "targetDate": "2026-09-03T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 16
  },
  {
    "id": "game-54",
    "title": "Halloween",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1768898863/h_hy1kje.webp",
    "publisher": "IllFonic Publishing",
    "developer": "IllFonic",
    "releaseDate": "2026-09-08",
    "targetDate": "2026-09-08T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 6
  },
  {
    "id": "game-239",
    "title": "RuneScape: Dragonwilds",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1782644667/runescape_aeasdl.webp",
    "publisher": "Jagex",
    "developer": "Jagex: The RuneScape Company",
    "releaseDate": "2026-09-15",
    "targetDate": "2026-09-15T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 16
  },
  {
    "id": "game-71",
    "title": "SILENT HILL: Townfall",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1771234890/slt_d5djdt.jpg",
    "publisher": "KONAMI",
    "developer": "Screen Burn",
    "releaseDate": "2026-09-24",
    "targetDate": "2026-09-24T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation"
    ],
    "hype": 7
  },
  {
    "id": "game-40",
    "title": "Control Resonant",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1765529891/control2_fw0is4.webp",
    "publisher": "Remedy Entertainment",
    "developer": "Remedy Entertainment",
    "releaseDate": "2026-09-24",
    "targetDate": "2026-09-24T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation"
    ],
    "hype": 6
  },
  {
    "id": "game-236",
    "title": "HOT WHEELS Infinite Rush",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1782644667/hwir_fj46in.webp",
    "publisher": "Milestone S.r.l.",
    "developer": "Milestone S.r.l.",
    "releaseDate": "2026-09-24",
    "targetDate": "2026-09-24T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 16
  },
  {
    "id": "game-20",
    "title": "Onimusha: Way of the Sword",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1764753165/onimusha_pw1dun.webp",
    "publisher": "Capcom",
    "developer": "Capcom",
    "releaseDate": "2026-09-25",
    "targetDate": "2026-09-25T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 5
  },
  {
    "id": "game-102",
    "title": "MINECRAFT DUNGEONS II",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1774113910/md2_xtiynh.webp",
    "publisher": "Mojang Studios",
    "developer": "Mojang Studios",
    "releaseDate": "2026-09-29",
    "targetDate": "2026-09-29T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 5
  },
  {
    "id": "game-182",
    "title": "Rayman Legends Retold",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1780470753/rlr_oacyq9.webp",
    "publisher": "Ubisoft",
    "developer": "Ubisoft",
    "releaseDate": "2026-10-01",
    "targetDate": "2026-10-01T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 3
  },
  {
    "id": "game-206",
    "title": "End of Abyss",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1780736840/eoa_ksijfd.webp",
    "publisher": "Epic Games",
    "developer": "Section 9 Interactive",
    "releaseDate": "2026-10-01",
    "targetDate": "2026-10-01T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 0
  },
  {
    "id": "game-75",
    "title": "ACE COMBAT 8: WINGS OF THEVE",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1771492631/ac8_vteuyh.webp",
    "publisher": "Bandai Namco",
    "developer": "Bandai Namco Aces",
    "releaseDate": "2026-10-02",
    "targetDate": "2026-10-02T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 3
  },
  {
    "id": "game-207",
    "title": "Star Wars Galactic Racer",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1780736857/stgr_fcmrde.webp",
    "publisher": "Lucasfilm Games",
    "developer": "Fuse Games",
    "releaseDate": "2026-10-06",
    "targetDate": "2026-10-06T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 6
  },
  {
    "id": "game-109",
    "title": "Gears of War: E-Day",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1774690015/gofed_bpcat2.webp",
    "publisher": "Xbox Game Studios",
    "developer": "The Coalition",
    "releaseDate": "2026-10-06",
    "targetDate": "2026-10-06T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "xbox"
    ],
    "hype": 4
  },
  {
    "id": "game-242",
    "title": "Dragon's Dogma 2: Dark Arisen",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1782644667/dragondogma2_bzot8l.webp",
    "publisher": "Capcom",
    "developer": "Capcom",
    "releaseDate": "2026-10-09",
    "targetDate": "2026-10-09T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 17
  },
  {
    "id": "game-194",
    "title": "Planet Zoo 2",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1780401733/pz2_qjnhpx.webp",
    "publisher": "Frontier Developments",
    "developer": "Frontier Developments",
    "releaseDate": "2026-10-13",
    "targetDate": "2026-10-13T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 4
  },
  {
    "id": "game-149",
    "title": "Valor Mortis",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1778402728/vm_whu3dw.webp",
    "publisher": "Lyrical Games",
    "developer": "One More Level",
    "releaseDate": "2026-10-13",
    "targetDate": "2026-10-13T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 2
  },
  {
    "id": "game-69",
    "title": "Castlevania: Belmont's Curse",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1771153351/c_ex45pz.webp",
    "publisher": "KONAMI",
    "developer": "Evil Empire",
    "releaseDate": "2026-10-15",
    "targetDate": "2026-10-15T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 3
  },
  {
    "id": "game-232",
    "title": "FINAL FANTASY RESONANCE",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1781077286/ffr_prazsn.webp",
    "publisher": "Square Enix",
    "developer": "Square Enix",
    "releaseDate": "2026-10-22",
    "targetDate": "2026-10-22T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 10
  },
  {
    "id": "game-132",
    "title": "Call Of Duty: Modern Warfare 4",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1780133704/codmw4_pmqdvv.webp",
    "publisher": "Activision",
    "developer": "Infinity Ward",
    "releaseDate": "2026-10-23",
    "targetDate": "2026-10-23T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 18
  },
  {
    "id": "game-227",
    "title": "ONE PIECE: Grand Gourmet",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1781077286/opgg_cguiai.webp",
    "publisher": "Bandai Namco",
    "developer": "Kairosoft",
    "releaseDate": "2026-10-23",
    "targetDate": "2026-10-23T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "mobile",
      "nintendo-switch"
    ],
    "hype": 6
  },
  {
    "id": "game-105",
    "title": "Phantom Blade Zero",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1774595387/pb_y1tbci.webp",
    "publisher": "S-GAME Publishing",
    "developer": "S-GAME Studio",
    "releaseDate": "2026-10-29",
    "targetDate": "2026-10-29T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation"
    ],
    "hype": 6
  },
  {
    "id": "game-237",
    "title": "DRAGON QUEST MONSTERS: The Withered World",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1782644667/dqm_rowuxq.webp",
    "publisher": "Square Enix",
    "developer": "Square Enix",
    "releaseDate": "2026-12-03",
    "targetDate": "2026-12-03T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 15
  },
  {
    "id": "game-50",
    "title": "Silksong - Sea of Sorrow",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1767949993/sos_muatxr.webp",
    "publisher": "Team Cherry",
    "developer": "Team Cherry",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 18
  },
  {
    "id": "game-39",
    "title": "ONTOS",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1765529666/ontos_gjwvcg.webp",
    "publisher": "Frictional Games",
    "developer": "Frictional Games",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 1
  },
  {
    "id": "game-87",
    "title": "Kena: Scars of Kosmora",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1773218128/kena_njzhbz.webp",
    "publisher": "PlayStation Publishing",
    "developer": "Ember Lab",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation"
    ],
    "hype": 5
  },
  {
    "id": "game-66",
    "title": "Enter the Gungeon 2",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1770976494/etg2_yezegv.webp",
    "publisher": "Devolver Digital",
    "developer": "Dodge Roll",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "nintendo-switch"
    ],
    "hype": 3
  },
  {
    "id": "game-9",
    "title": "Warhammer 40K: Boltgun 2",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1764144033/w40k-b2_kelkip.webp",
    "publisher": "Devolver Digital",
    "developer": "Auroch Digital",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 2
  },
  {
    "id": "game-83",
    "title": "BrokenLore: ASCEND",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1773034434/ba_co7xts.webp",
    "publisher": "Serafini Productions",
    "developer": "Serafini Productions",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 1
  },
  {
    "id": "game-108",
    "title": "SPINE - This is Gun Fu",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1774690016/s_ka7xpj.webp",
    "publisher": "Nekki",
    "developer": "Nekki",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 2
  },
  {
    "id": "game-119",
    "title": "Turok: Origins",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1775458719/to_rzjjtd.webp",
    "publisher": "Saber Interactive",
    "developer": "Saber Interactive",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 2
  },
  {
    "id": "game-124",
    "title": "Outward 2",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1776185400/o2_rkoqhg.webp",
    "publisher": "Nine Dots Publishing",
    "developer": "Nine Dots Studio",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 2
  },
  {
    "id": "game-142",
    "title": "Mariachi Legends",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1777363100/ml_qaxjjs.webp",
    "publisher": "Halberd Studios",
    "developer": "Halberd Studios",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 0
  },
  {
    "id": "game-143",
    "title": "Shadowman: Darque Legacy",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1777363099/sdl_ot7rz5.webp",
    "publisher": "Blowfish Studios",
    "developer": "Blowfish Studios",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 1
  },
  {
    "id": "game-144",
    "title": "Acts of Blood",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1777363099/aob_oiumro.webp",
    "publisher": "Eksil Team",
    "developer": "Eksil Team",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows"
    ],
    "hype": 2
  },
  {
    "id": "game-145",
    "title": "Tears of Metal",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1777363099/tom_bnwjmz.webp",
    "publisher": "Paper Cult",
    "developer": "Paper Cult",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "xbox"
    ],
    "hype": 1
  },
  {
    "id": "game-146",
    "title": "Warhammer 40K: Mechanicus II",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1777363100/w40km2_kjjusu.webp",
    "publisher": "Kasedo Games",
    "developer": "Bulwark Studios",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 2
  },
  {
    "id": "game-148",
    "title": "The Relic: First Guardian",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1777363100/trfg_nnvzb4.webp",
    "publisher": "Perp Games",
    "developer": "Project Cloud Games",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 1
  },
  {
    "id": "game-126",
    "title": "Professor Layton and The New World of Steam",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1776185411/platnwos_h4tdnu.webp",
    "publisher": "Level-5",
    "developer": "Level-5",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 3
  },
  {
    "id": "game-130",
    "title": "Neo Berlin 2087",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1776185400/nb_aynrwk.webp",
    "publisher": "Elysium Game Studio",
    "developer": "Elysium Game Studio",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 1
  },
  {
    "id": "game-151",
    "title": "Broken Sword - Parzival's Stone",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1778402727/bsps_h2ddsq.webp",
    "publisher": "Revolution Software Ltd",
    "developer": "Revolution Software Ltd",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "mobile",
      "nintendo-switch"
    ],
    "hype": 2
  },
  {
    "id": "game-152",
    "title": "Tenet of the Spark",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1778402727/tofs_cjhxxd.webp",
    "publisher": "ROAR GAMES",
    "developer": "ROAR GAMES",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 1
  },
  {
    "id": "game-153",
    "title": "DREADMOOR",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1778402727/dreadmor_tuzhqh.webp",
    "publisher": "Digital Vortex Entertainment",
    "developer": "Dream Dock",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows"
    ],
    "hype": 1
  },
  {
    "id": "game-154",
    "title": "Forever Ago",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1778402728/fa_y9g2ii.webp",
    "publisher": "Annapurna Interactive",
    "developer": "Third Shift",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 1
  },
  {
    "id": "game-156",
    "title": "Exoborne",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1778402728/exoborne_jdcid5.webp",
    "publisher": "Sharkmob AB",
    "developer": "Sharkmob AB",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 2
  },
  {
    "id": "game-157",
    "title": "Kingmakers",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1778402728/kingmakers_fwc8ln.webp",
    "publisher": "tinyBuild",
    "developer": "Redemption Road",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 3
  },
  {
    "id": "game-159",
    "title": "Lords of the Fallen II",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1778402728/lotf2_re2kw6.webp",
    "publisher": "CI Games",
    "developer": "CI Games",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 2
  },
  {
    "id": "game-160",
    "title": "Chrono Odyssey",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1778402727/co_ligujc.webp",
    "publisher": "Kakao Games",
    "developer": "Chrono Studio",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 2
  },
  {
    "id": "game-162",
    "title": "Witchbrook",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1778402729/witchbrook_yqzuex.webp",
    "publisher": "Chucklefish",
    "developer": "Chucklefish",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 3
  },
  {
    "id": "game-170",
    "title": "The Sinking City 2",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1779175153/tsc_agwmyp.webp",
    "publisher": "Frogwares",
    "developer": "Frogwares",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 2
  },
  {
    "id": "game-171",
    "title": "He-Man and the Masters of the Universe: Dragon Pearl of Destruction",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1779175152/motu_jduaas.webp",
    "publisher": "Limited Run Games",
    "developer": "Bitmap Bureau",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 1
  },
  {
    "id": "game-174",
    "title": "Neverway",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1779175152/neverway_f7pvje.webp",
    "publisher": "Coldblood",
    "developer": "Coldblood",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "nintendo-switch"
    ],
    "hype": 1
  },
  {
    "id": "game-175",
    "title": "Human Fall Flat 2",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1779175152/hff2_ct4nrc.webp",
    "publisher": "Devolver Digital",
    "developer": "No Brakes Games",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 2
  },
  {
    "id": "game-177",
    "title": "The CUBE",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1779175153/tc_nsusdu.webp",
    "publisher": "Mundfish",
    "developer": "Mundfish",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 2
  },
  {
    "id": "game-190",
    "title": "Raji: Kaliyuga",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1780401733/rky_xg0knu.webp",
    "publisher": "Nodding Heads Games",
    "developer": "Nodding Heads Games",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 1
  },
  {
    "id": "game-192",
    "title": "Loulan: The Cursed Sand",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1780401732/loulan_qhs3li.webp",
    "publisher": "ChillyRoom",
    "developer": "ChillyRoom",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation"
    ],
    "hype": 0
  },
  {
    "id": "game-193",
    "title": "EMPULSE",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1780401733/empulse_jtfguw.webp",
    "publisher": "1047 Games",
    "developer": "1047 Games",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 0
  },
  {
    "id": "game-195",
    "title": "The Twilight Project",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1780401747/ttp_pxuj28.webp",
    "publisher": "Teapot studio",
    "developer": "Teapot studio",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows"
    ],
    "hype": 0
  },
  {
    "id": "game-196",
    "title": "Project Rabbit",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1780401733/pr_z648dg.webp",
    "publisher": "novaflare",
    "developer": "novaflare",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows"
    ],
    "hype": 0
  },
  {
    "id": "game-199",
    "title": "The Wolf Among Us Remastered",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1780736857/twaur_ekdbnz.webp",
    "publisher": "PM Studios, Inc.",
    "developer": "Telltale Games",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 2
  },
  {
    "id": "game-203",
    "title": "SAW Genesis",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1780736841/sawg_j1hysz.webp",
    "publisher": "Bloober Team",
    "developer": "Anshar Studios",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows"
    ],
    "hype": 0
  },
  {
    "id": "game-234",
    "title": "1666: Amsterdam",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1782644768/amsterdam_wqgagw.webp",
    "publisher": "Panache Digital Games",
    "developer": "Panache Digital Games",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows"
    ],
    "hype": 16
  },
  {
    "id": "game-241",
    "title": "Stronghold 4",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1782644667/s4_ablsu3.webp",
    "publisher": "Firefly Studios",
    "developer": "Firefly Studios",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows"
    ],
    "hype": 13
  },
  {
    "id": "game-244",
    "title": "Arizona Sunshine",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1782644667/as_cudrzq.webp",
    "publisher": "Vertigo Games",
    "developer": "Vertigo Games",
    "releaseDate": "2026",
    "targetDate": "2026-01-01T00:00:00.000Z",
    "dateType": "tba",
    "platforms": [
      "windows",
      "playstation",
      "xbox",
      "nintendo-switch"
    ],
    "hype": 13
  },
  {
    "id": "game-150",
    "title": "Stranger than Heaven",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1778402729/sth_eobcfr.webp",
    "publisher": "SEGA",
    "developer": "Ryu Ga Gotoku Studio",
    "releaseDate": "2027-01-15",
    "targetDate": "2027-01-15T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 1
  },
  {
    "id": "game-42",
    "title": "Tomb Raider: Legacy of Atlantis",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1765530474/trla_jnwz11.webp",
    "publisher": "Amazon Games",
    "developer": "Crystal Dynamics",
    "releaseDate": "2027-02-12",
    "targetDate": "2027-02-12T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 2
  },
  {
    "id": "game-176",
    "title": "Persona 4 Revival",
    "image": "https://res.cloudinary.com/dbtdewiqk/image/upload/v1779175152/p4r_qazgrf.webp",
    "publisher": "SEGA",
    "developer": "ATLUS",
    "releaseDate": "2027-02-18",
    "targetDate": "2027-02-18T00:00:00.000Z",
    "dateType": "exact",
    "platforms": [
      "windows",
      "playstation",
      "xbox"
    ],
    "hype": 6
  }
] as PcGame[];
