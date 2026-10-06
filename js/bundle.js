(() => {
  // js/config.js
  var DEBUG = true;
  var SAVE_KEY = "dreamTeaSave";
  var SAVE_VERSION = 1;
  var AUTOSAVE_INTERVAL = 30;
  var OFFLINE_MAX_SECONDS = 8 * 3600;
  var DAYS_PER_SEASON = 7;
  var SEASONS = {
    spring: { id: "spring", name: "Xu\xE2n", icon: "\u{1F338}", temp: [20, 28], weathers: { sunny: 40, cloudy: 30, rain: 25, hot: 0, cold: 5 } },
    summer: { id: "summer", name: "H\u1EA1", icon: "\u{1F33B}", temp: [28, 37], weathers: { sunny: 35, cloudy: 15, rain: 15, hot: 35, cold: 0 } },
    autumn: { id: "autumn", name: "Thu", icon: "\u{1F342}", temp: [18, 26], weathers: { sunny: 35, cloudy: 35, rain: 20, hot: 0, cold: 10 } },
    winter: { id: "winter", name: "\u0110\xF4ng", icon: "\u26C4", temp: [8, 17], weathers: { sunny: 20, cloudy: 30, rain: 15, hot: 0, cold: 35 } }
  };
  var SEASON_ORDER = ["spring", "summer", "autumn", "winter"];
  var WEATHERS = {
    sunny: { id: "sunny", name: "N\u1EAFng", icon: "\u2600\uFE0F", spawnMul: 1.1, coldBias: 0, hotBias: 0, deliveryMul: 1, tip: "Tr\u1EDDi n\u1EAFng: +10% kh\xE1ch gh\xE9 ti\u1EC7m" },
    cloudy: { id: "cloudy", name: "Nhi\u1EC1u m\xE2y", icon: "\u26C5", spawnMul: 1, coldBias: 0, hotBias: 0, deliveryMul: 1, tip: "Tr\u1EDDi m\xE1t, m\u1ECDi th\u1EE9 b\xECnh th\u01B0\u1EDDng" },
    rain: { id: "rain", name: "M\u01B0a", icon: "\u{1F327}\uFE0F", spawnMul: 0.85, coldBias: 0, hotBias: 0.1, deliveryMul: 1.3, tip: "Tr\u1EDDi m\u01B0a: +30% \u0111\u01A1n giao h\xE0ng" },
    hot: { id: "hot", name: "N\xF3ng", icon: "\u{1F525}", spawnMul: 1, coldBias: 0.2, hotBias: 0, deliveryMul: 1, tip: "Tr\u1EDDi n\xF3ng: +20% kh\xE1ch g\u1ECDi \u0111\u1ED3 l\u1EA1nh" },
    cold: { id: "cold", name: "L\u1EA1nh", icon: "\u2744\uFE0F", spawnMul: 0.95, coldBias: 0, hotBias: 0.2, deliveryMul: 1, tip: "Tr\u1EDDi l\u1EA1nh: +20% kh\xE1ch g\u1ECDi \u0111\u1ED3 n\xF3ng" }
  };
  var RARITY = {
    common: { name: "Th\u01B0\u1EDDng", order: 0 },
    uncommon: { name: "Kh\xE1 hi\u1EBFm", order: 1 },
    rare: { name: "Hi\u1EBFm", order: 2 },
    epic: { name: "C\u1EF1c hi\u1EBFm", order: 3 },
    legendary: { name: "Huy\u1EC1n tho\u1EA1i", order: 4 }
  };
  var INGREDIENTS = [
    { id: "tea", name: "Tr\xE0", icon: "\u{1F375}", cost: 2e3, maxStock: 30, rarity: "common", unlockLevel: 1, desc: "L\xE1 tr\xE0 th\u01A1m, n\u1EC1n c\u1EE7a m\u1ECDi th\u1EE9c u\u1ED1ng." },
    { id: "milk", name: "S\u1EEFa", icon: "\u{1F95B}", cost: 3e3, maxStock: 25, rarity: "common", unlockLevel: 1, desc: "S\u1EEFa t\u01B0\u01A1i b\xE9o ng\u1EADy." },
    { id: "sugar", name: "\u0110\u01B0\u1EDDng", icon: "\u{1F36C}", cost: 1e3, maxStock: 40, rarity: "common", unlockLevel: 1, desc: "Ng\u1ECDt ng\xE0o v\u1EEBa \u0111\u1EE7." },
    { id: "ice", name: "\u0110\xE1", icon: "\u{1F9CA}", cost: 500, maxStock: 40, rarity: "common", unlockLevel: 1, desc: "M\xE1t l\u1EA1nh cho ng\xE0y n\xF3ng." },
    { id: "lemon", name: "Chanh", icon: "\u{1F34B}", cost: 2500, maxStock: 25, rarity: "common", unlockLevel: 1, desc: "Chanh t\u01B0\u01A1i chua d\u1ECBu." },
    { id: "peach", name: "\u0110\xE0o", icon: "\u{1F351}", cost: 4e3, maxStock: 20, rarity: "uncommon", unlockLevel: 1, desc: "\u0110\xE0o ng\xE2m th\u01A1m l\u1EEBng." },
    { id: "pearl", name: "Tr\xE2n ch\xE2u", icon: "\u26AB", cost: 3500, maxStock: 30, rarity: "common", unlockLevel: 2, desc: "Tr\xE2n ch\xE2u dai dai, ai c\u0169ng m\xEA." },
    { id: "lychee", name: "V\u1EA3i", icon: "\u{1F352}", cost: 4500, maxStock: 20, rarity: "uncommon", unlockLevel: 3, desc: "V\u1EA3i thi\u1EC1u m\u1ECDng n\u01B0\u1EDBc." },
    { id: "matcha", name: "Matcha", icon: "\u{1F343}", cost: 6e3, maxStock: 15, rarity: "rare", unlockLevel: 3, desc: "B\u1ED9t tr\xE0 xanh h\u1EA3o h\u1EA1ng." },
    { id: "fruit", name: "Tr\xE1i c\xE2y", icon: "\u{1F353}", cost: 5e3, maxStock: 20, rarity: "uncommon", unlockLevel: 4, desc: "H\u1ED7n h\u1EE3p tr\xE1i c\xE2y theo m\xF9a." },
    { id: "honey", name: "M\u1EADt ong", icon: "\u{1F36F}", cost: 7e3, maxStock: 15, rarity: "rare", unlockLevel: 5, desc: "M\u1EADt ong r\u1EEBng nguy\xEAn ch\u1EA5t." },
    { id: "rose", name: "Hoa h\u1ED3ng", icon: "\u{1F339}", cost: 9e3, maxStock: 10, rarity: "epic", unlockLevel: 7, desc: "C\xE1nh hoa h\u1ED3ng s\u1EA5y, th\u01A1m d\u1ECBu." },
    { id: "snowpearl", name: "Tr\xE2n ch\xE2u tuy\u1EBFt", icon: "\u{1F48E}", cost: 15e3, maxStock: 8, rarity: "legendary", unlockLevel: 10, desc: "Tr\xE2n ch\xE2u trong su\u1ED1t nh\u01B0 pha l\xEA." }
  ];
  var INGREDIENT_MAP = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));
  var RECIPES = [
    { id: "lemonTea", name: "Tr\xE0 chanh", icon: "\u{1F34B}", price: 2e4, preparationTime: 3, temp: "cold", unlockLevel: 1, rarity: "common", ingredients: { tea: 1, lemon: 1, sugar: 1, ice: 1 }, desc: "Chua ng\u1ECDt m\xE1t l\u1EA1nh." },
    { id: "peachTea", name: "Tr\xE0 \u0111\xE0o", icon: "\u{1F351}", price: 25e3, preparationTime: 3, temp: "cold", unlockLevel: 1, rarity: "common", ingredients: { tea: 1, peach: 1, sugar: 1, ice: 1 }, desc: "M\xF3n t\u1EE7 c\u1EE7a m\u1ECDi ti\u1EC7m tr\xE0." },
    { id: "milkTea", name: "Tr\xE0 s\u1EEFa", icon: "\u{1F9CB}", price: 3e4, preparationTime: 3.5, temp: "cold", unlockLevel: 1, rarity: "common", ingredients: { tea: 1, milk: 1, sugar: 1, ice: 1 }, desc: "B\xE9o th\u01A1m, d\u1EC5 u\u1ED1ng." },
    { id: "hotTea", name: "Tr\xE0 n\xF3ng", icon: "\u2615", price: 18e3, preparationTime: 2.5, temp: "hot", unlockLevel: 1, rarity: "common", ingredients: { tea: 1, sugar: 1 }, desc: "\u1EA4m b\u1EE5ng ng\xE0y l\u1EA1nh." },
    { id: "pearlMilkTea", name: "Tr\xE0 s\u1EEFa tr\xE2n ch\xE2u", icon: "\u{1F9CB}", price: 35e3, preparationTime: 4, temp: "cold", unlockLevel: 2, rarity: "uncommon", ingredients: { tea: 1, milk: 1, pearl: 2, sugar: 1 }, desc: "Th\xEAm tr\xE2n ch\xE2u dai dai." },
    { id: "hotMilkTea", name: "Tr\xE0 s\u1EEFa n\xF3ng", icon: "\u{1F376}", price: 3e4, preparationTime: 3.5, temp: "hot", unlockLevel: 2, rarity: "common", ingredients: { tea: 1, milk: 1, sugar: 1 }, desc: "Tr\xE0 s\u1EEFa phi\xEAn b\u1EA3n \u1EA5m \xE1p." },
    { id: "matchaLatte", name: "Matcha latte", icon: "\u{1F375}", price: 4e4, preparationTime: 4.5, temp: "hot", unlockLevel: 3, rarity: "rare", ingredients: { matcha: 1, milk: 1, sugar: 1 }, desc: "V\u1ECB tr\xE0 xanh \u0111\u1EADm \u0111\xE0." },
    { id: "lycheeTea", name: "Tr\xE0 v\u1EA3i", icon: "\u{1F352}", price: 32e3, preparationTime: 3.5, temp: "cold", unlockLevel: 3, rarity: "uncommon", ingredients: { tea: 1, lychee: 2, sugar: 1, ice: 1 }, desc: "Ng\u1ECDt thanh h\u01B0\u01A1ng v\u1EA3i." },
    { id: "fruitTea", name: "Tr\xE0 tr\xE1i c\xE2y", icon: "\u{1F353}", price: 38e3, preparationTime: 4, temp: "cold", unlockLevel: 4, rarity: "uncommon", ingredients: { tea: 1, fruit: 2, sugar: 1, ice: 1 }, desc: "\u0110\u1EA7y \u1EAFp tr\xE1i c\xE2y t\u01B0\u01A1i." },
    { id: "honeyTea", name: "Tr\xE0 m\u1EADt ong", icon: "\u{1F36F}", price: 28e3, preparationTime: 3, temp: "hot", unlockLevel: 5, rarity: "rare", ingredients: { tea: 1, honey: 1 }, desc: "D\u1ECBu h\u1ECDng, \u1EA5m l\xF2ng." },
    { id: "matchaPearl", name: "Matcha tr\xE2n ch\xE2u", icon: "\u{1F964}", price: 5e4, preparationTime: 5, temp: "cold", unlockLevel: 6, rarity: "rare", ingredients: { matcha: 1, milk: 1, pearl: 2, ice: 1 }, desc: "K\u1EBFt h\u1EE3p ho\xE0n h\u1EA3o." },
    { id: "roseMilkTea", name: "Tr\xE0 s\u1EEFa hoa h\u1ED3ng", icon: "\u{1F339}", price: 48e3, preparationTime: 5, temp: "cold", unlockLevel: 7, rarity: "epic", ingredients: { tea: 1, milk: 1, rose: 1, sugar: 1, ice: 1 }, desc: "Th\u01A1m ng\xE1t, sang tr\u1ECDng." },
    { id: "honeyLemon", name: "Chanh m\u1EADt ong", icon: "\u{1F34B}", price: 3e4, preparationTime: 3, temp: "hot", unlockLevel: 8, rarity: "rare", ingredients: { lemon: 1, honey: 1 }, desc: "B\xED quy\u1EBFt kho\u1EBB ng\u01B0\u1EDDi." },
    { id: "snowPearlTea", name: "Tr\xE0 s\u1EEFa tr\xE2n ch\xE2u tuy\u1EBFt", icon: "\u{1F48E}", price: 8e4, preparationTime: 6, temp: "cold", unlockLevel: 10, rarity: "legendary", ingredients: { tea: 1, milk: 1, snowpearl: 1, pearl: 1, ice: 1 }, desc: "Th\u1EE9c u\u1ED1ng trong m\u01A1." }
  ];
  var RECIPE_MAP = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
  var SPECIAL_REQUESTS = [
    { id: "lessSugar", name: "\xCDt \u0111\u01B0\u1EDDng" },
    { id: "moreIce", name: "Nhi\u1EC1u \u0111\xE1" },
    { id: "noIce", name: "Kh\xF4ng \u0111\xE1" },
    { id: "extraPearl", name: "Th\xEAm tr\xE2n ch\xE2u" },
    { id: "lessMilk", name: "\xCDt s\u1EEFa" }
  ];
  var CUSTOMER_NAMES = ["Lan", "Minh", "Hoa", "Tu\u1EA5n", "My", "Khoa", "Trang", "\u0110\u1EE9c", "Vy", "Huy", "Ng\u1ECDc", "B\u1EA3o", "Linh", "Nam", "Th\u1EA3o", "Ph\xFAc", "Qu\u1EF3nh", "Long", "Chi", "An"];
  var CUSTOMER_AVATARS = ["\u{1F467}", "\u{1F466}", "\u{1F469}", "\u{1F468}", "\u{1F9D1}", "\u{1F475}", "\u{1F474}", "\u{1F469}\u200D\u{1F9B0}", "\u{1F471}\u200D\u2640\uFE0F", "\u{1F9D4}", "\u{1F469}\u200D\u{1F393}", "\u{1F9D5}", "\u{1F468}\u200D\u{1F4BC}", "\u{1F469}\u200D\u{1F373}", "\u{1F9D2}"];
  var SEASON_VIPS = {
    spring: { name: "C\xF4 Ti\xEAn Hoa", avatar: "\u{1F9DA}", tipMul: 1.8 },
    summer: { name: "Anh C\u1EE9u H\u1ED9", avatar: "\u{1F3C4}", tipMul: 1.8 },
    autumn: { name: "B\xE1c N\xF4ng D\xE2n", avatar: "\u{1F9D1}\u200D\u{1F33E}", tipMul: 1.8 },
    winter: { name: "\xD4ng Gi\xE0 Tuy\u1EBFt", avatar: "\u{1F385}", tipMul: 2.2 }
  };
  var CUSTOMER_CONFIG = {
    basePatience: 30,
    baseSpawnInterval: 6,
    minSpawnInterval: 2.5,
    baseSeats: 3,
    vipChance: 0.08,
    specialRequestChance: 0.3
  };
  var QUALITY = {
    PERFECT: { label: "PERFECT", mul: 1.2, rating: 0.04, xp: 1.4, emoji: "\u{1F31F}" },
    GOOD: { label: "GOOD", mul: 1, rating: 0.02, xp: 1, emoji: "\u{1F60A}" },
    OK: { label: "OK", mul: 0.8, rating: 0, xp: 0.7, emoji: "\u{1F642}" },
    FAILED: { label: "FAILED", mul: 0, rating: -0.03, xp: 0.2, emoji: "\u{1F616}" }
  };
  var RATING_LEAVE_PENALTY = 0.1;
  var UPGRADES = [
    { id: "counter", name: "Qu\u1EA7y pha ch\u1EBF", icon: "\u{1FAD6}", desc: "-8% th\u1EDDi gian pha m\u1ED7i c\u1EA5p", baseCost: 2e4, maxLevel: 5, unlockLevel: 1 },
    { id: "sign", name: "Bi\u1EC3n hi\u1EC7u", icon: "\u{1FAA7}", desc: "Kh\xE1ch \u0111\u1EBFn nhanh h\u01A1n 10% m\u1ED7i c\u1EA5p", baseCost: 15e3, maxLevel: 5, unlockLevel: 1 },
    { id: "decor", name: "Trang tr\xED", icon: "\u{1FAB4}", desc: "+5 gi\xE2y ki\xEAn nh\u1EABn m\u1ED7i c\u1EA5p", baseCost: 25e3, maxLevel: 5, unlockLevel: 2 },
    { id: "seats", name: "B\xE0n gh\u1EBF", icon: "\u{1FA91}", desc: "+1 kh\xE1ch c\xF9ng l\xFAc m\u1ED7i c\u1EA5p", baseCost: 3e4, maxLevel: 3, unlockLevel: 2 },
    { id: "storage", name: "Kho h\xE0ng", icon: "\u{1F4E6}", desc: "+10 s\u1EE9c ch\u1EE9a m\u1ED7i nguy\xEAn li\u1EC7u", baseCost: 2e4, maxLevel: 5, unlockLevel: 2 },
    { id: "vehicle", name: "Xe giao h\xE0ng", icon: "\u{1F6F5}", desc: "+1 xe giao h\xE0ng", baseCost: 5e4, maxLevel: 3, unlockLevel: 3 },
    { id: "assistant", name: "Nh\xE2n vi\xEAn", icon: "\u{1F469}\u200D\u{1F373}", desc: "Thu\xEA tr\u1EE3 l\xFD t\u1EF1 pha (c\u1EA5p cao pha nhanh h\u01A1n)", baseCost: 8e4, maxLevel: 3, unlockLevel: 4 }
  ];
  var UPGRADE_COST_GROWTH = 1.35;
  var LEVELS = [
    null,
    { xp: 0, reward: { money: 0 }, note: "Ti\u1EC7m nh\u1ECF khai tr\u01B0\u01A1ng" },
    { xp: 120, reward: { money: 2e4, items: { pearl: 5 } }, note: "M\u1EDF c\xF4ng th\u1EE9c m\u1EDBi" },
    { xp: 320, reward: { money: 3e4 }, note: "M\u1EDF giao h\xE0ng \u{1F6F5}" },
    { xp: 650, reward: { money: 4e4, items: { fruit: 3 } }, note: "C\xF3 th\u1EC3 thu\xEA nh\xE2n vi\xEAn" },
    { xp: 1100, reward: { money: 6e4 }, note: "M\u1EDF chi nh\xE1nh \u{1F3EA}" },
    { xp: 1700, reward: { money: 8e4, items: { matcha: 3 } }, note: "C\xF4ng th\u1EE9c m\u1EDBi" },
    { xp: 2500, reward: { money: 1e5, items: { rose: 2 } }, note: "Chi nh\xE1nh th\u1EE9 2" },
    { xp: 3600, reward: { money: 12e4 }, note: "C\xF4ng th\u1EE9c m\u1EDBi" },
    { xp: 5e3, reward: { money: 15e4, items: { honey: 3 } }, note: "S\u1EAFp th\xE0nh franchise!" },
    { xp: 7e3, reward: { money: 3e5, items: { snowpearl: 2 } }, note: "FRANCHISE \u{1F389}" },
    { xp: 9500, reward: { money: 35e4 }, note: "Th\u01B0\u01A1ng hi\u1EC7u l\u1EDBn" },
    { xp: 12500, reward: { money: 4e5 }, note: "Huy\u1EC1n tho\u1EA1i tr\xE0" }
  ];
  var MAX_LEVEL = LEVELS.length - 1;
  var FEATURE_LEVELS = { delivery: 3, assistant: 4, branch: 5, franchise: 10 };
  var BUFFS = {
    karinBlessing: { id: "karinBlessing", name: "Ph\u01B0\u1EDBc l\xE0nh Karin", icon: "\u{1F340}", duration: 30, effects: { patienceMultiplier: 1.2, moneyMultiplier: 1.1 } },
    happyHour: { id: "happyHour", name: "Happy Hour", icon: "\u{1F389}", duration: 45, effects: { moneyMultiplier: 1.3 } },
    rainBonus: { id: "rainBonus", name: "M\u01B0a may m\u1EAFn", icon: "\u{1F327}\uFE0F", duration: 9999, effects: { deliveryMultiplier: 1.3 } },
    festivalBonus: { id: "festivalBonus", name: "L\u1EC5 h\u1ED9i", icon: "\u{1F38A}", duration: 9999, effects: { moneyMultiplier: 1.2, spawnMultiplier: 1.2 } },
    luckyDay: { id: "luckyDay", name: "Ng\xE0y may m\u1EAFn", icon: "\u{1F3B2}", duration: 9999, effects: { tipChance: 0.3 } }
  };
  var KARIN = {
    name: "Karin",
    avatar: "\u{1F430}",
    skillName: "Xin Ph\u01B0\u1EDBc",
    cooldown: 60,
    patienceBonus: 20,
    luckyMoney: 5e3
  };
  var DELIVERY_DESTINATIONS = [
    { id: "office", name: "V\u0103n ph\xF2ng M\xE2y", icon: "\u{1F3E2}", duration: 25, reward: 3e4 },
    { id: "school", name: "Tr\u01B0\u1EDDng Hoa Mai", icon: "\u{1F3EB}", duration: 30, reward: 35e3 },
    { id: "park", name: "C\xF4ng vi\xEAn Xanh", icon: "\u{1F333}", duration: 20, reward: 25e3 },
    { id: "hospital", name: "B\u1EC7nh vi\u1EC7n N\u1EAFng", icon: "\u{1F3E5}", duration: 40, reward: 45e3 },
    { id: "apartment", name: "Chung c\u01B0 B\xECnh Minh", icon: "\u{1F3EC}", duration: 35, reward: 4e4 },
    { id: "beach", name: "B\xE3i bi\u1EC3n M\u01A1", icon: "\u{1F3D6}\uFE0F", duration: 55, reward: 65e3 }
  ];
  var DELIVERY_CONFIG = { baseVehicles: 1, baseOrdersPerDay: 2, rewardGrowthPerDay: 0.03 };
  var BRANCH_TEMPLATES = [
    { id: "district1", name: "Chi nh\xE1nh Qu\u1EADn 1", icon: "\u{1F3EA}", cost: 3e5, baseRevenue: 6e3 },
    { id: "thuduc", name: "Chi nh\xE1nh Th\u1EE7 \u0110\u1EE9c", icon: "\u{1F3EC}", cost: 5e5, baseRevenue: 9e3 },
    { id: "dalat", name: "Chi nh\xE1nh \u0110\xE0 L\u1EA1t", icon: "\u{1F3D4}\uFE0F", cost: 8e5, baseRevenue: 14e3 },
    { id: "danang", name: "Chi nh\xE1nh \u0110\xE0 N\u1EB5ng", icon: "\u{1F309}", cost: 13e5, baseRevenue: 22e3 },
    { id: "hanoi", name: "Chi nh\xE1nh H\xE0 N\u1ED9i", icon: "\u{1F3EF}", cost: 2e6, baseRevenue: 35e3 }
  ];
  var BRANCH_CONFIG = { incomeInterval: 60, upgradeBaseCost: 15e4, maxLevel: 10 };
  function maxBranchesForLevel(level) {
    if (level >= 10) return 5;
    if (level >= 7) return 2;
    if (level >= 5) return 1;
    return 0;
  }
  var ACHIEVEMENTS = [
    { id: "firstServe", name: "Kh\xE1ch \u0111\u1EA7u ti\xEAn", icon: "\u{1F388}", description: "Ph\u1EE5c v\u1EE5 kh\xE1ch h\xE0ng \u0111\u1EA7u ti\xEAn", reward: { money: 5e3, xp: 20 } },
    { id: "earn100k", name: "Ti\u1EC1n v\u1EC1!", icon: "\u{1F4B0}", description: "Ki\u1EBFm t\u1ED5ng c\u1ED9ng 100.000\u0111", reward: { money: 1e4, xp: 30 } },
    { id: "serve100", name: "Tr\u0103m kh\xE1ch", icon: "\u{1F465}", description: "Ph\u1EE5c v\u1EE5 100 kh\xE1ch", reward: { money: 5e4, xp: 150 } },
    { id: "perfectDay", name: "Ng\xE0y ho\xE0n h\u1EA3o", icon: "\u{1F308}", description: "Kh\xF4ng l\xE0m kh\xE1ch b\u1ECF \u0111i trong m\u1ED9t ng\xE0y", reward: { money: 15e3, xp: 60 } },
    { id: "recipes10", name: "B\u1EBFp tr\u01B0\u1EDFng", icon: "\u{1F4D6}", description: "M\u1EDF kh\xF3a 10 c\xF4ng th\u1EE9c", reward: { money: 4e4, xp: 120 } },
    { id: "firstBranch", name: "B\xE0nh tr\u01B0\u1EDBng", icon: "\u{1F3EA}", description: "M\u1EDF chi nh\xE1nh \u0111\u1EA7u ti\xEAn", reward: { money: 1e5, xp: 200 } },
    { id: "allCommon", name: "Nh\xE0 s\u01B0u t\u1EA7m", icon: "\u{1F9FA}", description: "Thu th\u1EADp to\xE0n b\u1ED9 nguy\xEAn li\u1EC7u Th\u01B0\u1EDDng", reward: { money: 2e4, xp: 80 } },
    { id: "perfect10", name: "Tay ngh\u1EC1 cao", icon: "\u{1F31F}", description: "Pha 10 ly PERFECT", reward: { money: 2e4, xp: 80 } },
    { id: "delivery10", name: "Shipper v\xE0ng", icon: "\u{1F6F5}", description: "Ho\xE0n th\xE0nh 10 \u0111\u01A1n giao h\xE0ng", reward: { money: 3e4, xp: 100 } },
    { id: "karin5", name: "B\u1EA1n th\xE2n Karin", icon: "\u{1F430}", description: "Xin ph\u01B0\u1EDBc Karin 5 l\u1EA7n", reward: { money: 1e4, xp: 40 } }
  ];
  var MINIGAME = { cols: 6, rows: 6, colors: 5, duration: 30, freePlaysPerDay: 1, playCost: 5e3, moneyPerPoint: 60, pearlPerPoints: 40 };
  var DAY_CONFIG = {
    baseCustomers: 5,
    customersPerDay: 0.7,
    customersPerLevel: 1,
    maxCustomers: 30,
    xpPerServe: 15,
    festivalEvery: 7,
    luckyDayChance: 0.1,
    happyHourAt: 4
  };

  // js/state.js
  var STARTING_INVENTORY = { tea: 10, milk: 6, sugar: 10, ice: 10, lemon: 5, peach: 4 };
  function createInitialState() {
    const inventory = {};
    for (const ing of INGREDIENTS) {
      inventory[ing.id] = { stock: STARTING_INVENTORY[ing.id] || 0, unlocked: ing.unlockLevel <= 1 };
    }
    const recipes = {};
    for (const r of RECIPES) recipes[r.id] = { unlocked: r.unlockLevel <= 1, made: 0 };
    return {
      version: SAVE_VERSION,
      day: 1,
      season: "spring",
      weather: "sunny",
      temperature: 25,
      money: 1e5,
      rating: 4.5,
      experience: 0,
      level: 1,
      shop: {
        isOpen: false,
        dayStarted: false,
        customers: [],
        servedToday: 0,
        leftToday: 0,
        happyToday: 0,
        revenueToday: 0,
        xpToday: 0,
        ratingStart: 4.5,
        targetCustomers: 0,
        spawnedToday: 0,
        spawnTimer: 2,
        nextCustomerId: 1,
        preparation: null,
        assistantPrep: null,
        selectedCustomerId: null,
        happyHourTriggered: false
      },
      upgrades: { counter: 0, sign: 0, decor: 0, seats: 0, storage: 0, vehicle: 0, assistant: 0 },
      inventory,
      recipes,
      delivery: { vehicles: DELIVERY_CONFIG.baseVehicles, activeOrders: [], availableOrders: [], nextId: 1 },
      branches: [],
      collection: { ingredients: {}, recipes: {} },
      buffs: {},
      karin: { cooldown: 0, blessCount: 0 },
      achievements: {},
      stats: { totalEarned: 0, totalServed: 0, totalLeft: 0, perfectCount: 0, deliveriesDone: 0, minigamePlaysToday: 0, bestMinigameScore: 0 },
      tutorial: { done: false, step: 0 },
      settings: { sound: true, music: true },
      lastPlayed: Date.now()
    };
  }
  var gameState = createInitialState();
  function replaceState(newState) {
    for (const key of Object.keys(gameState)) delete gameState[key];
    Object.assign(gameState, newState);
  }
  var dirty = /* @__PURE__ */ new Set();
  function markDirty(...keys) {
    for (const k of keys) dirty.add(k);
  }
  function consumeDirty() {
    const out = [...dirty];
    dirty.clear();
    return out;
  }
  function markAllDirty() {
    markDirty("hud", "customers", "counter", "karin", "actions", "nav", "buffs", "scene");
  }

  // js/events.js
  var listeners = /* @__PURE__ */ new Map();
  function on(eventName, callback) {
    if (!listeners.has(eventName)) listeners.set(eventName, /* @__PURE__ */ new Set());
    listeners.get(eventName).add(callback);
    return () => off(eventName, callback);
  }
  function off(eventName, callback) {
    listeners.get(eventName)?.delete(callback);
  }
  function emit(eventName, data) {
    const set = listeners.get(eventName);
    if (!set) return;
    for (const cb of [...set]) {
      try {
        cb(data);
      } catch (err) {
        console.error(`[EventBus] L\u1ED7i listener "${eventName}":`, err);
      }
    }
  }
  var EVENTS = {
    STATE_LOADED: "STATE_LOADED",
    DAY_STARTED: "DAY_STARTED",
    SHOP_OPENED: "SHOP_OPENED",
    SHOP_CLOSED: "SHOP_CLOSED",
    CUSTOMER_SPAWNED: "CUSTOMER_SPAWNED",
    CUSTOMER_LEFT: "CUSTOMER_LEFT",
    CUSTOMER_SERVED: "CUSTOMER_SERVED",
    CUSTOMER_SELECTED: "CUSTOMER_SELECTED",
    PREP_STARTED: "PREP_STARTED",
    PREP_READY: "PREP_READY",
    PREP_RESULT: "PREP_RESULT",
    MONEY_EARNED: "MONEY_EARNED",
    MONEY_SPENT: "MONEY_SPENT",
    RATING_CHANGED: "RATING_CHANGED",
    XP_GAINED: "XP_GAINED",
    LEVEL_UP: "LEVEL_UP",
    RECIPE_UNLOCKED: "RECIPE_UNLOCKED",
    INGREDIENT_BOUGHT: "INGREDIENT_BOUGHT",
    INGREDIENT_USED: "INGREDIENT_USED",
    KARIN_BLESS: "KARIN_BLESS",
    BUFF_ADDED: "BUFF_ADDED",
    BUFF_EXPIRED: "BUFF_EXPIRED",
    DELIVERY_STARTED: "DELIVERY_STARTED",
    DELIVERY_COMPLETED: "DELIVERY_COMPLETED",
    BRANCH_OPENED: "BRANCH_OPENED",
    BRANCH_INCOME: "BRANCH_INCOME",
    DISCOVERY: "DISCOVERY",
    ACHIEVEMENT_UNLOCKED: "ACHIEVEMENT_UNLOCKED",
    DAY_COMPLETED: "DAY_COMPLETED",
    WEATHER_CHANGED: "WEATHER_CHANGED",
    UPGRADE_BOUGHT: "UPGRADE_BOUGHT",
    MINIGAME_FINISHED: "MINIGAME_FINISHED",
    TOAST: "TOAST",
    SAVE_DONE: "SAVE_DONE",
    OFFLINE_PROGRESS: "OFFLINE_PROGRESS",
    SETTINGS_CHANGED: "SETTINGS_CHANGED",
    GAME_RESET: "GAME_RESET"
  };

  // js/gameLoop.js
  var updaters = [];
  var renderers = /* @__PURE__ */ new Map();
  var frameRenderers = [];
  var lastTime = 0;
  var running = false;
  var paused = false;
  function registerUpdate(fn) {
    updaters.push(fn);
  }
  function registerRenderer(key, fn) {
    renderers.set(key, fn);
  }
  function registerFrameRenderer(fn) {
    frameRenderers.push(fn);
  }
  function update(dt) {
    for (const fn of updaters) {
      try {
        fn(dt);
      } catch (err) {
        console.error("[GameLoop] L\u1ED7i update:", err);
      }
    }
  }
  function render(dt) {
    for (const key of consumeDirty()) {
      const fn = renderers.get(key);
      if (!fn) continue;
      try {
        fn();
      } catch (err) {
        console.error(`[GameLoop] L\u1ED7i render "${key}":`, err);
      }
    }
    for (const fn of frameRenderers) {
      try {
        fn(dt);
      } catch (err) {
        console.error("[GameLoop] L\u1ED7i frame render:", err);
      }
    }
  }
  function frame(timestamp) {
    if (!running) return;
    const dt = Math.min((timestamp - lastTime) / 1e3, 0.25);
    lastTime = timestamp;
    if (!paused) update(dt);
    render(dt);
    requestAnimationFrame(frame);
  }
  function startLoop() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(frame);
  }
  function setPaused(value) {
    paused = value;
  }
  function isPaused() {
    return paused;
  }
  function flushRender() {
    render(0);
  }

  // js/save.js
  var storageOk = true;
  var pendingSave = null;
  function getStorage() {
    if (!storageOk) return null;
    try {
      const s = window.localStorage;
      s.getItem(SAVE_KEY);
      return s;
    } catch (err) {
      storageOk = false;
      console.warn("[Save] LocalStorage kh\xF4ng kh\u1EA3 d\u1EE5ng, ch\u1EA1y memory-only.", err);
      return null;
    }
  }
  function saveGame() {
    const storage = getStorage();
    gameState.lastPlayed = Date.now();
    if (!storage) return false;
    try {
      const payload = { version: SAVE_VERSION, timestamp: Date.now(), state: gameState };
      storage.setItem(SAVE_KEY, JSON.stringify(payload));
      emit(EVENTS.SAVE_DONE);
      return true;
    } catch (err) {
      console.warn("[Save] L\u01B0u th\u1EA5t b\u1EA1i:", err);
      return false;
    }
  }
  function requestSave() {
    if (pendingSave) return;
    pendingSave = setTimeout(() => {
      pendingSave = null;
      saveGame();
    }, 800);
  }
  function migrate(saved) {
    let state = saved.state || saved;
    const version = saved.version || state.version || 0;
    if (version < 1) {
      state = { ...createInitialState(), ...state };
    }
    state.version = SAVE_VERSION;
    return state;
  }
  function normalize(state) {
    const fresh = createInitialState();
    const merged = { ...fresh, ...state };
    merged.shop = { ...fresh.shop, ...state.shop || {} };
    merged.upgrades = { ...fresh.upgrades, ...state.upgrades || {} };
    merged.delivery = { ...fresh.delivery, ...state.delivery || {} };
    merged.collection = { ingredients: {}, recipes: {}, ...state.collection || {} };
    merged.stats = { ...fresh.stats, ...state.stats || {} };
    merged.karin = { ...fresh.karin, ...state.karin || {} };
    merged.settings = { ...fresh.settings, ...state.settings || {} };
    merged.tutorial = { ...fresh.tutorial, ...state.tutorial || {} };
    merged.inventory = { ...fresh.inventory };
    for (const ing of INGREDIENTS) {
      const old = state.inventory?.[ing.id];
      if (old) merged.inventory[ing.id] = { stock: Math.max(0, Number(old.stock) || 0), unlocked: !!old.unlocked };
    }
    merged.recipes = { ...fresh.recipes };
    for (const r of RECIPES) {
      const old = state.recipes?.[r.id];
      if (old) merged.recipes[r.id] = { unlocked: !!old.unlocked, made: Number(old.made) || 0 };
    }
    merged.shop.customers = [];
    merged.shop.preparation = null;
    merged.shop.assistantPrep = null;
    merged.shop.selectedCustomerId = null;
    merged.shop.isOpen = false;
    merged.buffs = {};
    merged.money = Math.max(0, Number(merged.money) || 0);
    merged.rating = Math.min(5, Math.max(1, Number(merged.rating) || 4.5));
    return merged;
  }
  function loadGame() {
    const storage = getStorage();
    if (!storage) return { loaded: false, elapsed: 0 };
    try {
      const raw = storage.getItem(SAVE_KEY);
      if (!raw) return { loaded: false, elapsed: 0 };
      const saved = JSON.parse(raw);
      const state = normalize(migrate(saved));
      const elapsed = Math.max(0, (Date.now() - (saved.timestamp || state.lastPlayed || Date.now())) / 1e3);
      replaceState(state);
      markAllDirty();
      emit(EVENTS.STATE_LOADED, gameState);
      return { loaded: true, elapsed };
    } catch (err) {
      console.warn("[Save] Save h\u1ECFng, b\u1EAFt \u0111\u1EA7u game m\u1EDBi.", err);
      return { loaded: false, elapsed: 0 };
    }
  }
  function resetGame() {
    const storage = getStorage();
    try {
      storage?.removeItem(SAVE_KEY);
    } catch (err) {
      console.warn("[Save] Kh\xF4ng x\xF3a \u0111\u01B0\u1EE3c save:", err);
    }
    replaceState(createInitialState());
    markAllDirty();
    emit(EVENTS.GAME_RESET);
    emit(EVENTS.STATE_LOADED, gameState);
  }
  function isStorageAvailable() {
    return !!getStorage();
  }

  // js/utils.js
  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }
  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function chance(p) {
    return Math.random() < p;
  }
  function weightedPick(weights) {
    const entries = Object.entries(weights).filter(([, w]) => w > 0);
    const total = entries.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [key, w] of entries) {
      r -= w;
      if (r <= 0) return key;
    }
    return entries[entries.length - 1]?.[0];
  }
  function formatMoney(n) {
    const v = Math.round(Number(n) || 0);
    const sign = v < 0 ? "-" : "";
    return sign + Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "\u0111";
  }
  function formatSigned(n) {
    const v = Math.round(n);
    return (v >= 0 ? "+" : "") + formatMoney(v);
  }
  function formatRating(r) {
    return (Math.round(r * 10) / 10).toFixed(1);
  }
  function formatTime(seconds) {
    const s = Math.max(0, Math.ceil(seconds));
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    return `${m}m${String(s % 60).padStart(2, "0")}s`;
  }
  function esc(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function html(str) {
    const t = document.createElement("template");
    t.innerHTML = str.trim();
    return t.content.firstElementChild;
  }
  function $(sel, root2 = document) {
    return root2.querySelector(sel);
  }

  // js/systems/buffSystem.js
  function addBuff(buffId) {
    const def = BUFFS[buffId];
    if (!def) return;
    gameState.buffs[buffId] = { id: buffId, remaining: def.duration };
    markDirty("buffs");
    emit(EVENTS.BUFF_ADDED, def);
  }
  function removeBuff(buffId) {
    if (!gameState.buffs[buffId]) return;
    delete gameState.buffs[buffId];
    markDirty("buffs");
    emit(EVENTS.BUFF_EXPIRED, BUFFS[buffId]);
  }
  function getMultiplier(key) {
    let mul = 1;
    for (const id of Object.keys(gameState.buffs)) {
      const v = BUFFS[id]?.effects?.[key];
      if (typeof v === "number") mul *= v;
    }
    return mul;
  }
  function getAdditive(key) {
    let sum = 0;
    for (const id of Object.keys(gameState.buffs)) {
      const v = BUFFS[id]?.effects?.[key];
      if (typeof v === "number") sum += v;
    }
    return sum;
  }
  function clearDailyBuffs() {
    for (const id of Object.keys(gameState.buffs)) {
      if (BUFFS[id]?.duration >= 9999) delete gameState.buffs[id];
    }
    markDirty("buffs");
  }
  function updateBuffs(dt) {
    let changed = false;
    for (const [id, b] of Object.entries(gameState.buffs)) {
      if (BUFFS[id]?.duration >= 9999) continue;
      b.remaining -= dt;
      if (b.remaining <= 0) {
        delete gameState.buffs[id];
        emit(EVENTS.BUFF_EXPIRED, BUFFS[id]);
        changed = true;
      }
    }
    if (changed) markDirty("buffs");
  }
  function listBuffs() {
    return Object.values(gameState.buffs).map((b) => ({ ...BUFFS[b.id], remaining: b.remaining }));
  }

  // js/systems/economySystem.js
  function addMoney(amount, source = "other", applyBuff = false) {
    let value = Math.round(amount);
    if (applyBuff) value = Math.round(value * getMultiplier("moneyMultiplier"));
    if (value <= 0) return 0;
    gameState.money += value;
    gameState.stats.totalEarned += value;
    if (gameState.shop.isOpen || gameState.shop.dayStarted) gameState.shop.revenueToday += value;
    markDirty("hud");
    emit(EVENTS.MONEY_EARNED, { amount: value, source });
    requestSave();
    return value;
  }
  function spendMoney(amount, source = "other") {
    const value = Math.round(amount);
    if (value <= 0) return true;
    if (gameState.money < value) return false;
    gameState.money -= value;
    markDirty("hud");
    emit(EVENTS.MONEY_SPENT, { amount: value, source });
    requestSave();
    return true;
  }
  function changeRating(delta) {
    const before = gameState.rating;
    gameState.rating = clamp(gameState.rating + delta, 1, 5);
    if (gameState.rating !== before) {
      markDirty("hud");
      emit(EVENTS.RATING_CHANGED, { delta: gameState.rating - before, rating: gameState.rating });
    }
  }
  function xpForLevel(level) {
    return LEVELS[Math.min(level, MAX_LEVEL)]?.xp ?? Infinity;
  }
  function xpProgress() {
    const cur = xpForLevel(gameState.level);
    const next = gameState.level >= MAX_LEVEL ? cur : xpForLevel(gameState.level + 1);
    const ratio = next > cur ? clamp((gameState.experience - cur) / (next - cur), 0, 1) : 1;
    return { current: cur, next, ratio };
  }
  function addXp(amount) {
    const value = Math.round(amount);
    if (value <= 0) return;
    gameState.experience += value;
    if (gameState.shop.dayStarted) gameState.shop.xpToday += value;
    emit(EVENTS.XP_GAINED, value);
    while (gameState.level < MAX_LEVEL && gameState.experience >= xpForLevel(gameState.level + 1)) {
      gameState.level += 1;
      const info = LEVELS[gameState.level];
      const reward = info?.reward || {};
      if (reward.money) {
        gameState.money += reward.money;
        gameState.stats.totalEarned += reward.money;
      }
      const items = reward.items || {};
      for (const [id, qty] of Object.entries(items)) {
        const slot2 = gameState.inventory[id];
        if (slot2) {
          slot2.stock += qty;
          slot2.unlocked = true;
        }
      }
      emit(EVENTS.LEVEL_UP, { level: gameState.level, reward, note: info?.note || "" });
    }
    markDirty("hud", "nav", "actions");
    requestSave();
  }
  function isFeatureUnlocked(feature) {
    return gameState.level >= (FEATURE_LEVELS[feature] ?? 1);
  }
  function getUpgradeDef(id) {
    return UPGRADES.find((u) => u.id === id);
  }
  function getUpgradeLevel(id) {
    return gameState.upgrades[id] || 0;
  }
  function getUpgradeCost(id) {
    const def = getUpgradeDef(id);
    if (!def) return Infinity;
    return Math.round(def.baseCost * Math.pow(UPGRADE_COST_GROWTH, getUpgradeLevel(id)) / 1e3) * 1e3;
  }
  function buyUpgrade(id) {
    const def = getUpgradeDef(id);
    if (!def) return "N\xE2ng c\u1EA5p kh\xF4ng t\u1ED3n t\u1EA1i";
    if (gameState.level < def.unlockLevel) return `C\u1EA7n \u0111\u1EA1t c\u1EA5p ${def.unlockLevel}`;
    if (getUpgradeLevel(id) >= def.maxLevel) return "\u0110\xE3 \u0111\u1EA1t c\u1EA5p t\u1ED1i \u0111a";
    const cost = getUpgradeCost(id);
    if (!spendMoney(cost, "upgrade")) return "Kh\xF4ng \u0111\u1EE7 ti\u1EC1n";
    gameState.upgrades[id] = getUpgradeLevel(id) + 1;
    if (id === "vehicle") gameState.delivery.vehicles += 1;
    emit(EVENTS.UPGRADE_BOUGHT, { id, level: gameState.upgrades[id], def });
    markDirty("hud", "counter", "actions");
    requestSave();
    return null;
  }
  function prepTimeMultiplier() {
    return Math.max(0.5, 1 - 0.08 * getUpgradeLevel("counter"));
  }

  // js/systems/inventorySystem.js
  function slot(id) {
    if (!gameState.inventory[id]) gameState.inventory[id] = { stock: 0, unlocked: false };
    return gameState.inventory[id];
  }
  function getStock(id) {
    const s = gameState.inventory[id];
    if (!s) return 0;
    if (s.stock < 0) s.stock = 0;
    return s.stock;
  }
  function getMaxStock(id) {
    const def = INGREDIENT_MAP[id];
    if (!def) return 0;
    return def.maxStock + 10 * (gameState.upgrades.storage || 0);
  }
  function isUnlocked(id) {
    return !!gameState.inventory[id]?.unlocked;
  }
  function listIngredients() {
    return INGREDIENTS.map((def) => ({ ...def, stock: getStock(def.id), maxStock: getMaxStock(def.id), unlocked: isUnlocked(def.id) }));
  }
  function unlockIngredientsForLevel(level) {
    const unlocked2 = [];
    for (const def of INGREDIENTS) {
      const s = slot(def.id);
      if (!s.unlocked && def.unlockLevel <= level) {
        s.unlocked = true;
        unlocked2.push(def.id);
      }
    }
    return unlocked2;
  }
  function missingIngredients(ingredients) {
    return Object.entries(ingredients).filter(([id, qty]) => getStock(id) < qty).map(([id]) => id);
  }
  function hasIngredients(ingredients) {
    return missingIngredients(ingredients).length === 0;
  }
  function useIngredients(ingredients) {
    if (!hasIngredients(ingredients)) return false;
    for (const [id, qty] of Object.entries(ingredients)) {
      slot(id).stock = Math.max(0, getStock(id) - qty);
      emit(EVENTS.INGREDIENT_USED, { id, qty });
    }
    markDirty("counter");
    requestSave();
    return true;
  }
  function addIngredient(id, qty) {
    const def = INGREDIENT_MAP[id];
    if (!def || qty <= 0) return 0;
    const s = slot(id);
    s.unlocked = true;
    const before = s.stock;
    s.stock = Math.min(getMaxStock(id), s.stock + qty);
    markDirty("counter");
    requestSave();
    return s.stock - before;
  }
  function buyIngredient(id, qty) {
    const def = INGREDIENT_MAP[id];
    if (!def) return "Nguy\xEAn li\u1EC7u kh\xF4ng t\u1ED3n t\u1EA1i";
    if (!isUnlocked(id)) return `C\u1EA7n \u0111\u1EA1t c\u1EA5p ${def.unlockLevel}`;
    const room = getMaxStock(id) - getStock(id);
    const amount = Math.min(qty, room);
    if (amount <= 0) return "Kho \u0111\xE3 \u0111\u1EA7y";
    const cost = def.cost * amount;
    if (!spendMoney(cost, "ingredient")) return "Kh\xF4ng \u0111\u1EE7 ti\u1EC1n";
    slot(id).stock += amount;
    emit(EVENTS.INGREDIENT_BOUGHT, { id, qty: amount, cost });
    markDirty("counter");
    requestSave();
    return null;
  }
  function ingredientCost(ingredients) {
    return Object.entries(ingredients).reduce((s, [id, q]) => s + (INGREDIENT_MAP[id]?.cost || 0) * q, 0);
  }

  // js/systems/collectionSystem.js
  function entry(category, id) {
    const col = gameState.collection[category];
    if (!col[id]) col[id] = { discovered: false, count: 0 };
    return col[id];
  }
  function discover(category, id) {
    const def = category === "ingredients" ? INGREDIENT_MAP[id] : RECIPE_MAP[id];
    if (!def) return false;
    const e = entry(category, id);
    if (e.discovered) return false;
    e.discovered = true;
    markDirty("nav");
    emit(EVENTS.DISCOVERY, { category, item: def });
    return true;
  }
  function recordUse(category, id) {
    const e = entry(category, id);
    e.count += 1;
    discover(category, id);
  }
  function listCollection(category) {
    const defs = category === "ingredients" ? INGREDIENTS : RECIPES;
    return defs.map((def) => {
      const e = gameState.collection[category][def.id] || { discovered: false, count: 0 };
      return { ...def, discovered: e.discovered, count: e.count, level: Math.floor(e.count / 10) + 1, rarityName: RARITY[def.rarity].name };
    }).sort((a, b) => RARITY[a.rarity].order - RARITY[b.rarity].order);
  }
  function collectionProgress() {
    const ing = listCollection("ingredients");
    const rec = listCollection("recipes");
    return {
      ingredients: { found: ing.filter((i) => i.discovered).length, total: ing.length },
      recipes: { found: rec.filter((r) => r.discovered).length, total: rec.length }
    };
  }
  function allCommonIngredientsFound() {
    return INGREDIENTS.filter((i) => i.rarity === "common").every((i) => gameState.collection.ingredients[i.id]?.discovered);
  }
  function discoverStarting() {
    for (const [id, s] of Object.entries(gameState.inventory)) if (s.stock > 0 && INGREDIENT_MAP[id]) entry("ingredients", id).discovered = true;
    for (const [id, r] of Object.entries(gameState.recipes)) if (r.unlocked && RECIPE_MAP[id]) entry("recipes", id).discovered = true;
    markDirty("nav");
  }
  function initCollectionSystem() {
    on(EVENTS.INGREDIENT_BOUGHT, ({ id }) => discover("ingredients", id));
    on(EVENTS.INGREDIENT_USED, ({ id }) => recordUse("ingredients", id));
    on(EVENTS.RECIPE_UNLOCKED, (recipe) => discover("recipes", recipe.id));
    on(EVENTS.LEVEL_UP, () => {
      for (const [id, s] of Object.entries(gameState.inventory)) if (s.stock > 0) discover("ingredients", id);
    });
  }

  // js/systems/recipeSystem.js
  var TIMING_SPEED = 1.1;
  function getRecipe(id) {
    return RECIPE_MAP[id] || null;
  }
  function isRecipeUnlocked(id) {
    return !!gameState.recipes[id]?.unlocked;
  }
  function listRecipes() {
    return RECIPES.map((r) => ({ ...r, unlocked: isRecipeUnlocked(r.id), made: gameState.recipes[r.id]?.made || 0, missing: missingIngredients(r.ingredients) }));
  }
  function unlockedRecipes() {
    return RECIPES.filter((r) => isRecipeUnlocked(r.id));
  }
  function unlockRecipesForLevel(level) {
    const out = [];
    for (const r of RECIPES) {
      if (!gameState.recipes[r.id]) gameState.recipes[r.id] = { unlocked: false, made: 0 };
      if (!gameState.recipes[r.id].unlocked && r.unlockLevel <= level) {
        gameState.recipes[r.id].unlocked = true;
        out.push(r);
        emit(EVENTS.RECIPE_UNLOCKED, r);
      }
    }
    if (out.length) markDirty("nav");
    return out;
  }
  function unlockAllRecipes() {
    for (const r of RECIPES) {
      if (!gameState.recipes[r.id]?.unlocked) {
        gameState.recipes[r.id] = { unlocked: true, made: gameState.recipes[r.id]?.made || 0 };
        emit(EVENTS.RECIPE_UNLOCKED, r);
      }
    }
    markDirty("nav");
  }
  function findCustomer(id) {
    return gameState.shop.customers.find((c) => c.id === id) || null;
  }
  function startPreparation(customerId) {
    const shop = gameState.shop;
    if (shop.preparation) return "\u0110ang pha d\u1EDF m\u1ED9t ly";
    const customer = findCustomer(customerId);
    if (!customer || !customer.order) return "Kh\xF4ng c\xF3 kh\xE1ch";
    if (customer.state === "leaving" || customer.state === "served") return "Kh\xE1ch \u0111\xE3 r\u1EDDi \u0111i";
    if (customer.handledBy === "assistant") return "Tr\u1EE3 l\xFD \u0111ang pha cho kh\xE1ch n\xE0y";
    const recipe = getRecipe(customer.order.recipeId);
    if (!recipe) return "C\xF4ng th\u1EE9c kh\xF4ng t\u1ED3n t\u1EA1i";
    if (!hasIngredients(recipe.ingredients)) return "Thi\u1EBFu nguy\xEAn li\u1EC7u";
    useIngredients(recipe.ingredients);
    customer.state = "preparing";
    customer.handledBy = "player";
    shop.preparation = {
      customerId,
      recipeId: recipe.id,
      total: recipe.preparationTime * prepTimeMultiplier(),
      elapsed: 0,
      phase: "brewing",
      marker: 0,
      markerDir: 1
    };
    markDirty("counter", "customers");
    emit(EVENTS.PREP_STARTED, { customer, recipe });
    return null;
  }
  function cancelPreparation() {
    const prep = gameState.shop.preparation;
    if (!prep) return;
    const c = findCustomer(prep.customerId);
    if (c && c.state === "preparing") {
      c.state = "waiting";
      c.handledBy = null;
    }
    gameState.shop.preparation = null;
    markDirty("counter", "customers");
  }
  function qualityForMarker(pos) {
    const d = Math.abs(pos - 0.5);
    if (d <= 0.045) return "PERFECT";
    if (d <= 0.17) return "GOOD";
    if (d <= 0.32) return "OK";
    return "FAILED";
  }
  function serveCurrent() {
    const prep = gameState.shop.preparation;
    if (!prep || prep.phase !== "timing") return null;
    const quality = qualityForMarker(prep.marker);
    const result = completeServe(prep.customerId, prep.recipeId, quality, "player");
    gameState.shop.preparation = null;
    markDirty("counter", "customers");
    return result;
  }
  function completeServe(customerId, recipeId, quality, by) {
    const customer = findCustomer(customerId);
    const recipe = getRecipe(recipeId);
    const q = QUALITY[quality] || QUALITY.OK;
    if (!recipe) return null;
    const shop = gameState.shop;
    const qty = customer?.order?.quantity || 1;
    let money = 0;
    let tip = 0;
    if (q.mul > 0) {
      const base = recipe.price * qty * q.mul * (customer?.vip ? customer.tipMul : 1);
      money = addMoney(base, "serve", true);
      if (chance(getAdditive("tipChance")) || quality === "PERFECT" && chance(0.25)) {
        tip = addMoney(Math.round(recipe.price * 0.3), "tip", false);
      }
      gameState.recipes[recipeId].made += 1;
      recordUse("recipes", recipeId);
      gameState.stats.totalServed += 1;
      shop.servedToday += 1;
      if (quality !== "OK") shop.happyToday += 1;
      if (quality === "PERFECT") gameState.stats.perfectCount += 1;
    }
    changeRating(q.rating);
    addXp(DAY_CONFIG.xpPerServe * q.xp * qty);
    if (customer) {
      customer.handledBy = null;
      if (q.mul > 0) {
        customer.state = quality === "OK" ? "served" : "happy";
        customer.satisfaction = quality;
        customer.leaveTimer = 0.9;
      } else {
        customer.state = "waiting";
        customer.patience = Math.max(0.1, customer.patience - 6);
        customer.satisfaction = "FAILED";
      }
    }
    const result = { quality, money, tip, customer, recipe, by };
    emit(EVENTS.PREP_RESULT, result);
    if (q.mul > 0) emit(EVENTS.CUSTOMER_SERVED, result);
    markDirty("customers", "counter", "hud", "actions");
    requestSave();
    return result;
  }
  function updatePlayerPrep(dt) {
    const prep = gameState.shop.preparation;
    if (!prep) return;
    if (prep.phase === "brewing") {
      prep.elapsed += dt;
      if (prep.elapsed >= prep.total) {
        prep.phase = "timing";
        prep.marker = 0;
        prep.markerDir = 1;
        emit(EVENTS.PREP_READY, prep);
        markDirty("counter");
      }
    } else if (prep.phase === "timing") {
      prep.marker += prep.markerDir * dt / TIMING_SPEED;
      if (prep.marker >= 1) {
        prep.marker = 1;
        prep.markerDir = -1;
      } else if (prep.marker <= 0) {
        prep.marker = 0;
        prep.markerDir = 1;
      }
    }
    const c = findCustomer(prep.customerId);
    if (!c || c.state === "leaving") {
      gameState.shop.preparation = null;
      markDirty("counter");
    }
  }
  function updateAssistant(dt) {
    const lvl = getUpgradeLevel("assistant");
    const shop = gameState.shop;
    if (lvl <= 0) {
      shop.assistantPrep = null;
      return;
    }
    if (shop.assistantPrep) {
      const prep = shop.assistantPrep;
      prep.elapsed += dt;
      const c = findCustomer(prep.customerId);
      if (!c || c.state === "leaving") {
        shop.assistantPrep = null;
        markDirty("counter");
        return;
      }
      if (prep.elapsed >= prep.total) {
        completeServe(prep.customerId, prep.recipeId, "GOOD", "assistant");
        shop.assistantPrep = null;
        markDirty("counter");
      }
      return;
    }
    if (!shop.isOpen) return;
    const candidate = shop.customers.find(
      (c) => c.state === "waiting" && c.id !== shop.selectedCustomerId && c.id !== shop.preparation?.customerId && hasIngredients(getRecipe(c.order.recipeId)?.ingredients || { none: 1 })
    );
    if (!candidate) return;
    const recipe = getRecipe(candidate.order.recipeId);
    useIngredients(recipe.ingredients);
    candidate.state = "preparing";
    candidate.handledBy = "assistant";
    const speed = 1.6 - 0.2 * (lvl - 1);
    shop.assistantPrep = { customerId: candidate.id, recipeId: recipe.id, total: recipe.preparationTime * speed, elapsed: 0 };
    markDirty("counter", "customers");
  }
  function updateRecipeSystem(dt) {
    updatePlayerPrep(dt);
    updateAssistant(dt);
  }
  function clearPreparations() {
    gameState.shop.preparation = null;
    gameState.shop.assistantPrep = null;
    markDirty("counter");
  }

  // js/systems/orderSystem.js
  function generateOrder() {
    const recipes = unlockedRecipes();
    const weather = WEATHERS[gameState.weather] || WEATHERS.sunny;
    const weights = {};
    for (const r of recipes) {
      let w = 1;
      if (r.temp === "cold") w += weather.coldBias * 5 - weather.hotBias * 2;
      if (r.temp === "hot") w += weather.hotBias * 5 - weather.coldBias * 2;
      if (hasIngredients(r.ingredients)) w *= 1.6;
      weights[r.id] = Math.max(0.15, w);
    }
    const recipeId = weightedPick(weights) || recipes[0]?.id;
    const quantity = gameState.level >= 3 && chance(0.15) ? 2 : 1;
    const specialRequest = chance(CUSTOMER_CONFIG.specialRequestChance) ? pick(SPECIAL_REQUESTS).id : null;
    return { recipeId, quantity, specialRequest };
  }
  function specialRequestName(id) {
    return SPECIAL_REQUESTS.find((s) => s.id === id)?.name || "";
  }

  // js/systems/customerSystem.js
  var LEAVE_ANIM = 0.5;
  function maxSeats() {
    return CUSTOMER_CONFIG.baseSeats + getUpgradeLevel("seats");
  }
  function maxPatience() {
    return (CUSTOMER_CONFIG.basePatience + 5 * getUpgradeLevel("decor")) * getMultiplier("patienceMultiplier");
  }
  function dailyCustomerTarget() {
    const n = DAY_CONFIG.baseCustomers + Math.floor(gameState.day * DAY_CONFIG.customersPerDay) + gameState.level * DAY_CONFIG.customersPerLevel;
    return Math.min(DAY_CONFIG.maxCustomers, n);
  }
  function spawnInterval() {
    const weather = WEATHERS[gameState.weather] || WEATHERS.sunny;
    const ratingMul = 1 + (gameState.rating - 4) * 0.1;
    const signMul = 1 + 0.1 * getUpgradeLevel("sign");
    const mul = weather.spawnMul * ratingMul * signMul * getMultiplier("spawnMultiplier");
    return Math.max(CUSTOMER_CONFIG.minSpawnInterval, CUSTOMER_CONFIG.baseSpawnInterval / mul);
  }
  function spawnCustomer(force = false) {
    const shop = gameState.shop;
    const active = shop.customers.filter((c) => c.state !== "leaving");
    if (!force && active.length >= maxSeats()) return null;
    const vipDef = SEASON_VIPS[gameState.season];
    const vip = vipDef && chance(CUSTOMER_CONFIG.vipChance);
    const patience = maxPatience();
    const customer = {
      id: shop.nextCustomerId++,
      name: vip ? vipDef.name : pick(CUSTOMER_NAMES),
      avatar: vip ? vipDef.avatar : pick(CUSTOMER_AVATARS),
      vip: !!vip,
      tipMul: vip ? vipDef.tipMul : 1,
      patience,
      maxPatience: patience,
      order: generateOrder(),
      state: "waiting",
      arrivalTime: Date.now(),
      satisfaction: null,
      handledBy: null,
      leaveTimer: 0
    };
    shop.customers.push(customer);
    shop.spawnedToday += 1;
    markDirty("customers", "actions");
    emit(EVENTS.CUSTOMER_SPAWNED, customer);
    return customer;
  }
  function customerGivesUp(customer) {
    customer.state = "leaving";
    customer.leaveTimer = LEAVE_ANIM;
    customer.satisfaction = "angry";
    gameState.shop.leftToday += 1;
    gameState.stats.totalLeft += 1;
    changeRating(-RATING_LEAVE_PENALTY);
    if (gameState.shop.selectedCustomerId === customer.id) gameState.shop.selectedCustomerId = null;
    markDirty("customers", "counter", "actions");
    emit(EVENTS.CUSTOMER_LEFT, customer);
  }
  function selectCustomer(id) {
    const c = gameState.shop.customers.find((x) => x.id === id);
    if (!c || c.state === "leaving") return;
    gameState.shop.selectedCustomerId = id;
    markDirty("customers", "counter");
    emit(EVENTS.CUSTOMER_SELECTED, c);
  }
  function getSelectedCustomer() {
    const id = gameState.shop.selectedCustomerId;
    return gameState.shop.customers.find((c) => c.id === id && c.state !== "leaving") || null;
  }
  function addPatienceAll(seconds) {
    for (const c of gameState.shop.customers) {
      if (c.state === "leaving" || c.state === "served" || c.state === "happy") continue;
      c.maxPatience = Math.max(c.maxPatience, c.patience + seconds);
      c.patience = clamp(c.patience + seconds, 0, c.maxPatience);
    }
  }
  function openShop() {
    const shop = gameState.shop;
    if (shop.isOpen) return;
    shop.isOpen = true;
    shop.dayStarted = true;
    shop.spawnTimer = 1.2;
    if (!shop.targetCustomers) shop.targetCustomers = dailyCustomerTarget();
    markDirty("actions", "customers", "counter");
    emit(EVENTS.SHOP_OPENED);
    requestSave();
  }
  function closeShop() {
    if (!gameState.shop.isOpen) return;
    gameState.shop.isOpen = false;
    markDirty("actions");
    emit(EVENTS.SHOP_CLOSED);
  }
  function isDayFinished() {
    const shop = gameState.shop;
    return shop.dayStarted && shop.spawnedToday >= shop.targetCustomers && shop.customers.length === 0;
  }
  function updateCustomerSystem(dt) {
    const shop = gameState.shop;
    if (shop.isOpen && shop.spawnedToday < shop.targetCustomers) {
      shop.spawnTimer -= dt;
      if (shop.spawnTimer <= 0) {
        if (spawnCustomer()) shop.spawnTimer = spawnInterval();
        else shop.spawnTimer = 0.8;
      }
    }
    if (shop.isOpen && !shop.happyHourTriggered && shop.servedToday >= DAY_CONFIG.happyHourAt) {
      shop.happyHourTriggered = true;
      addBuff("happyHour");
    }
    let dirtyList = false;
    for (const c of shop.customers) {
      if (c.state === "waiting" || c.state === "preparing") {
        c.patience -= dt;
        if (c.patience <= 0) {
          c.patience = 0;
          customerGivesUp(c);
          dirtyList = true;
        }
      } else if (c.state === "served" || c.state === "happy") {
        c.leaveTimer -= dt;
        if (c.leaveTimer <= 0) {
          c.state = "leaving";
          c.leaveTimer = LEAVE_ANIM;
          if (shop.selectedCustomerId === c.id) shop.selectedCustomerId = null;
          dirtyList = true;
        }
      } else if (c.state === "leaving") {
        c.leaveTimer -= dt;
      }
    }
    const before = shop.customers.length;
    shop.customers = shop.customers.filter((c) => !(c.state === "leaving" && c.leaveTimer <= 0));
    if (shop.customers.length !== before || dirtyList) markDirty("customers", "counter", "actions");
    if (shop.isOpen && isDayFinished()) {
      closeShop();
      emit(EVENTS.DAY_COMPLETED);
    }
  }
  function moodOf(customer) {
    const r = customer.maxPatience > 0 ? customer.patience / customer.maxPatience : 1;
    if (customer.state === "happy") return "happy";
    if (customer.state === "served") return "ok";
    if (customer.state === "leaving") return customer.satisfaction === "angry" ? "angry" : "happy";
    if (r <= 0.1) return "angry";
    if (r <= 0.3) return "impatient";
    if (r <= 0.6) return "neutral";
    return "fine";
  }

  // js/systems/weatherSystem.js
  function rollWeather() {
    const season = SEASONS[gameState.season] || SEASONS.spring;
    const id = weightedPick(season.weathers) || "sunny";
    const [lo, hi] = season.temp;
    let temp = randInt(lo, hi);
    if (id === "hot") temp = hi + randInt(0, 3);
    if (id === "cold") temp = lo - randInt(0, 3);
    if (id === "rain") temp -= 2;
    gameState.weather = id;
    gameState.temperature = temp;
    if (id === "rain") addBuff("rainBonus");
    else removeBuff("rainBonus");
    markDirty("hud", "scene");
    emit(EVENTS.WEATHER_CHANGED, getWeather());
    return getWeather();
  }
  function getWeather() {
    return WEATHERS[gameState.weather] || WEATHERS.sunny;
  }
  function weatherLabel() {
    const w = getWeather();
    const s = SEASONS[gameState.season];
    return `${w.icon} ${s.name} \xB7 ${gameState.temperature}\xB0C`;
  }

  // js/systems/calendarSystem.js
  function seasonForDay(day) {
    return SEASON_ORDER[Math.floor((day - 1) / DAYS_PER_SEASON) % SEASON_ORDER.length];
  }
  function isFestivalDay() {
    return gameState.day % DAY_CONFIG.festivalEvery === 0;
  }
  function setupDay(rollNewWeather = true) {
    const shop = gameState.shop;
    gameState.season = seasonForDay(gameState.day);
    document.documentElement.dataset.season = gameState.season;
    clearDailyBuffs();
    if (rollNewWeather) rollWeather();
    shop.isOpen = false;
    shop.dayStarted = false;
    shop.customers = [];
    shop.servedToday = 0;
    shop.leftToday = 0;
    shop.happyToday = 0;
    shop.revenueToday = 0;
    shop.xpToday = 0;
    shop.ratingStart = gameState.rating;
    shop.targetCustomers = dailyCustomerTarget();
    shop.spawnedToday = 0;
    shop.spawnTimer = 1.5;
    shop.selectedCustomerId = null;
    shop.happyHourTriggered = false;
    shop.preparation = null;
    shop.assistantPrep = null;
    gameState.stats.minigamePlaysToday = 0;
    if (isFestivalDay()) addBuff("festivalBonus");
    if (chance(DAY_CONFIG.luckyDayChance)) addBuff("luckyDay");
    markDirty("hud", "customers", "counter", "actions", "scene", "buffs", "nav");
    emit(EVENTS.DAY_STARTED, { day: gameState.day, season: gameState.season, festival: isFestivalDay() });
  }
  function daySummary() {
    const shop = gameState.shop;
    return {
      day: gameState.day,
      revenue: shop.revenueToday,
      served: shop.servedToday,
      happy: shop.happyToday,
      left: shop.leftToday,
      ratingDelta: gameState.rating - shop.ratingStart,
      xp: shop.xpToday
    };
  }
  function resumeDay() {
    const shop = gameState.shop;
    gameState.season = seasonForDay(gameState.day);
    document.documentElement.dataset.season = gameState.season;
    if (!shop.targetCustomers) shop.targetCustomers = dailyCustomerTarget();
    if (gameState.weather === "rain") addBuff("rainBonus");
    if (isFestivalDay()) addBuff("festivalBonus");
    markDirty("hud", "customers", "counter", "actions", "scene", "buffs", "nav");
  }
  function isDayFinishedOnLoad() {
    const shop = gameState.shop;
    return shop.dayStarted && shop.spawnedToday >= shop.targetCustomers && shop.customers.length === 0;
  }
  function nextDay() {
    clearPreparations();
    gameState.shop.isOpen = false;
    gameState.day += 1;
    setupDay(true);
    saveGame();
  }

  // js/systems/karinSystem.js
  function karinReady() {
    return gameState.karin.cooldown <= 0;
  }
  function bless() {
    if (!karinReady()) return false;
    gameState.karin.cooldown = KARIN.cooldown;
    gameState.karin.blessCount += 1;
    addPatienceAll(KARIN.patienceBonus);
    const money = addMoney(KARIN.luckyMoney, "karin", false);
    addBuff("karinBlessing");
    markDirty("karin", "customers");
    emit(EVENTS.KARIN_BLESS, { patience: KARIN.patienceBonus, money });
    requestSave();
    return true;
  }
  function updateKarin(dt) {
    if (gameState.karin.cooldown > 0) {
      gameState.karin.cooldown = Math.max(0, gameState.karin.cooldown - dt);
      if (gameState.karin.cooldown === 0) markDirty("karin");
    }
  }

  // js/systems/deliverySystem.js
  function freeVehicles() {
    return Math.max(0, gameState.delivery.vehicles - gameState.delivery.activeOrders.length);
  }
  function generateDailyOrders() {
    if (!isFeatureUnlocked("delivery")) return;
    const d = gameState.delivery;
    const weather = WEATHERS[gameState.weather] || WEATHERS.sunny;
    const count = Math.round((DELIVERY_CONFIG.baseOrdersPerDay + randInt(0, 2) + Math.floor(gameState.level / 3)) * weather.deliveryMul);
    d.availableOrders = [];
    const growth = 1 + DELIVERY_CONFIG.rewardGrowthPerDay * gameState.day;
    for (let i = 0; i < count; i++) {
      const dest = pick(DELIVERY_DESTINATIONS);
      const recipe = pick(unlockedRecipes());
      d.availableOrders.push({
        id: d.nextId++,
        customer: pick(["Ch\u1ECB H\u1EA1nh", "Anh T\xF9ng", "C\xF4 Mai", "B\xE9 Bo", "Th\u1EA7y H\xF9ng", "Nh\xF3m v\u0103n ph\xF2ng"]),
        destination: dest.id,
        recipeId: recipe?.id,
        duration: Math.round(dest.duration * rand(0.85, 1.15)),
        reward: Math.round(dest.reward * growth * rand(0.9, 1.2) / 1e3) * 1e3,
        status: "waiting",
        progress: 0
      });
    }
    markDirty("nav");
  }
  function acceptOrder(orderId) {
    const d = gameState.delivery;
    const idx = d.availableOrders.findIndex((o) => o.id === orderId);
    if (idx < 0) return "\u0110\u01A1n kh\xF4ng c\xF2n";
    if (freeVehicles() <= 0) return "Kh\xF4ng c\xF2n xe r\u1EA3nh";
    const [order] = d.availableOrders.splice(idx, 1);
    order.status = "delivering";
    order.progress = 0;
    order.startedAt = Date.now();
    d.activeOrders.push(order);
    emit(EVENTS.DELIVERY_STARTED, order);
    markDirty("nav");
    requestSave();
    return null;
  }
  function completeOrder(order) {
    order.status = "completed";
    const reward = Math.round(order.reward * getMultiplier("deliveryMultiplier"));
    const got = addMoney(reward, "delivery", true);
    addXp(DAY_CONFIG.xpPerServe * 1.5);
    gameState.stats.deliveriesDone += 1;
    emit(EVENTS.DELIVERY_COMPLETED, { order, reward: got });
    markDirty("nav");
    requestSave();
  }
  function updateDelivery(dt) {
    const d = gameState.delivery;
    if (!d.activeOrders.length) return;
    for (const o of d.activeOrders) o.progress = Math.min(1, o.progress + dt / o.duration);
    const done = d.activeOrders.filter((o) => o.progress >= 1);
    if (done.length) {
      d.activeOrders = d.activeOrders.filter((o) => o.progress < 1);
      for (const o of done) completeOrder(o);
    }
  }
  function completeAllDeliveries() {
    for (const o of gameState.delivery.activeOrders) o.progress = 1;
    updateDelivery(0);
  }
  function destinationOf(order) {
    return DELIVERY_DESTINATIONS.find((x) => x.id === order.destination) || DELIVERY_DESTINATIONS[0];
  }
  function initDeliverySystem() {
    on(EVENTS.SHOP_OPENED, () => generateDailyOrders());
    on(EVENTS.DAY_STARTED, () => {
      gameState.delivery.availableOrders = [];
    });
  }

  // js/systems/branchSystem.js
  var incomeTimer = 0;
  function listTemplates() {
    return BRANCH_TEMPLATES.map((t) => ({ ...t, owned: gameState.branches.some((b) => b.id === t.id) }));
  }
  function canOpenMore() {
    return gameState.branches.length < maxBranchesForLevel(gameState.level);
  }
  function branchRevenue(branch) {
    const t = BRANCH_TEMPLATES.find((x) => x.id === branch.id);
    if (!t) return 0;
    return Math.round(t.baseRevenue * branch.level * (1 + branch.reputation / 10));
  }
  function totalRevenuePerInterval() {
    return gameState.branches.reduce((s, b) => s + branchRevenue(b), 0);
  }
  function openBranch(templateId) {
    const t = BRANCH_TEMPLATES.find((x) => x.id === templateId);
    if (!t) return "Chi nh\xE1nh kh\xF4ng t\u1ED3n t\u1EA1i";
    if (gameState.branches.some((b) => b.id === templateId)) return "\u0110\xE3 s\u1EDF h\u1EEFu";
    if (!canOpenMore()) return `C\u1EA7n c\u1EA5p cao h\u01A1n \u0111\u1EC3 m\u1EDF th\xEAm (t\u1ED1i \u0111a ${maxBranchesForLevel(gameState.level)})`;
    if (!spendMoney(t.cost, "branch")) return "Kh\xF4ng \u0111\u1EE7 ti\u1EC1n";
    const branch = { id: t.id, name: t.name, level: 1, revenue: 0, reputation: 1, upgrades: 0 };
    gameState.branches.push(branch);
    unlockRecipesForLevel(gameState.level + 1);
    emit(EVENTS.BRANCH_OPENED, branch);
    markDirty("nav", "hud");
    requestSave();
    return null;
  }
  function branchUpgradeCost(branch) {
    return Math.round(BRANCH_CONFIG.upgradeBaseCost * Math.pow(UPGRADE_COST_GROWTH, branch.level) / 1e3) * 1e3;
  }
  function upgradeBranch(branchId) {
    const b = gameState.branches.find((x) => x.id === branchId);
    if (!b) return "Kh\xF4ng t\xECm th\u1EA5y chi nh\xE1nh";
    if (b.level >= BRANCH_CONFIG.maxLevel) return "\u0110\xE3 \u0111\u1EA1t c\u1EA5p t\u1ED1i \u0111a";
    if (!spendMoney(branchUpgradeCost(b), "branchUpgrade")) return "Kh\xF4ng \u0111\u1EE7 ti\u1EC1n";
    b.level += 1;
    b.reputation = Math.min(10, b.reputation + 0.5);
    markDirty("nav");
    requestSave();
    return null;
  }
  function updateBranches(dt) {
    if (!gameState.branches.length) return;
    incomeTimer += dt;
    if (incomeTimer < BRANCH_CONFIG.incomeInterval) return;
    incomeTimer -= BRANCH_CONFIG.incomeInterval;
    let total = 0;
    for (const b of gameState.branches) {
      const r = branchRevenue(b);
      b.revenue += r;
      total += r;
    }
    if (total > 0) {
      addMoney(total, "branch", false);
      emit(EVENTS.BRANCH_INCOME, total);
    }
  }
  function offlineIncome(elapsedSeconds) {
    const sec = Math.min(OFFLINE_MAX_SECONDS, Math.max(0, elapsedSeconds));
    const intervals = Math.floor(sec / BRANCH_CONFIG.incomeInterval);
    return { seconds: sec, amount: intervals * totalRevenuePerInterval() };
  }
  function incomeProgress() {
    return incomeTimer / BRANCH_CONFIG.incomeInterval;
  }

  // js/systems/achievementSystem.js
  var CONDITIONS = {
    firstServe: (s) => s.stats.totalServed >= 1,
    earn100k: (s) => s.stats.totalEarned >= 1e5,
    serve100: (s) => s.stats.totalServed >= 100,
    perfectDay: (s) => s.shop.dayStarted && !s.shop.isOpen && s.shop.servedToday >= 5 && s.shop.leftToday === 0,
    recipes10: (s) => Object.values(s.recipes).filter((r) => r.unlocked).length >= 10,
    firstBranch: (s) => s.branches.length >= 1,
    allCommon: () => allCommonIngredientsFound(),
    perfect10: (s) => s.stats.perfectCount >= 10,
    delivery10: (s) => s.stats.deliveriesDone >= 10,
    karin5: (s) => s.karin.blessCount >= 5
  };
  function listAchievements() {
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: !!gameState.achievements[a.id] }));
  }
  function checkAchievements() {
    for (const a of ACHIEVEMENTS) {
      if (gameState.achievements[a.id]) continue;
      const cond = CONDITIONS[a.id];
      let ok = false;
      try {
        ok = !!cond?.(gameState);
      } catch (err) {
        console.warn("[Achievement] l\u1ED7i \u0111i\u1EC1u ki\u1EC7n", a.id, err);
      }
      if (!ok) continue;
      gameState.achievements[a.id] = { unlockedAt: Date.now() };
      if (a.reward.money) addMoney(a.reward.money, "achievement", false);
      if (a.reward.xp) addXp(a.reward.xp);
      emit(EVENTS.ACHIEVEMENT_UNLOCKED, a);
      markDirty("nav");
      requestSave();
    }
  }
  function initAchievementSystem() {
    const triggers = [
      EVENTS.CUSTOMER_SERVED,
      EVENTS.MONEY_EARNED,
      EVENTS.DAY_COMPLETED,
      EVENTS.RECIPE_UNLOCKED,
      EVENTS.BRANCH_OPENED,
      EVENTS.DISCOVERY,
      EVENTS.DELIVERY_COMPLETED,
      EVENTS.KARIN_BLESS,
      EVENTS.LEVEL_UP
    ];
    for (const t of triggers) on(t, () => checkAchievements());
  }

  // js/systems/offlineSystem.js
  function applyOfflineProgress(elapsedSeconds) {
    if (elapsedSeconds < 60 || !gameState.branches.length) return null;
    const { seconds, amount } = offlineIncome(elapsedSeconds);
    if (amount <= 0) return null;
    addMoney(amount, "offline", false);
    const result = { seconds, amount };
    emit(EVENTS.OFFLINE_PROGRESS, result);
    return result;
  }

  // js/systems/audioSystem.js
  var ctx = null;
  var masterGain = null;
  var musicGain = null;
  var musicTimer = null;
  var musicStep = 0;
  var unlocked = false;
  function ensureContext() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.35;
      masterGain.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.12;
      musicGain.connect(ctx.destination);
    } catch (err) {
      console.warn("[Audio] Kh\xF4ng t\u1EA1o \u0111\u01B0\u1EE3c AudioContext", err);
      ctx = null;
    }
    return ctx;
  }
  function unlockAudio() {
    if (unlocked) return;
    const c = ensureContext();
    if (!c) return;
    unlocked = true;
    if (c.state === "suspended") c.resume().catch(() => {
    });
    if (gameState.settings.music) startMusic();
  }
  function tone(freq, duration, type = "sine", volume = 1, when = 0) {
    if (!ctx || !gameState.settings.sound) return;
    try {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const t = ctx.currentTime + when;
      g.gain.setValueAtTime(1e-4, t);
      g.gain.exponentialRampToValueAtTime(volume, t + 0.01);
      g.gain.exponentialRampToValueAtTime(1e-4, t + duration);
      osc.connect(g).connect(masterGain);
      osc.start(t);
      osc.stop(t + duration + 0.05);
    } catch (err) {
      console.warn("[Audio] tone l\u1ED7i", err);
    }
  }
  var SFX = {
    click: () => tone(660, 0.07, "triangle", 0.5),
    success: () => {
      tone(523, 0.12, "triangle");
      tone(659, 0.12, "triangle", 1, 0.1);
      tone(784, 0.2, "triangle", 1, 0.2);
    },
    error: () => {
      tone(220, 0.15, "sawtooth", 0.5);
      tone(180, 0.2, "sawtooth", 0.5, 0.12);
    },
    coin: () => {
      tone(1046, 0.08, "square", 0.35);
      tone(1318, 0.14, "square", 0.35, 0.07);
    },
    serve: () => {
      tone(740, 0.1, "sine");
      tone(988, 0.16, "sine", 1, 0.08);
    },
    happy: () => {
      tone(880, 0.1, "triangle");
      tone(1108, 0.1, "triangle", 1, 0.1);
      tone(1318, 0.18, "triangle", 1, 0.2);
    },
    levelup: () => {
      [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.22, "triangle", 1, i * 0.09));
    },
    unlock: () => {
      tone(698, 0.12, "sine");
      tone(932, 0.12, "sine", 1, 0.1);
      tone(1174, 0.25, "sine", 1, 0.2);
    },
    sparkle: () => {
      [1568, 1975, 2349].forEach((f, i) => tone(f, 0.1, "sine", 0.5, i * 0.05));
    },
    pop: () => tone(440, 0.06, "square", 0.3),
    sad: () => {
      tone(392, 0.15, "sine");
      tone(311, 0.3, "sine", 1, 0.14);
    }
  };
  function playSfx(name) {
    if (!unlocked || !ctx) return;
    SFX[name]?.();
  }
  var MELODY = [523, 659, 784, 659, 698, 880, 784, 0, 587, 740, 880, 740, 784, 988, 880, 0];
  var BASS = [262, 0, 330, 0, 349, 0, 392, 0, 294, 0, 370, 0, 392, 0, 440, 0];
  function startMusic() {
    if (musicTimer || !ctx) return;
    musicStep = 0;
    musicTimer = setInterval(() => {
      if (!gameState.settings.music || !ctx) return;
      try {
        const i = musicStep % MELODY.length;
        const t = ctx.currentTime;
        for (const [arr, type, vol, len] of [[MELODY, "triangle", 0.5, 0.28], [BASS, "sine", 0.35, 0.5]]) {
          const f = arr[i];
          if (!f) continue;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = type;
          osc.frequency.value = f;
          g.gain.setValueAtTime(1e-4, t);
          g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
          g.gain.exponentialRampToValueAtTime(1e-4, t + len);
          osc.connect(g).connect(musicGain);
          osc.start(t);
          osc.stop(t + len + 0.05);
        }
      } catch (err) {
        console.warn("[Audio] music l\u1ED7i", err);
      }
      musicStep++;
    }, 300);
  }
  function stopMusic() {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }
  function setSound(v) {
    gameState.settings.sound = !!v;
    emit(EVENTS.SETTINGS_CHANGED, gameState.settings);
    requestSave();
  }
  function setMusic(v) {
    gameState.settings.music = !!v;
    if (v && unlocked) startMusic();
    else stopMusic();
    emit(EVENTS.SETTINGS_CHANGED, gameState.settings);
    requestSave();
  }
  function initAudioSystem() {
    const unlockOnce = () => {
      unlockAudio();
      window.removeEventListener("pointerdown", unlockOnce);
      window.removeEventListener("keydown", unlockOnce);
    };
    window.addEventListener("pointerdown", unlockOnce);
    window.addEventListener("keydown", unlockOnce);
    on(EVENTS.CUSTOMER_SERVED, ({ quality }) => playSfx(quality === "PERFECT" ? "happy" : "serve"));
    on(EVENTS.PREP_RESULT, ({ quality }) => {
      if (quality === "FAILED") playSfx("error");
    });
    on(EVENTS.MONEY_EARNED, ({ source }) => {
      if (source === "serve" || source === "delivery" || source === "tip") playSfx("coin");
    });
    on(EVENTS.LEVEL_UP, () => playSfx("levelup"));
    on(EVENTS.RECIPE_UNLOCKED, () => playSfx("unlock"));
    on(EVENTS.ACHIEVEMENT_UNLOCKED, () => playSfx("unlock"));
    on(EVENTS.KARIN_BLESS, () => playSfx("sparkle"));
    on(EVENTS.CUSTOMER_LEFT, () => playSfx("sad"));
    on(EVENTS.DISCOVERY, () => playSfx("sparkle"));
    on(EVENTS.STATE_LOADED, () => {
      if (unlocked) {
        if (gameState.settings.music) startMusic();
        else stopMusic();
      }
    });
    markDirty("hud");
  }

  // js/ui/modalUI.js
  var root = () => document.getElementById("modalRoot");
  var stack = [];
  function openModal(opts) {
    const { title, body, foot = null, center = false, closeOnBackdrop = true, onClose = null, id = "", hideClose = false } = opts;
    if (id) {
      const existing = stack.find((m) => m.id === id);
      if (existing) return existing;
    }
    const backdrop = html(`<div class="modal-backdrop ${center ? "center" : ""}"></div>`);
    const modal = html(`
    <div class="modal ${center ? "modal-center" : ""}" role="dialog" aria-modal="true" aria-label="${title}">
      <div class="modal-head"><h2>${title}</h2>${hideClose ? "" : '<button class="modal-close" aria-label="\u0110\xF3ng">\u2715</button>'}</div>
      <div class="modal-body"></div>
    </div>`);
    const bodyEl = modal.querySelector(".modal-body");
    if (typeof body === "string") bodyEl.innerHTML = body;
    else if (body) bodyEl.appendChild(body);
    if (foot) {
      const f = html('<div class="modal-foot"></div>');
      f.appendChild(foot);
      modal.appendChild(f);
    }
    backdrop.appendChild(modal);
    root().appendChild(backdrop);
    const handle = { id, el: modal, body: bodyEl, close };
    function close() {
      const idx = stack.indexOf(handle);
      if (idx < 0) return;
      stack.splice(idx, 1);
      backdrop.remove();
      if (onClose) onClose();
    }
    modal.querySelector(".modal-close")?.addEventListener("click", () => {
      playSfx("click");
      close();
    });
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop && closeOnBackdrop) close();
    });
    stack.push(handle);
    requestAnimationFrame(() => (modal.querySelector(".modal-close") || modal).focus?.());
    return handle;
  }
  var queue = [];
  var queueActive = false;
  function queueModal(openFn) {
    queue.push(openFn);
    pumpQueue();
  }
  function pumpQueue() {
    if (queueActive || !queue.length) return;
    const fn = queue.shift();
    queueActive = true;
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      queueActive = false;
      setTimeout(pumpQueue, 120);
    };
    try {
      fn(done);
    } catch (err) {
      console.error("[Modal] l\u1ED7i queue", err);
      done();
    }
  }
  function closeTopModal() {
    const top = stack[stack.length - 1];
    top?.close();
  }
  function closeAllModals() {
    while (stack.length) stack[stack.length - 1].close();
  }
  function isModalOpen(id) {
    return id ? stack.some((m) => m.id === id) : stack.length > 0;
  }
  function confirmModal(title, message, onYes, yesLabel = "\u0110\u1ED3ng \xFD") {
    const foot = html(`<div class="row grow" style="width:100%"><button class="btn btn-soft grow" data-no>H\u1EE7y</button><button class="btn btn-danger grow" data-yes>${yesLabel}</button></div>`);
    const m = openModal({ title, body: `<p>${message}</p>`, foot, center: true });
    foot.querySelector("[data-no]").addEventListener("click", m.close);
    foot.querySelector("[data-yes]").addEventListener("click", () => {
      m.close();
      onYes();
    });
    return m;
  }
  function initModalUI() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeTopModal();
    });
  }

  // js/ui/toastUI.js
  function toast(message, type = "info", duration = 2200) {
    const root2 = document.getElementById("toastRoot");
    if (!root2) return;
    const el = html(`<div class="toast ${type}" role="status">${esc(message)}</div>`);
    root2.appendChild(el);
    while (root2.children.length > 4) root2.firstElementChild.remove();
    setTimeout(() => {
      el.classList.add("out");
      setTimeout(() => el.remove(), 260);
    }, duration);
  }
  function initToastUI() {
    on(EVENTS.TOAST, ({ message, type }) => toast(message, type));
  }

  // js/ui/tutorialUI.js
  var STEPS = [
    { text: "\u0110\xE2y l\xE0 qu\u1EA7y c\u1EE7a b\u1EA1n. M\u1ECDi ly tr\xE0 ngon \u0111\u1EC1u ra \u0111\u1EDDi \u1EDF \u0111\xE2y \u{1FAD6}", target: "#counter" },
    { text: 'Kh\xE1ch s\u1EBD xu\u1EA5t hi\u1EC7n \u1EDF khu n\xE0y sau khi b\u1EA1n b\u1EA5m "M\u1EDF c\u1EEDa". M\u1ED7i kh\xE1ch c\xF3 thanh ki\xEAn nh\u1EABn, \u0111\u1EEBng \u0111\u1EC3 n\xF3 c\u1EA1n!', target: "#customerArea" },
    { text: "Kh\xE1ch mu\u1ED1n m\u1ED9t m\xF3n. Ch\u1EA1m v\xE0o kh\xE1ch \u0111\u1EC3 xem c\xF4ng th\u1EE9c h\u1ECD g\u1ECDi.", target: "#customerArea" },
    { text: 'Ki\u1EC3m tra nguy\xEAn li\u1EC7u r\u1ED3i b\u1EA5m "Pha ch\u1EBF". Thi\u1EBFu g\xEC th\xEC gh\xE9 Kho \u0111\u1EC3 mua.', target: "#counter" },
    { text: 'Khi pha xong, m\u1ED9t thanh timing hi\u1EC7n ra. B\u1EA5m "PH\u1EE4C V\u1EE4" l\xFAc v\u1EA1ch \u1EDF v\xF9ng xanh \u0111\u1EADm \u0111\u1EC3 \u0111\u01B0\u1EE3c PERFECT (+20% ti\u1EC1n)!', target: "#counter" },
    { text: "Nh\u1EADn ti\u1EC1n, t\u0103ng rating v\xE0 XP. L\xEAn c\u1EA5p s\u1EBD m\u1EDF c\xF4ng th\u1EE9c, giao h\xE0ng v\xE0 chi nh\xE1nh.", target: "#hud" },
    { text: "D\xF9ng ti\u1EC1n \u0111\u1EC3 n\xE2ng c\u1EA5p ti\u1EC7m: pha nhanh h\u01A1n, kh\xE1ch ki\xEAn nh\u1EABn h\u01A1n, th\xEAm ch\u1ED7 ng\u1ED3i.", target: "#shopActions" },
    { text: 'Khi kh\xE1ch s\u1ED1t ru\u1ED9t, nh\u1EDD Karin "Xin Ph\u01B0\u1EDBc": +20s ki\xEAn nh\u1EABn cho m\u1ECDi kh\xE1ch v\xE0 ti\u1EC1n may m\u1EAFn \u{1F430}', target: "#karinArea" }
  ];
  var box = null;
  var highlighted = null;
  function clearHighlight() {
    highlighted?.classList.remove("tutorial-highlight");
    highlighted = null;
  }
  function finish() {
    clearHighlight();
    box?.remove();
    box = null;
    gameState.tutorial.done = true;
    gameState.tutorial.step = 0;
    requestSave();
  }
  function showStep(i) {
    clearHighlight();
    if (i >= STEPS.length) {
      finish();
      return;
    }
    const step = STEPS[i];
    gameState.tutorial.step = i;
    const target = document.querySelector(step.target);
    if (target) {
      target.classList.add("tutorial-highlight");
      highlighted = target;
    }
    if (!box) {
      box = html('<div class="tutorial-box" role="dialog" aria-label="H\u01B0\u1EDBng d\u1EABn"></div>');
      document.getElementById("app").appendChild(box);
    }
    box.innerHTML = `<div class="step">H\u01AF\u1EDANG D\u1EAAN ${i + 1}/${STEPS.length}</div><p>${esc(step.text)}</p>
    <div class="row"><button class="btn btn-soft btn-sm" data-skip>B\u1ECF qua h\u01B0\u1EDBng d\u1EABn</button><span class="grow"></span><button class="btn btn-primary btn-sm" data-next>${i === STEPS.length - 1 ? "B\u1EAFt \u0111\u1EA7u! \u{1F389}" : "Ti\u1EBFp \u2192"}</button></div>`;
    box.querySelector("[data-skip]").addEventListener("click", () => {
      playSfx("click");
      finish();
    });
    box.querySelector("[data-next]").addEventListener("click", () => {
      playSfx("click");
      showStep(i + 1);
    });
  }
  function openTutorial(force = false) {
    if (!force && gameState.tutorial.done) return;
    const body = html('<div class="col center"><div class="summary-emoji">\u{1F9CB}</div><p class="bold">Ch\xE0o m\u1EEBng \u0111\u1EBFn Ti\u1EC7m Tr\xE0 M\u01A1 \u01AF\u1EDBc!</p><p class="muted">B\u1EA1n v\u1EEBa nh\u1EADn m\u1ED9t ti\u1EC7m tr\xE0 nh\u1ECF xinh. H\xE3y pha nh\u1EEFng ly tr\xE0 ngon, l\xE0m kh\xE1ch vui v\xE0 bi\u1EBFn n\xF3 th\xE0nh th\u01B0\u01A1ng hi\u1EC7u trong m\u01A1 nh\xE9.</p></div>');
    const foot = html('<div class="row" style="width:100%"><button class="btn btn-soft grow" data-skip>B\u1ECF qua</button><button class="btn btn-primary grow" data-go>H\u01B0\u1EDBng d\u1EABn</button></div>');
    const m = openModal({ title: "\u{1F338} Xin ch\xE0o!", body, foot, center: true, closeOnBackdrop: false, hideClose: true });
    foot.querySelector("[data-skip]").addEventListener("click", () => {
      m.close();
      finish();
    });
    foot.querySelector("[data-go]").addEventListener("click", () => {
      m.close();
      showStep(0);
    });
  }

  // js/ui/achievementUI.js
  function openAchievements() {
    const list = listAchievements();
    const body = html(`<div class="col"><p class="muted center">\u0110\u1EA1t ${list.filter((a) => a.unlocked).length}/${list.length}</p>${list.map((a) => `<div class="ach-row ${a.unlocked ? "done" : ""}"><span class="ico">${a.unlocked ? a.icon : "\u{1F512}"}</span>
      <div class="grow"><div class="bold">${esc(a.name)}</div><div class="muted">${esc(a.description)}</div></div>
      <span class="small money">${formatMoney(a.reward.money)}${a.reward.xp ? ` \xB7 ${a.reward.xp}XP` : ""}</span></div>`).join("")}</div>`);
    openModal({ title: "\u{1F3C6} Th\xE0nh t\u1EF1u", body, id: "achievements" });
  }
  function initAchievementUI() {
    on(EVENTS.ACHIEVEMENT_UNLOCKED, (a) => toast(`\u{1F3C6} Th\xE0nh t\u1EF1u: ${a.name} (+${formatMoney(a.reward.money)})`, "gold", 3e3));
  }

  // js/ui/settingsUI.js
  function toggleRow(label, icon, value, onChange) {
    const row = html(`<button class="toggle" role="switch" aria-checked="${value}" aria-label="${label}"><span>${icon} ${label}</span><span class="sw ${value ? "on" : ""}"></span></button>`);
    row.addEventListener("click", () => {
      const next = row.getAttribute("aria-checked") !== "true";
      row.setAttribute("aria-checked", String(next));
      row.querySelector(".sw").classList.toggle("on", next);
      onChange(next);
      playSfx("click");
    });
    return row;
  }
  function openSettings() {
    const body = html('<div class="col"></div>');
    body.appendChild(toggleRow("\xC2m thanh", "\u{1F50A}", gameState.settings.sound, setSound));
    body.appendChild(toggleRow("Nh\u1EA1c n\u1EC1n", "\u{1F3B5}", gameState.settings.music, setMusic));
    const info = html(`<p class="muted center">${isStorageAvailable() ? "T\u1EF1 \u0111\u1ED9ng l\u01B0u m\u1ED7i 30 gi\xE2y v\xE0 sau m\u1ED7i giao d\u1ECBch." : "\u26A0\uFE0F Tr\xECnh duy\u1EC7t ch\u1EB7n l\u01B0u tr\u1EEF: ti\u1EBFn tr\xECnh ch\u1EC9 gi\u1EEF trong phi\xEAn n\xE0y."}</p>`);
    body.appendChild(info);
    const btns = html(`<div class="col">
    <button class="btn btn-soft" data-ach>\u{1F3C6} Th\xE0nh t\u1EF1u</button>
    <button class="btn btn-soft" data-tut>\u{1F4D6} Xem l\u1EA1i h\u01B0\u1EDBng d\u1EABn</button>
    <button class="btn btn-primary" data-save>\u{1F4BE} L\u01B0u ngay</button>
    <button class="btn btn-danger" data-reset>\u{1F5D1}\uFE0F Ch\u01A1i l\u1EA1i t\u1EEB \u0111\u1EA7u</button>
  </div>`);
    body.appendChild(btns);
    const m = openModal({ title: "\u2699\uFE0F C\xE0i \u0111\u1EB7t", body });
    btns.querySelector("[data-save]").addEventListener("click", () => {
      toast(saveGame() ? "\u0110\xE3 l\u01B0u game \u{1F4BE}" : "Kh\xF4ng l\u01B0u \u0111\u01B0\u1EE3c (storage b\u1ECB ch\u1EB7n)", saveGame() ? "success" : "error");
    });
    btns.querySelector("[data-ach]").addEventListener("click", () => openAchievements());
    btns.querySelector("[data-tut]").addEventListener("click", () => {
      m.close();
      openTutorial(true);
    });
    btns.querySelector("[data-reset]").addEventListener("click", () => {
      confirmModal("Ch\u01A1i l\u1EA1i t\u1EEB \u0111\u1EA7u?", "To\xE0n b\u1ED9 ti\u1EBFn tr\xECnh s\u1EBD b\u1ECB x\xF3a. B\u1EA1n ch\u1EAFc ch\u1EE9?", () => {
        closeAllModals();
        resetGame();
        toast("\u0110\xE3 \u0111\u1EB7t l\u1EA1i game", "info");
      }, "X\xF3a v\xE0 ch\u01A1i l\u1EA1i");
    });
  }

  // js/ui/hudUI.js
  var lastMoney = null;
  function renderHud() {
    const el = document.getElementById("hud");
    if (!el) return;
    const w = getWeather();
    const xp = xpProgress();
    el.innerHTML = `
    <div class="hud-row">
      <span class="pill" title="Ng\xE0y">\u{1F4C5} Ng\xE0y ${gameState.day}</span>
      <span class="pill" title="${esc(w.tip)}">${esc(weatherLabel())}</span>
      <span class="hud-spacer"></span>
      <button class="hud-icon-btn" data-pause aria-label="${isPaused() ? "Ti\u1EBFp t\u1EE5c" : "T\u1EA1m d\u1EEBng"}">${isPaused() ? "\u25B6\uFE0F" : "\u23F8\uFE0F"}</button>
      <button class="hud-icon-btn" data-settings aria-label="C\xE0i \u0111\u1EB7t">\u2699\uFE0F</button>
    </div>
    <div class="hud-row">
      <span class="pill money" data-hud-money>\u{1F4B0} ${formatMoney(gameState.money)}</span>
      <span class="pill" title="\u0110\xE1nh gi\xE1">\u2B50 ${formatRating(gameState.rating)}</span>
      <span class="hud-spacer"></span>
      <span class="hud-level">C\u1EA5p ${gameState.level} \xB7 ${gameState.experience}/${xp.next === Infinity ? "MAX" : xp.next} XP</span>
    </div>
    <div class="hud-xp" title="Kinh nghi\u1EC7m" aria-label="Kinh nghi\u1EC7m"><span style="width:${(xp.ratio * 100).toFixed(1)}%"></span></div>
  `;
    el.querySelector("[data-pause]").addEventListener("click", togglePause);
    el.querySelector("[data-settings]").addEventListener("click", () => {
      playSfx("click");
      openSettings();
    });
    const moneyEl = el.querySelector("[data-hud-money]");
    if (lastMoney !== null && gameState.money > lastMoney) moneyEl.classList.add("bounce");
    lastMoney = gameState.money;
  }
  var pauseModal = null;
  function togglePause() {
    playSfx("click");
    if (isPaused()) {
      setPaused(false);
      pauseModal?.close();
      pauseModal = null;
    } else {
      setPaused(true);
      const foot = html('<button class="btn btn-primary btn-block">\u25B6\uFE0F Ti\u1EBFp t\u1EE5c</button>');
      pauseModal = openModal({ title: "\u23F8\uFE0F T\u1EA1m d\u1EEBng", body: '<p class="center">Kh\xE1ch \u0111ang ch\u1EDD b\u1EA1n quay l\u1EA1i \u{1FAD6}</p>', foot, center: true, closeOnBackdrop: false, hideClose: true, onClose: () => {
        setPaused(false);
        pauseModal = null;
        renderHud();
      } });
      foot.addEventListener("click", () => pauseModal.close());
      toast("\u0110\xE3 t\u1EA1m d\u1EEBng", "info", 1200);
    }
    renderHud();
  }

  // js/ui/customerUI.js
  var MOOD_ICON = { fine: "", neutral: "", impatient: "\u{1F624}", angry: "\u{1F621}", happy: "\u{1F60D}", ok: "\u{1F642}" };
  function renderCustomers() {
    const area = document.getElementById("customerArea");
    if (!area) return;
    const shop = gameState.shop;
    if (!shop.customers.length) {
      let msg = 'B\u1EA5m "M\u1EDF c\u1EEDa" \u0111\u1EC3 \u0111\xF3n kh\xE1ch \u2600\uFE0F';
      if (shop.isOpen) msg = "Kh\xE1ch s\u1EAFp \u0111\u1EBFn... \u{1F6B6}";
      else if (shop.dayStarted) msg = "H\u1EBFt kh\xE1ch h\xF4m nay \u{1F319}";
      area.innerHTML = `<div class="customer-empty">${msg}</div>`;
      return;
    }
    area.innerHTML = shop.customers.map((c) => {
      const recipe = RECIPE_MAP[c.order?.recipeId];
      const mood = moodOf(c);
      const req = c.order?.specialRequest ? `<span class="req">${esc(specialRequestName(c.order.specialRequest))}</span>` : "";
      const qty = c.order?.quantity > 1 ? ` \xD7${c.order.quantity}` : "";
      const selected = shop.selectedCustomerId === c.id ? "selected" : "";
      const byAssistant = c.handledBy === "assistant" ? '<span class="small">\u{1F469}\u200D\u{1F373} tr\u1EE3 l\xFD</span>' : "";
      return `
      <button class="customer state-${c.state} mood-${mood} ${selected} ${c.vip ? "vip" : ""}" data-cid="${c.id}" aria-label="Kh\xE1ch ${esc(c.name)} mu\u1ED1n ${esc(recipe?.name || "")}" ${c.state === "leaving" ? "disabled" : ""}>
        ${c.vip ? '<span class="vip-tag">VIP</span>' : ""}
        <span class="mood" data-mood>${MOOD_ICON[mood] || ""}</span>
        <span class="avatar">${c.avatar}</span>
        <span class="cname">${esc(c.name)}</span>
        <span class="bubble"><span class="ico">${recipe?.icon || "\u2753"}</span>${esc(recipe?.name || "???")}${qty}${req}</span>
        ${byAssistant}
        <span class="bar" data-bar><span style="width:${(c.patience / c.maxPatience * 100).toFixed(0)}%"></span></span>
      </button>`;
    }).join("");
    for (const btn of area.querySelectorAll("[data-cid]")) {
      btn.addEventListener("click", () => {
        playSfx("click");
        selectCustomer(Number(btn.dataset.cid));
      });
    }
  }
  function updatePatienceBars() {
    const area = document.getElementById("customerArea");
    if (!area) return;
    for (const c of gameState.shop.customers) {
      const btn = area.querySelector(`[data-cid="${c.id}"]`);
      if (!btn) continue;
      const bar = btn.querySelector("[data-bar]");
      const ratio = c.maxPatience > 0 ? c.patience / c.maxPatience : 0;
      bar.firstElementChild.style.width = `${(ratio * 100).toFixed(0)}%`;
      bar.classList.toggle("warn", ratio <= 0.6 && ratio > 0.3);
      bar.classList.toggle("danger", ratio <= 0.3);
      const mood = moodOf(c);
      const cls = `mood-${mood}`;
      if (!btn.classList.contains(cls)) {
        btn.className = btn.className.replace(/mood-\w+/, cls);
        btn.querySelector("[data-mood]").textContent = MOOD_ICON[mood] || "";
        if (mood === "impatient") markDirty("counter");
      }
    }
  }

  // js/ui/fxUI.js
  var layer = () => document.getElementById("fxLayer");
  var reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  function centerOf(target) {
    if (!target) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    if (typeof target.x === "number") return target;
    const r = target.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function spawn(el, ms) {
    const root2 = layer();
    if (!root2) return;
    root2.appendChild(el);
    setTimeout(() => el.remove(), ms);
  }
  function floatText(text, target, color = "") {
    const { x, y } = centerOf(target);
    const el = html(`<div class="fx-float ${color}" style="left:${x}px;top:${y}px">${esc(text)}</div>`);
    spawn(el, 950);
  }
  function coinFly(target, count = 5) {
    if (reduced()) return;
    const from = centerOf(target);
    const to = centerOf(document.querySelector("[data-hud-money]"));
    for (let i = 0; i < count; i++) {
      const sx = from.x + rand(-20, 20);
      const sy = from.y + rand(-10, 10);
      const el = html(`<div class="fx-coin" style="left:${sx}px;top:${sy}px;--dx:${to.x - sx}px;--dy:${to.y - sy}px;animation-delay:${i * 40}ms">\u{1FA99}</div>`);
      spawn(el, 900 + i * 40);
    }
  }
  function sparkle(target, count = 8) {
    if (reduced()) return;
    const { x, y } = centerOf(target);
    for (let i = 0; i < count; i++) {
      const a = i / count * Math.PI * 2;
      const d = rand(30, 60);
      const el = html(`<div class="fx-spark" style="left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px">\u2728</div>`);
      spawn(el, 750);
    }
  }
  function hearts(target, count = 3) {
    if (reduced()) return;
    const { x, y } = centerOf(target);
    for (let i = 0; i < count; i++) {
      const el = html(`<div class="fx-heart" style="left:${x + rand(-18, 18)}px;top:${y - 10}px;animation-delay:${i * 120}ms">\u{1F497}</div>`);
      spawn(el, 900 + i * 120);
    }
  }
  function burst(target) {
    if (reduced()) return;
    const { x, y } = centerOf(target);
    spawn(html(`<div class="fx-burst" style="left:${x}px;top:${y}px"></div>`), 650);
  }
  function shake(el) {
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
  }
  function bounce(el) {
    if (!el) return;
    el.classList.remove("bounce");
    void el.offsetWidth;
    el.classList.add("bounce");
  }

  // js/ui/inventoryUI.js
  var current = null;
  function render2(body) {
    const items = listIngredients();
    body.innerHTML = `<div class="row between"><span class="bold">\u{1F4B0} ${formatMoney(gameState.money)}</span><span class="muted">Ch\u1EA1m +1 / +5 / \u0110\u1EA7y \u0111\u1EC3 mua</span></div>
    <div class="grid-auto">${items.map((i) => {
      const full = i.stock >= i.maxStock;
      const fillQty = i.maxStock - i.stock;
      if (!i.unlocked) return `<div class="item-card locked rarity-${i.rarity}"><span class="ico">\u{1F512}</span><span class="name">${esc(i.name)}</span><span class="muted">M\u1EDF \u1EDF c\u1EA5p ${i.unlockLevel}</span></div>`;
      return `<div class="item-card rarity-${i.rarity}" data-ing="${i.id}">
          <div class="row between"><span class="ico">${i.icon}</span><span class="rarity">${i.stock}/${i.maxStock}</span></div>
          <span class="name">${esc(i.name)}</span>
          <span class="bar ${i.stock <= 2 ? "danger" : ""}"><span style="width:${(i.stock / i.maxStock * 100).toFixed(0)}%"></span></span>
          <span class="muted">${formatMoney(i.cost)}/c\xE1i</span>
          <div class="row">
            <button class="btn btn-sm btn-soft grow" data-buy="1" ${full ? "disabled" : ""} aria-label="Mua 1 ${esc(i.name)}">+1</button>
            <button class="btn btn-sm btn-soft grow" data-buy="5" ${full ? "disabled" : ""} aria-label="Mua 5 ${esc(i.name)}">+5</button>
            <button class="btn btn-sm btn-warm grow" data-buy="${fillQty}" ${full ? "disabled" : ""} aria-label="Mua \u0111\u1EA7y ${esc(i.name)}">\u0110\u1EA7y</button>
          </div>
        </div>`;
    }).join("")}</div>`;
    for (const btn of body.querySelectorAll("[data-buy]")) {
      btn.addEventListener("click", (e) => {
        const id = btn.closest("[data-ing]").dataset.ing;
        const err = buyIngredient(id, Number(btn.dataset.buy));
        if (err) {
          toast(err, "error");
          playSfx("error");
        } else {
          playSfx("pop");
          floatText("+" + btn.dataset.buy, e.currentTarget, "green");
          render2(body);
        }
      });
    }
  }
  function openInventory() {
    if (current) return;
    const body = html('<div class="col"></div>');
    render2(body);
    current = openModal({ title: "\u{1F4E6} Kho nguy\xEAn li\u1EC7u", body, id: "inventory", onClose: () => current = null });
  }
  function initInventoryUI() {
    on(EVENTS.MONEY_EARNED, () => current && render2(current.body));
  }

  // js/ui/orderUI.js
  function ingredientChips(ingredients) {
    return Object.entries(ingredients).map(([id, qty]) => {
      const def = INGREDIENT_MAP[id];
      const stock = getStock(id);
      const missing = stock < qty ? "missing" : "";
      return `<span class="ing-chip ${missing}" title="${esc(def?.name || id)}">${def?.icon || "?"} ${qty} <span class="muted">(${stock})</span></span>`;
    }).join("");
  }
  function assistantBlock() {
    const lvl = getUpgradeLevel("assistant");
    if (lvl <= 0) return "";
    const prep = gameState.shop.assistantPrep;
    const recipe = prep ? RECIPE_MAP[prep.recipeId] : null;
    const pct = prep ? Math.min(100, prep.elapsed / prep.total * 100).toFixed(0) : 0;
    return `<div class="assistant-slot" data-assistant>\u{1F469}\u200D\u{1F373} Tr\u1EE3 l\xFD: ${prep ? `${recipe?.icon || ""} ${esc(recipe?.name || "")}` : "\u0111ang r\u1EA3nh"}
    <span class="bar"><span data-assistant-bar style="width:${pct}%"></span></span></div>`;
  }
  function renderCounter() {
    const el = document.getElementById("counter");
    if (!el) return;
    const shop = gameState.shop;
    const prep = shop.preparation;
    const customer = prep ? shop.customers.find((c) => c.id === prep.customerId) : getSelectedCustomer();
    const head = `<div class="counter-title"><span>\u{1FAD6} QU\u1EA6Y PHA CH\u1EBE</span><span>${prep ? "\u0110ang pha..." : customer ? "Order" : ""}</span></div>`;
    if (!customer) {
      el.innerHTML = `${head}<div class="counter-idle">${shop.customers.length ? "\u{1F446} Ch\u1EA1m v\xE0o m\u1ED9t kh\xE1ch \u0111\u1EC3 xem order" : "Qu\u1EA7y \u0111ang tr\u1ED1ng"}</div>${assistantBlock()}`;
      return;
    }
    const recipe = RECIPE_MAP[customer.order.recipeId];
    if (!recipe) {
      el.innerHTML = `${head}<div class="counter-idle">C\xF4ng th\u1EE9c kh\xF4ng t\u1ED3n t\u1EA1i</div>`;
      return;
    }
    const req = customer.order.specialRequest ? `<span class="tag">${esc(specialRequestName(customer.order.specialRequest))}</span>` : "";
    const qty = customer.order.quantity > 1 ? `<span class="tag">\xD7${customer.order.quantity}</span>` : "";
    const orderHead = `
    <div class="order-head">
      <span class="big">${recipe.icon}</span>
      <div class="grow"><div class="bold">${esc(recipe.name)} ${qty} ${req}</div>
      <div class="muted">${esc(customer.name)} \xB7 <span class="money">${formatMoney(recipe.price * customer.order.quantity)}</span> \xB7 ${recipe.preparationTime}s</div></div>
    </div>`;
    if (!prep) {
      const missing = Object.entries(recipe.ingredients).some(([id, q]) => getStock(id) < q);
      const busy = customer.handledBy === "assistant";
      el.innerHTML = `${head}<div class="order-panel">${orderHead}
      <div class="order-ings">${ingredientChips(recipe.ingredients)}</div>
      <div class="row">
        <button class="btn btn-primary grow" data-prep ${missing || busy ? "disabled" : ""} aria-label="Pha ch\u1EBF">${busy ? "\u{1F469}\u200D\u{1F373} Tr\u1EE3 l\xFD \u0111ang pha" : "\u{1FAD6} Pha ch\u1EBF"}</button>
        ${missing ? '<button class="btn btn-warm" data-buy aria-label="Mua nguy\xEAn li\u1EC7u">\u{1F6D2} Mua</button>' : ""}
      </div></div>${assistantBlock()}`;
      el.querySelector("[data-prep]")?.addEventListener("click", (e) => {
        const err = startPreparation(customer.id);
        if (err) {
          toast(err, "error");
          shake(e.currentTarget);
          playSfx("error");
        } else playSfx("pop");
      });
      el.querySelector("[data-buy]")?.addEventListener("click", () => {
        playSfx("click");
        openInventory();
      });
      return;
    }
    if (prep.phase === "brewing") {
      const pct = Math.min(100, prep.elapsed / prep.total * 100).toFixed(0);
      el.innerHTML = `${head}<div class="order-panel">${orderHead}
      <div class="bar prep-bar"><span data-prep-bar style="width:${pct}%"></span></div>
      <div class="row between"><span class="muted">\u0110ang pha... \u2615</span><button class="btn btn-sm btn-soft" data-cancel aria-label="H\u1EE7y pha">H\u1EE7y</button></div>
    </div>${assistantBlock()}`;
      el.querySelector("[data-cancel]").addEventListener("click", () => {
        cancelPreparation();
        toast("\u0110\xE3 h\u1EE7y, nguy\xEAn li\u1EC7u kh\xF4ng ho\xE0n l\u1EA1i", "info");
      });
      return;
    }
    el.innerHTML = `${head}<div class="order-panel">${orderHead}
    <div class="timing-label" data-timing-label>B\u1EA5m khi v\u1EA1ch \u1EDF v\xF9ng xanh \u0111\u1EADm!</div>
    <div class="timing" aria-hidden="true"><div class="marker" data-marker></div></div>
    <button class="btn btn-warm btn-block" data-serve aria-label="Ph\u1EE5c v\u1EE5">\u{1F964} PH\u1EE4C V\u1EE4!</button>
  </div>${assistantBlock()}`;
    const serveBtn = el.querySelector("[data-serve]");
    const doServe = () => {
      const result = serveCurrent();
      if (!result) return;
      showServeResult(result, serveBtn);
    };
    serveBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      doServe();
    });
    serveBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        doServe();
      }
    });
  }
  function showServeResult(result, anchor) {
    const q = QUALITY[result.quality];
    const target = anchor || $("#counter");
    if (result.quality === "FAILED") {
      floatText("FAILED \u{1F616}", target, "red");
      toast("Pha h\u1ECFng r\u1ED3i! Th\u1EED l\u1EA1i nh\xE9", "error");
      shake($("#counter"));
      return;
    }
    floatText(`${q.emoji} ${q.label}`, target, result.quality === "PERFECT" ? "green" : "");
    setTimeout(() => floatText(`+${formatMoney(result.money)}`, target), 180);
    if (result.tip) setTimeout(() => floatText(`Tip +${formatMoney(result.tip)}`, target, "green"), 420);
    coinFly(target, result.quality === "PERFECT" ? 8 : 5);
    const cEl = document.querySelector(`[data-cid="${result.customer?.id}"]`);
    if (cEl) hearts(cEl, result.quality === "PERFECT" ? 4 : 2);
    if (result.quality === "PERFECT") sparkle(target);
  }
  function updateCounterFrame() {
    const prep = gameState.shop.preparation;
    const el = document.getElementById("counter");
    if (!el) return;
    if (prep?.phase === "brewing") {
      const bar = el.querySelector("[data-prep-bar]");
      if (bar) bar.style.width = `${Math.min(100, prep.elapsed / prep.total * 100).toFixed(1)}%`;
    } else if (prep?.phase === "timing") {
      const marker = el.querySelector("[data-marker]");
      if (marker) {
        marker.style.left = `calc(${(prep.marker * 100).toFixed(2)}% - 3px)`;
        const label = el.querySelector("[data-timing-label]");
        const q = qualityForMarker(prep.marker);
        if (label && label.dataset.q !== q) {
          label.dataset.q = q;
          label.textContent = q === "PERFECT" ? "\u{1F31F} NGAY B\xC2Y GI\u1EDC!" : q === "GOOD" ? "T\u1ED1t \u{1F44D}" : q === "OK" ? "T\u1EA1m \u0111\u01B0\u1EE3c" : "Ch\u01B0a ph\u1EA3i l\xFAc...";
        }
      }
    }
    const ap = gameState.shop.assistantPrep;
    const abar = el.querySelector("[data-assistant-bar]");
    if (ap && abar) abar.style.width = `${Math.min(100, ap.elapsed / ap.total * 100).toFixed(1)}%`;
    else if (!ap && abar && abar.style.width !== "0%") markDirty("counter");
  }

  // js/ui/karinUI.js
  function renderKarin() {
    const area = document.getElementById("karinArea");
    if (!area) return;
    const ready = karinReady();
    area.innerHTML = `
    <button class="karin-btn ${ready ? "ready" : ""}" data-karin ${ready ? "" : "disabled"} aria-label="${KARIN.name}: ${KARIN.skillName}">
      ${ready ? "" : `<span class="cd" data-cd>${formatTime(gameState.karin.cooldown)}</span>`}
      <span class="karin-body">${KARIN.avatar}</span>
      <span class="karin-label">${ready ? `\u2728 ${KARIN.skillName}` : KARIN.name}</span>
    </button>`;
    area.querySelector("[data-karin]").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      if (!bless()) return;
      btn.classList.add("blessing");
      sparkle(btn, 12);
      burst(btn);
      floatText(`+${KARIN.patienceBonus}s Ki\xEAn Nh\u1EABn`, btn, "green");
      setTimeout(() => floatText(`+${formatMoney(KARIN.luckyMoney)} May M\u1EAFn`, btn), 250);
      playSfx("sparkle");
    });
  }
  function updateKarinFrame() {
    const cd = document.querySelector("[data-cd]");
    if (cd) cd.textContent = formatTime(gameState.karin.cooldown);
  }
  function initKarinUI() {
    on(EVENTS.KARIN_BLESS, () => setTimeout(renderKarin, 650));
  }

  // js/ui/upgradeUI.js
  function render3(body) {
    body.innerHTML = `<div class="row between"><span class="bold">\u{1F4B0} ${formatMoney(gameState.money)}</span><span class="muted">C\u1EA5p ${gameState.level}</span></div>` + UPGRADES.map((u) => {
      const lvl = getUpgradeLevel(u.id);
      const locked = gameState.level < u.unlockLevel;
      const maxed = lvl >= u.maxLevel;
      const cost = getUpgradeCost(u.id);
      return `<div class="upgrade-row">
        <span class="ico">${u.icon}</span>
        <div class="grow"><div class="bold">${esc(u.name)} <span class="lvl">${lvl}/${u.maxLevel}</span></div><div class="muted">${esc(u.desc)}</div></div>
        <button class="btn btn-sm ${maxed ? "btn-soft" : "btn-warm"}" data-up="${u.id}" ${locked || maxed ? "disabled" : ""} aria-label="N\xE2ng c\u1EA5p ${esc(u.name)}">
          ${locked ? `\u{1F512} C\u1EA5p ${u.unlockLevel}` : maxed ? "MAX" : formatMoney(cost)}
        </button></div>`;
    }).join("");
    for (const btn of body.querySelectorAll("[data-up]")) {
      btn.addEventListener("click", (e) => {
        const err = buyUpgrade(btn.dataset.up);
        if (err) {
          toast(err, "error");
          playSfx("error");
        } else {
          playSfx("success");
          sparkle(e.currentTarget);
          toast("N\xE2ng c\u1EA5p th\xE0nh c\xF4ng! \u2B06\uFE0F", "success");
          render3(body);
        }
      });
    }
  }
  function openUpgrades() {
    const body = html('<div class="col"></div>');
    render3(body);
    openModal({ title: "\u2B06\uFE0F N\xE2ng c\u1EA5p ti\u1EC7m", body, id: "upgrades" });
  }

  // js/minigames/pearlGame.js
  var SUCCESS_SCORE = 120;
  var PEARL = ["\u26AB", "\u{1FA77}", "\u{1F49A}", "\u{1F49B}", "\u{1F499}"];
  var game = null;
  function newBoard() {
    const b = [];
    for (let r = 0; r < MINIGAME.rows; r++) {
      b.push([]);
      for (let c = 0; c < MINIGAME.cols; c++) b[r].push(randInt(0, MINIGAME.colors - 1));
    }
    return b;
  }
  function groupAt(board, r, c) {
    const color = board[r][c];
    if (color < 0) return [];
    const seen = /* @__PURE__ */ new Set();
    const stack2 = [[r, c]];
    const out = [];
    while (stack2.length) {
      const [y, x] = stack2.pop();
      const key = `${y},${x}`;
      if (seen.has(key) || y < 0 || x < 0 || y >= MINIGAME.rows || x >= MINIGAME.cols || board[y][x] !== color) continue;
      seen.add(key);
      out.push([y, x]);
      stack2.push([y + 1, x], [y - 1, x], [y, x + 1], [y, x - 1]);
    }
    return out;
  }
  function collapse(board) {
    for (let c = 0; c < MINIGAME.cols; c++) {
      const col = [];
      for (let r = MINIGAME.rows - 1; r >= 0; r--) if (board[r][c] >= 0) col.push(board[r][c]);
      for (let r = MINIGAME.rows - 1; r >= 0; r--) {
        const idx = MINIGAME.rows - 1 - r;
        board[r][c] = idx < col.length ? col[idx] : randInt(0, MINIGAME.colors - 1);
      }
    }
  }
  function hasMoves(board) {
    for (let r = 0; r < MINIGAME.rows; r++) for (let c = 0; c < MINIGAME.cols; c++) if (groupAt(board, r, c).length >= 2) return true;
    return false;
  }
  function renderBoard() {
    const el = game.body.querySelector("[data-board]");
    el.innerHTML = game.board.map((row, r) => row.map((v, c) => `<button class="mg-cell p${v}" data-r="${r}" data-c="${c}" aria-label="Tr\xE2n ch\xE2u">${PEARL[v]}</button>`).join("")).join("");
    for (const cell of el.querySelectorAll(".mg-cell")) cell.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      tap(Number(cell.dataset.r), Number(cell.dataset.c), cell);
    });
  }
  function updateHead() {
    game.body.querySelector("[data-score]").textContent = game.score;
    game.body.querySelector("[data-time]").textContent = `${Math.ceil(game.timeLeft)}s`;
    game.body.querySelector("[data-timer-bar]").style.width = `${game.timeLeft / MINIGAME.duration * 100}%`;
  }
  function tap(r, c, cellEl) {
    if (game.state !== "PLAYING") return;
    const group = groupAt(game.board, r, c);
    if (group.length < 2) {
      game.combo = 0;
      game.body.querySelector("[data-combo]").textContent = "";
      playSfx("pop");
      return;
    }
    game.combo += 1;
    const comboMul = game.combo >= 5 ? 5 : game.combo >= 3 ? 3 : game.combo >= 2 ? 2 : 1;
    const gained = group.length * group.length * comboMul;
    game.score += gained;
    for (const [y, x] of group) game.board[y][x] = -1;
    const comboEl = game.body.querySelector("[data-combo]");
    comboEl.textContent = comboMul > 1 ? `Combo x${comboMul}!` : "";
    comboEl.classList.remove("mg-combo");
    void comboEl.offsetWidth;
    comboEl.classList.add("mg-combo");
    floatText(`+${gained}`, cellEl, "green");
    playSfx(group.length >= 5 ? "happy" : "coin");
    collapse(game.board);
    renderBoard();
    updateHead();
    if (!hasMoves(game.board)) {
      game.board = newBoard();
      renderBoard();
      toast("B\xE0n m\u1EDBi! \u{1F504}", "info", 1e3);
    }
  }
  function endGame() {
    if (!game || game.state !== "PLAYING") return;
    game.state = game.score >= SUCCESS_SCORE ? "SUCCESS" : "FAIL";
    clearInterval(game.timer);
    const money = game.score * MINIGAME.moneyPerPoint;
    const pearls = Math.floor(game.score / MINIGAME.pearlPerPoints);
    const rareDrop = game.state === "SUCCESS" && chance(0.25) ? gameState.level >= 5 ? "honey" : "matcha" : null;
    addMoney(money, "minigame", false);
    if (pearls) addIngredient("pearl", pearls);
    if (rareDrop) {
      addIngredient(rareDrop, 1);
      discover("ingredients", rareDrop);
    }
    addXp(Math.round(game.score / 4));
    gameState.stats.bestMinigameScore = Math.max(gameState.stats.bestMinigameScore, game.score);
    requestSave();
    emit(EVENTS.MINIGAME_FINISHED, { score: game.score, money, pearls });
    playSfx(game.state === "SUCCESS" ? "levelup" : "sad");
    showResult(money, pearls, rareDrop);
  }
  function showResult(money, pearls, rareDrop) {
    game.state = "RESULT";
    game.body.innerHTML = `<div class="col center" style="width:100%">
    <div class="summary-emoji">${money > 0 && game.score >= SUCCESS_SCORE ? "\u{1F3C6}" : "\u{1F642}"}</div>
    <div class="summary-big">${game.score >= SUCCESS_SCORE ? "TH\xC0NH C\xD4NG!" : "C\u1ED1 l\xEAn l\u1EA7n sau!"}</div>
    <div class="summary-row"><span>\u0110i\u1EC3m</span><span>${game.score} (k\u1EF7 l\u1EE5c ${gameState.stats.bestMinigameScore})</span></div>
    <div class="summary-row"><span>Ti\u1EC1n th\u01B0\u1EDFng</span><span class="money">+${formatMoney(money)}</span></div>
    <div class="summary-row"><span>Tr\xE2n ch\xE2u</span><span>+${pearls} \u26AB</span></div>
    ${rareDrop ? `<div class="summary-row" style="background:var(--c-yellow)"><span>Qu\xE0 hi\u1EBFm</span><span>+1 ${INGREDIENT_MAP[rareDrop].icon} ${INGREDIENT_MAP[rareDrop].name}</span></div>` : ""}
    <button class="btn btn-primary btn-block" data-close>Nh\u1EADn th\u01B0\u1EDFng \u{1F381}</button></div>`;
    game.body.querySelector("[data-close]").addEventListener("click", () => game.modal.close());
    sparkle(game.body.querySelector(".summary-emoji"), 10);
  }
  function startPlaying() {
    game.state = "PLAYING";
    game.board = newBoard();
    game.score = 0;
    game.combo = 0;
    game.timeLeft = MINIGAME.duration;
    game.body.innerHTML = `<div class="minigame" style="width:100%">
    <div class="mg-head"><span>\u2B50 <span data-score>0</span></span><span data-combo class="mg-combo"></span><span>\u23F1\uFE0F <span data-time></span></span></div>
    <div class="bar mg-timer"><span data-timer-bar style="width:100%"></span></div>
    <div class="mg-board" data-board></div>
    <p class="muted center">Ch\u1EA1m nh\xF3m \u22652 tr\xE2n ch\xE2u c\xF9ng m\xE0u k\u1EC1 nhau. Combo li\xEAn ti\u1EBFp = nh\xE2n \u0111i\u1EC3m! M\u1EE5c ti\xEAu ${SUCCESS_SCORE} \u0111i\u1EC3m.</p></div>`;
    renderBoard();
    updateHead();
    let last = performance.now();
    game.timer = setInterval(() => {
      const now = performance.now();
      game.timeLeft -= (now - last) / 1e3;
      last = now;
      if (game.timeLeft <= 0) {
        game.timeLeft = 0;
        updateHead();
        endGame();
        return;
      }
      updateHead();
    }, 100);
  }
  function openPearlGame() {
    if (game) return;
    const free = gameState.stats.minigamePlaysToday < MINIGAME.freePlaysPerDay;
    const body = html(`<div class="col center" style="width:100%">
    <div class="summary-emoji">\u26AB\u{1FA77}\u{1F49A}</div>
    <div class="summary-big">\xD4 \u0102n Quan Tr\xE2n Ch\xE2u</div>
    <p class="muted">\u0102n th\u1EADt nhi\u1EC1u tr\xE2n ch\xE2u trong ${MINIGAME.duration} gi\xE2y. \u0110i\u1EC3m \u0111\u1ED5i th\xE0nh ti\u1EC1n, tr\xE2n ch\xE2u v\xE0 \u0111\xF4i khi l\xE0 nguy\xEAn li\u1EC7u hi\u1EBFm!</p>
    <p class="muted">K\u1EF7 l\u1EE5c: ${gameState.stats.bestMinigameScore} \u0111i\u1EC3m</p>
    <button class="btn btn-primary btn-block" data-start>${free ? "\u25B6\uFE0F Ch\u01A1i (mi\u1EC5n ph\xED h\xF4m nay)" : `\u25B6\uFE0F Ch\u01A1i (${formatMoney(MINIGAME.playCost)})`}</button></div>`);
    const modal = openModal({ title: "\u{1F3AE} Mini-game", body, id: "minigame", onClose: () => {
      if (game?.timer) clearInterval(game.timer);
      game = null;
      markDirty("actions");
    } });
    game = { modal, body: modal.body, state: "START", timer: null };
    body.querySelector("[data-start]").addEventListener("click", () => {
      if (!free && !spendMoney(MINIGAME.playCost, "minigame")) {
        toast("Kh\xF4ng \u0111\u1EE7 ti\u1EC1n", "error");
        playSfx("error");
        return;
      }
      gameState.stats.minigamePlaysToday += 1;
      playSfx("success");
      startPlaying();
    });
  }

  // js/ui/endDayUI.js
  var DAY_REWARD_POOL = ["pearl", "peach", "lemon", "milk", "tea", "sugar", "ice"];
  function openEndDay() {
    if (isModalOpen("endday")) return;
    const s = daySummary();
    const rewardId = pick(DAY_REWARD_POOL.filter((id) => gameState.inventory[id]?.unlocked));
    const rewardQty = 1 + Math.floor(s.served / 5);
    const def = INGREDIENT_MAP[rewardId];
    const body = html(`<div class="col">
    <div class="summary-emoji">${s.left === 0 && s.served > 0 ? "\u{1F308}" : s.served >= s.left ? "\u{1F319}" : "\u{1F605}"}</div>
    <div class="summary-big">Ng\xE0y ${s.day} ho\xE0n th\xE0nh!</div>
    <div class="summary-row"><span>Doanh thu</span><span class="money">${formatSigned(s.revenue)}</span></div>
    <div class="summary-row"><span>Kh\xE1ch ph\u1EE5c v\u1EE5</span><span>${s.served}</span></div>
    <div class="summary-row"><span>Kh\xE1ch h\xE0i l\xF2ng</span><span>${s.happy}</span></div>
    <div class="summary-row"><span>Kh\xE1ch b\u1ECF \u0111i</span><span style="color:${s.left ? "var(--c-red)" : "inherit"}">${s.left}</span></div>
    <div class="summary-row"><span>Rating</span><span>${s.ratingDelta >= 0 ? "+" : ""}${formatRating(s.ratingDelta)} (\u2B50 ${formatRating(gameState.rating)})</span></div>
    <div class="summary-row"><span>Kinh nghi\u1EC7m</span><span>+${s.xp} XP</span></div>
    <div class="summary-row" style="background:var(--c-yellow)"><span>Ph\u1EA7n th\u01B0\u1EDFng</span><span>+${rewardQty} ${def?.icon || ""} ${esc(def?.name || "")}</span></div>
  </div>`);
    const foot = html('<button class="btn btn-primary btn-block">\u2600\uFE0F Ng\xE0y ti\u1EBFp theo</button>');
    const m = openModal({ title: "\u{1F319} K\u1EBFt th\xFAc ng\xE0y", body, foot, center: true, closeOnBackdrop: false, hideClose: true, id: "endday" });
    foot.addEventListener("click", () => {
      playSfx("success");
      if (rewardId) addIngredient(rewardId, rewardQty);
      m.close();
      closeAllModals();
      nextDay();
      toast(`Ng\xE0y ${gameState.day} b\u1EAFt \u0111\u1EA7u! ${gameState.season === "winter" ? "\u26C4" : "\u2600\uFE0F"}`, "info");
    });
  }
  function showLevelUp({ level, reward, note }) {
    const items = Object.entries(reward.items || {}).map(([id, q]) => `+${q} ${INGREDIENT_MAP[id]?.icon || ""} ${esc(INGREDIENT_MAP[id]?.name || id)}`);
    const body = html(`<div class="col center">
    <div class="summary-emoji">\u{1F389}</div>
    <div class="summary-big">L\xEAn c\u1EA5p ${level}!</div>
    <p class="bold">${esc(note)}</p>
    <div class="summary-row"><span>Th\u01B0\u1EDFng</span><span class="money">+${formatMoney(reward.money || 0)}</span></div>
    ${items.map((t) => `<div class="summary-row"><span>Qu\xE0</span><span>${t}</span></div>`).join("")}
  </div>`);
    const foot = html('<button class="btn btn-primary btn-block">Tuy\u1EC7t v\u1EDDi! \u{1F38A}</button>');
    queueModal((done) => {
      const m = openModal({ title: "\u2B06\uFE0F LEVEL UP", body, foot, center: true, onClose: done });
      foot.addEventListener("click", m.close);
      setTimeout(() => {
        const e = body.querySelector(".summary-emoji");
        sparkle(e, 14);
        burst(e);
      }, 200);
    });
  }
  function showOffline({ seconds, amount }) {
    const h = Math.floor(seconds / 3600);
    const mnt = Math.floor(seconds % 3600 / 60);
    const body = html(`<div class="col center">
    <div class="summary-emoji">\u{1F3EA}</div>
    <p class="bold">Trong l\xFAc b\u1EA1n v\u1EAFng m\u1EB7t (${h ? `${h} gi\u1EDD ` : ""}${mnt} ph\xFAt)...</p>
    <div class="summary-big money">Ti\u1EC7m \u0111\xE3 ki\u1EBFm \u0111\u01B0\u1EE3c +${formatMoney(amount)}</div>
    <p class="muted">Thu nh\u1EADp t\u1EEB c\xE1c chi nh\xE1nh (t\u1ED1i \u0111a 8 gi\u1EDD)</p></div>`);
    const foot = html('<button class="btn btn-primary btn-block">Nh\u1EADn \u{1F4B0}</button>');
    queueModal((done) => {
      const m = openModal({ title: "\u{1F4A4} Ch\xE0o m\u1EEBng tr\u1EDF l\u1EA1i", body, foot, center: true, onClose: done });
      foot.addEventListener("click", () => {
        playSfx("coin");
        m.close();
      });
    });
  }
  function initEndDayUI() {
    on(EVENTS.LEVEL_UP, (data) => showLevelUp(data));
    on(EVENTS.OFFLINE_PROGRESS, showOffline);
  }

  // js/ui/shopUI.js
  var dayFinished = false;
  function renderActions() {
    const el = document.getElementById("shopActions");
    if (!el) return;
    const shop = gameState.shop;
    const pct = shop.targetCustomers ? Math.min(100, shop.spawnedToday / shop.targetCustomers * 100) : 0;
    const plays = gameState.stats.minigamePlaysToday;
    const mgLabel = plays < MINIGAME.freePlaysPerDay ? "\u{1F3AE} Mini-game (mi\u1EC5n ph\xED)" : "\u{1F3AE} Mini-game";
    let main;
    if (dayFinished) main = '<button class="btn btn-warm grow" data-endday aria-label="T\u1ED5ng k\u1EBFt ng\xE0y">\u{1F319} T\u1ED5ng k\u1EBFt ng\xE0y</button>';
    else if (!shop.isOpen && !shop.dayStarted) main = '<button class="btn btn-primary grow" data-open aria-label="M\u1EDF c\u1EEDa ti\u1EC7m">\u{1F514} M\u1EDF c\u1EEDa</button>';
    else if (!shop.isOpen && shop.dayStarted) main = '<button class="btn btn-primary grow" data-open aria-label="M\u1EDF c\u1EEDa l\u1EA1i">\u{1F514} M\u1EDF c\u1EEDa l\u1EA1i</button>';
    else main = `<div class="btn btn-soft grow" aria-live="polite">\u{1F7E2} \u0110ang m\u1EDF \xB7 ${shop.servedToday} kh\xE1ch</div>`;
    el.innerHTML = `
    <div class="day-progress"><span>Kh\xE1ch h\xF4m nay</span><span class="bar"><span style="width:${pct.toFixed(0)}%"></span></span><span>${shop.spawnedToday}/${shop.targetCustomers || "?"}</span></div>
    ${main}
    <button class="btn btn-soft" data-upgrade aria-label="N\xE2ng c\u1EA5p ti\u1EC7m">\u2B06\uFE0F N\xE2ng c\u1EA5p</button>
    <button class="btn btn-soft" data-minigame aria-label="Ch\u01A1i mini-game">${mgLabel}</button>
  `;
    el.querySelector("[data-open]")?.addEventListener("click", (e) => {
      playSfx("success");
      bounce(e.currentTarget);
      openShop();
    });
    el.querySelector("[data-endday]")?.addEventListener("click", () => {
      playSfx("click");
      openEndDay();
    });
    el.querySelector("[data-upgrade]").addEventListener("click", () => {
      playSfx("click");
      openUpgrades();
    });
    el.querySelector("[data-minigame]").addEventListener("click", () => {
      playSfx("click");
      openPearlGame();
    });
  }
  function renderBuffs() {
    let el = document.querySelector(".buffs");
    if (!el) {
      el = html('<div class="buffs" aria-label="Hi\u1EC7u \u1EE9ng \u0111ang c\xF3"></div>');
      document.getElementById("shop")?.appendChild(el);
    }
    const list = listBuffs();
    el.innerHTML = list.map((b) => `<span class="buff">${b.icon} ${esc(b.name)}${b.duration < 9999 ? ` ${formatTime(b.remaining)}` : ""}</span>`).join("");
  }
  function renderScene() {
    const w = getWeather();
    const sky = document.querySelector(".scene-sky");
    if (sky) sky.dataset.icon = w.icon;
    document.documentElement.dataset.season = gameState.season;
    const board = document.querySelector("[data-board]");
    if (board) board.innerHTML = `${w.icon} ${esc(w.name)} \xB7 ${gameState.temperature}\xB0C<small>${esc(w.tip)}</small>`;
  }
  var buffTick = 0;
  function updateBuffsFrame(dt) {
    buffTick += dt;
    if (buffTick < 0.5) return;
    buffTick = 0;
    if (Object.keys(gameState.buffs).length) renderBuffs();
  }
  function initShopUI() {
    on(EVENTS.DAY_COMPLETED, () => {
      dayFinished = true;
      renderActions();
      setTimeout(openEndDay, 500);
    });
    on(EVENTS.DAY_STARTED, () => {
      dayFinished = false;
      renderActions();
    });
    on(EVENTS.STATE_LOADED, () => {
      dayFinished = false;
    });
  }

  // js/ui/recipeUI.js
  function openRecipes() {
    const recipes = listRecipes();
    const body = html(`<div class="col">
    <p class="muted">\u0110\xE3 m\u1EDF ${recipes.filter((r) => r.unlocked).length}/${recipes.length} c\xF4ng th\u1EE9c. L\xEAn c\u1EA5p \u0111\u1EC3 m\u1EDF th\xEAm!</p>
    <div class="grid-auto">${recipes.map((r) => {
      const ings = Object.entries(r.ingredients).map(([id, q]) => `${INGREDIENT_MAP[id]?.icon || "?"}${q}`).join(" ");
      if (!r.unlocked) return `<div class="item-card locked rarity-${r.rarity}"><span class="ico">\u{1F512}</span><span class="name">${esc(r.name)}</span><span class="muted">M\u1EDF \u1EDF c\u1EA5p ${r.unlockLevel}</span><span class="muted">${ings}</span></div>`;
      const profit = r.price - ingredientCost(r.ingredients);
      return `<div class="item-card rarity-${r.rarity}">
          <div class="row between"><span class="ico">${r.icon}</span><span class="tag ${r.temp}">${r.temp === "cold" ? "\u{1F9CA} L\u1EA1nh" : "\u2668\uFE0F N\xF3ng"}</span></div>
          <span class="name">${esc(r.name)}</span>
          <span class="rarity">${RARITY[r.rarity].name}</span>
          <span class="muted">${esc(r.desc)}</span>
          <span class="muted">${ings} \xB7 ${r.preparationTime}s</span>
          <span class="money">${formatMoney(r.price)} <span class="muted">(l\xE3i ${formatMoney(profit)})</span></span>
          <span class="muted">\u0110\xE3 pha: ${r.made}${r.missing.length ? ' \xB7 <span style="color:var(--c-red)">thi\u1EBFu nguy\xEAn li\u1EC7u</span>' : ""}</span>
        </div>`;
    }).join("")}</div></div>`);
    openModal({ title: `\u{1F4D6} C\xF4ng th\u1EE9c (c\u1EA5p ${gameState.level})`, body, id: "recipes" });
  }

  // js/ui/deliveryUI.js
  var current2 = null;
  function render4(body) {
    const d = gameState.delivery;
    const vehicles = ["\u{1F6F5}", "\u{1F6B2}", "\u{1F697}"];
    const map = `<div class="delivery-map" aria-label="B\u1EA3n \u0111\u1ED3 giao h\xE0ng">
    <span class="cloud" style="animation-delay:-3s">\u2601\uFE0F</span><span class="cloud" style="animation-delay:-9s">\u2601\uFE0F</span>
    <span class="home">\u{1F3E0}</span><span class="dest">\u{1F3D9}\uFE0F</span>
    <div class="road"></div>
    ${d.activeOrders.map((o, i) => `<span class="vehicle v${i % 3 + 1}" data-vehicle="${o.id}" style="left:${(8 + o.progress * 84).toFixed(1)}%">${vehicles[i % 3]}</span>`).join("")}
  </div>`;
    const active = d.activeOrders.length ? d.activeOrders.map((o) => {
      const dest = destinationOf(o);
      return `<div class="summary-row"><span>${dest.icon} ${esc(dest.name)}</span><span data-eta="${o.id}">${formatTime(o.duration * (1 - o.progress))}</span><span class="money">${formatMoney(o.reward)}</span></div>`;
    }).join("") : '<p class="muted center">Ch\u01B0a c\xF3 xe n\xE0o \u0111ang ch\u1EA1y</p>';
    const avail = d.availableOrders.length ? d.availableOrders.map((o) => {
      const dest = destinationOf(o);
      const r = RECIPE_MAP[o.recipeId];
      return `<div class="upgrade-row"><span class="ico">${dest.icon}</span>
          <div class="grow"><div class="bold">${esc(dest.name)}</div><div class="muted">${esc(o.customer)} \xB7 ${r?.icon || ""} ${esc(r?.name || "")} \xB7 ${formatTime(o.duration)}</div></div>
          <button class="btn btn-sm btn-warm" data-accept="${o.id}" ${freeVehicles() <= 0 ? "disabled" : ""} aria-label="Nh\u1EADn \u0111\u01A1n">${formatMoney(o.reward)}</button></div>`;
    }).join("") : `<p class="muted center">${gameState.shop.dayStarted ? "H\u1EBFt \u0111\u01A1n h\xF4m nay. M\u1EDF c\u1EEDa ng\xE0y mai \u0111\u1EC3 nh\u1EADn th\xEAm!" : "M\u1EDF c\u1EEDa ti\u1EC7m \u0111\u1EC3 nh\u1EADn \u0111\u01A1n giao h\xE0ng \u{1F6F5}"}</p>`;
    body.innerHTML = `${map}
    <div class="row between"><span class="bold">\u{1F6F5} Xe r\u1EA3nh: ${freeVehicles()}/${d.vehicles}</span><span class="muted">\u0110\xE3 giao: ${gameState.stats.deliveriesDone}</span></div>
    <h3>\u0110ang giao</h3>${active}
    <h3>\u0110\u01A1n ch\u1EDD nh\u1EADn</h3>${avail}`;
    for (const btn of body.querySelectorAll("[data-accept]")) {
      btn.addEventListener("click", () => {
        const err = acceptOrder(Number(btn.dataset.accept));
        if (err) {
          toast(err, "error");
          playSfx("error");
        } else {
          playSfx("success");
          toast("Xe \u0111\xE3 xu\u1EA5t ph\xE1t! \u{1F6F5}", "success");
          render4(body);
        }
      });
    }
  }
  function openDelivery() {
    if (current2) return;
    const body = html('<div class="col"></div>');
    render4(body);
    current2 = openModal({ title: "\u{1F6F5} Giao h\xE0ng", body, id: "delivery", onClose: () => current2 = null });
  }
  var tick = 0;
  function updateDeliveryFrame(dt) {
    if (!current2) return;
    tick += dt;
    if (tick < 0.3) return;
    tick = 0;
    for (const o of gameState.delivery.activeOrders) {
      const v = current2.body.querySelector(`[data-vehicle="${o.id}"]`);
      if (v) v.style.left = `${(8 + o.progress * 84).toFixed(1)}%`;
      const eta = current2.body.querySelector(`[data-eta="${o.id}"]`);
      if (eta) eta.textContent = formatTime(o.duration * (1 - o.progress));
    }
  }
  function initDeliveryUI() {
    on(EVENTS.DELIVERY_COMPLETED, ({ order, reward }) => {
      toast(`\u{1F4E6} Giao xong ${destinationOf(order).name}: +${formatMoney(reward)}`, "gold");
      if (current2) render4(current2.body);
    });
    on(EVENTS.SHOP_OPENED, () => current2 && render4(current2.body));
  }

  // js/ui/branchUI.js
  var current3 = null;
  function render5(body) {
    const owned = gameState.branches;
    const templates = listTemplates().filter((t) => !t.owned);
    const max = maxBranchesForLevel(gameState.level);
    body.innerHTML = `
    <div class="card"><div class="row between"><span class="bold">\u{1F4B8} Thu nh\u1EADp th\u1EE5 \u0111\u1ED9ng</span><span class="money">${formatMoney(totalRevenuePerInterval())}/${BRANCH_CONFIG.incomeInterval}s</span></div>
      <div class="bar" style="margin-top:6px"><span data-income-bar style="width:${(incomeProgress() * 100).toFixed(0)}%"></span></div>
      <p class="muted" style="margin-top:6px">Chi nh\xE1nh ki\u1EBFm ti\u1EC1n c\u1EA3 khi b\u1EA1n t\u1EAFt game (t\u1ED1i \u0111a 8 gi\u1EDD). S\u1EDF h\u1EEFu ${owned.length}/${max}.</p></div>
    <h3>\u0110ang s\u1EDF h\u1EEFu</h3>
    ${owned.length ? owned.map((b) => `<div class="upgrade-row"><span class="ico">${listTemplates().find((t) => t.id === b.id)?.icon || "\u{1F3EA}"}</span>
      <div class="grow"><div class="bold">${esc(b.name)} <span class="lvl">C\u1EA5p ${b.level}</span></div><div class="muted">${formatMoney(branchRevenue(b))}/chu k\u1EF3 \xB7 Uy t\xEDn ${b.reputation.toFixed(1)} \xB7 T\u1ED5ng ${formatMoney(b.revenue)}</div></div>
      <button class="btn btn-sm btn-warm" data-upb="${b.id}" ${b.level >= BRANCH_CONFIG.maxLevel ? "disabled" : ""} aria-label="N\xE2ng c\u1EA5p chi nh\xE1nh">${b.level >= BRANCH_CONFIG.maxLevel ? "MAX" : formatMoney(branchUpgradeCost(b))}</button></div>`).join("") : '<p class="muted center">Ch\u01B0a c\xF3 chi nh\xE1nh n\xE0o</p>'}
    <h3>M\u1EDF chi nh\xE1nh m\u1EDBi</h3>
    ${templates.map((t) => `<div class="upgrade-row"><span class="ico">${t.icon}</span>
      <div class="grow"><div class="bold">${esc(t.name)}</div><div class="muted">${formatMoney(t.baseRevenue)}/chu k\u1EF3 ban \u0111\u1EA7u</div></div>
      <button class="btn btn-sm btn-primary" data-open="${t.id}" ${owned.length >= max ? "disabled" : ""} aria-label="M\u1EDF ${esc(t.name)}">${formatMoney(t.cost)}</button></div>`).join("")}`;
    for (const btn of body.querySelectorAll("[data-open]")) {
      btn.addEventListener("click", (e) => {
        const err = openBranch(btn.dataset.open);
        if (err) {
          toast(err, "error");
          playSfx("error");
        } else {
          playSfx("levelup");
          sparkle(e.currentTarget, 12);
          toast("\u{1F3EA} Khai tr\u01B0\u01A1ng chi nh\xE1nh m\u1EDBi!", "gold");
          render5(body);
        }
      });
    }
    for (const btn of body.querySelectorAll("[data-upb]")) {
      btn.addEventListener("click", () => {
        const err = upgradeBranch(btn.dataset.upb);
        if (err) {
          toast(err, "error");
          playSfx("error");
        } else {
          playSfx("success");
          render5(body);
        }
      });
    }
  }
  function openBranches() {
    if (current3) return;
    const body = html('<div class="col"></div>');
    render5(body);
    current3 = openModal({ title: "\u{1F3EA} Chi nh\xE1nh", body, id: "branches", onClose: () => current3 = null });
  }
  var tick2 = 0;
  function updateBranchFrame(dt) {
    if (!current3) return;
    tick2 += dt;
    if (tick2 < 0.5) return;
    tick2 = 0;
    const bar = current3.body.querySelector("[data-income-bar]");
    if (bar) bar.style.width = `${(incomeProgress() * 100).toFixed(0)}%`;
  }
  function initBranchUI() {
    on(EVENTS.BRANCH_INCOME, (total) => {
      toast(`\u{1F3EA} Chi nh\xE1nh g\u1EEDi v\u1EC1 +${formatMoney(total)}`, "gold", 1800);
      if (current3) render5(current3.body);
    });
  }

  // js/ui/collectionUI.js
  function renderTab(body, category) {
    const items = listCollection(category);
    const p = collectionProgress()[category];
    body.querySelector("[data-grid]").innerHTML = `<p class="muted center">\u0110\xE3 kh\xE1m ph\xE1 ${p.found}/${p.total}</p><div class="grid-auto">${items.map((i) => {
      if (!i.discovered) return `<div class="item-card locked rarity-${i.rarity}"><span class="ico">\u2754</span><span class="name">???</span><span class="rarity">${i.rarityName}</span></div>`;
      return `<div class="item-card rarity-${i.rarity}"><span class="ico">${i.icon}</span><span class="name">${esc(i.name)}</span><span class="rarity">${i.rarityName} \xB7 C\u1EA5p ${i.level}</span><span class="muted">${esc(i.desc)}</span><span class="muted">${category === "recipes" ? "\u0110\xE3 pha" : "\u0110\xE3 d\xF9ng"}: ${i.count}</span></div>`;
    }).join("")}</div>`;
  }
  function openCollection() {
    const body = html(`<div class="col">
    <div class="tabs"><button class="tab active" data-tab="ingredients">\u{1F9FA} Nguy\xEAn li\u1EC7u</button><button class="tab" data-tab="recipes">\u{1F4D6} C\xF4ng th\u1EE9c</button></div>
    <div data-grid></div></div>`);
    renderTab(body, "ingredients");
    for (const t of body.querySelectorAll("[data-tab]")) {
      t.addEventListener("click", () => {
        body.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === t));
        renderTab(body, t.dataset.tab);
      });
    }
    openModal({ title: "\u{1F381} B\u1ED9 s\u01B0u t\u1EADp", body, id: "collection" });
  }
  function initCollectionUI() {
    on(EVENTS.DISCOVERY, ({ category, item }) => {
      queueModal((done) => {
        const body = html(`<div class="col center">
        <div class="summary-emoji">${item.icon}</div>
        <div class="summary-big">${esc(item.name)}</div>
        <span class="rarity-${item.rarity}"><span class="rarity">${RARITY[item.rarity].name}</span></span>
        <p class="muted">${esc(item.desc)}</p>
        <p class="muted">${category === "recipes" ? "C\xF4ng th\u1EE9c" : "Nguy\xEAn li\u1EC7u"} m\u1EDBi trong b\u1ED9 s\u01B0u t\u1EADp</p></div>`);
        const foot = html('<button class="btn btn-primary btn-block">Tuy\u1EC7t! \u2728</button>');
        const m = openModal({ title: "\u2728 Ph\xE1t hi\u1EC7n m\u1EDBi!", body, foot, center: true, onClose: done });
        foot.addEventListener("click", m.close);
        setTimeout(() => sparkle(body.querySelector(".summary-emoji"), 10), 150);
      });
    });
  }

  // js/ui/navUI.js
  var ITEMS = [
    { id: "shop", icon: "\u{1F3E0}", label: "Ti\u1EC7m", open: () => closeAllModals() },
    { id: "inventory", icon: "\u{1F4E6}", label: "Kho", open: openInventory },
    { id: "recipes", icon: "\u{1F4D6}", label: "C\xF4ng th\u1EE9c", open: openRecipes },
    { id: "delivery", icon: "\u{1F6F5}", label: "Giao h\xE0ng", feature: "delivery", open: openDelivery, badge: () => gameState.delivery.availableOrders.length },
    { id: "branch", icon: "\u{1F3EA}", label: "Chi nh\xE1nh", feature: "branch", open: openBranches, badge: () => gameState.branches.length },
    { id: "collection", icon: "\u{1F381}", label: "S\u01B0u t\u1EADp", open: openCollection }
  ];
  function renderNav() {
    const el = document.getElementById("bottomNav");
    if (!el) return;
    el.innerHTML = ITEMS.map((it) => {
      const locked = it.feature && !isFeatureUnlocked(it.feature);
      const badge = !locked && it.badge ? it.badge() : 0;
      return `<button class="nav-btn ${it.id === "shop" ? "active" : ""}" data-nav="${it.id}" aria-label="${it.label}${locked ? ` (m\u1EDF \u1EDF c\u1EA5p ${FEATURE_LEVELS[it.feature]})` : ""}">
      <span class="ico">${it.icon}</span><span>${it.label}</span>
      ${locked ? `<span class="lock">\u{1F512}${FEATURE_LEVELS[it.feature]}</span>` : badge ? `<span class="badge">${badge}</span>` : ""}
    </button>`;
    }).join("");
    for (const btn of el.querySelectorAll("[data-nav]")) {
      btn.addEventListener("click", () => {
        playSfx("click");
        const it = ITEMS.find((x) => x.id === btn.dataset.nav);
        if (it.feature && !isFeatureUnlocked(it.feature)) {
          toast(`M\u1EDF kh\xF3a \u1EDF c\u1EA5p ${FEATURE_LEVELS[it.feature]}`, "info");
          return;
        }
        it.open();
      });
    }
  }

  // js/main.js
  function registerRenderers() {
    registerRenderer("hud", renderHud);
    registerRenderer("customers", renderCustomers);
    registerRenderer("counter", renderCounter);
    registerRenderer("karin", renderKarin);
    registerRenderer("actions", renderActions);
    registerRenderer("nav", renderNav);
    registerRenderer("buffs", renderBuffs);
    registerRenderer("scene", renderScene);
    registerFrameRenderer(updatePatienceBars);
    registerFrameRenderer(updateCounterFrame);
    registerFrameRenderer(updateKarinFrame);
    registerFrameRenderer(updateBuffsFrame);
    registerFrameRenderer(updateDeliveryFrame);
    registerFrameRenderer(updateBranchFrame);
  }
  var autosaveTimer = 0;
  function registerUpdates() {
    registerUpdate(updateBuffs);
    registerUpdate(updateCustomerSystem);
    registerUpdate(updateRecipeSystem);
    registerUpdate(updateKarin);
    registerUpdate(updateDelivery);
    registerUpdate(updateBranches);
    registerUpdate((dt) => {
      autosaveTimer += dt;
      if (autosaveTimer >= AUTOSAVE_INTERVAL) {
        autosaveTimer = 0;
        saveGame();
      }
    });
  }
  function wireEvents() {
    on(EVENTS.LEVEL_UP, ({ level }) => {
      const recipes = unlockRecipesForLevel(level);
      unlockIngredientsForLevel(level);
      for (const r of recipes) toast(`\u{1F4D6} C\xF4ng th\u1EE9c m\u1EDBi: ${r.name}!`, "success", 2600);
      markDirty("nav", "hud", "actions");
    });
    on(EVENTS.CUSTOMER_LEFT, (c) => {
      const el = document.querySelector(`[data-cid="${c.id}"]`);
      floatText("\u22120.1 \u2B50", el || document.getElementById("customerArea"), "red");
      toast(`${c.name} b\u1ECF \u0111i v\xEC ch\u1EDD l\xE2u \u{1F622}`, "error", 1600);
    });
    on(EVENTS.PREP_RESULT, (r) => {
      if (r.by === "assistant") showServeResult(r, document.querySelector(`[data-cid="${r.customer?.id}"]`) || document.getElementById("counter"));
    });
    on(EVENTS.KARIN_BLESS, () => toast("\u{1F430} Karin ban ph\u01B0\u1EDBc: kh\xE1ch ki\xEAn nh\u1EABn h\u01A1n!", "success"));
    on(EVENTS.BUFF_ADDED, (b) => {
      if (b.id === "happyHour") toast("\u{1F389} Happy Hour: +30% ti\u1EC1n trong 45s!", "gold", 2600);
    });
    on(EVENTS.DAY_STARTED, ({ festival }) => {
      if (festival) toast("\u{1F38A} H\xF4m nay l\xE0 ng\xE0y l\u1EC5 h\u1ED9i: +20% ti\u1EC1n & kh\xE1ch!", "gold", 3e3);
    });
    on(EVENTS.SHOP_OPENED, () => toast("\u{1F514} Ti\u1EC7m \u0111\xE3 m\u1EDF c\u1EEDa!", "success", 1200));
    on(EVENTS.UPGRADE_BOUGHT, () => markDirty("counter", "customers"));
    on(EVENTS.STATE_LOADED, () => {
      resumeDay();
      discoverStarting();
      markAllDirty();
    });
    on(EVENTS.GAME_RESET, () => {
      setupDay(true);
      discoverStarting();
      setTimeout(() => openTutorial(false), 300);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) saveGame();
    });
    window.addEventListener("beforeunload", () => saveGame());
    window.addEventListener("error", (e) => console.error("[Game] L\u1ED7i kh\xF4ng b\u1EAFt \u0111\u01B0\u1EE3c:", e.error || e.message));
    window.addEventListener("unhandledrejection", (e) => console.error("[Game] Promise l\u1ED7i:", e.reason));
  }
  function exposeDebug() {
    if (!DEBUG) return;
    window.debugGame = {
      state: gameState,
      addMoney: (n = 1e5) => addMoney(n, "debug"),
      addXp: (n = 100) => addXp(n),
      addIngredient: (id, qty = 10) => addIngredient(id, qty),
      unlockAllRecipes,
      nextDay: () => nextDay(),
      spawnCustomer: () => spawnCustomer(true),
      openShop,
      completeDelivery: completeAllDeliveries,
      resetGame,
      save: saveGame,
      endDay: openEndDay,
      checkAchievements,
      recipes: RECIPE_MAP,
      emit
    };
    console.info("%c\u{1F9CB} debugGame s\u1EB5n s\xE0ng: window.debugGame", "color:#6cc488;font-weight:bold");
  }
  function boot() {
    initModalUI();
    initToastUI();
    initAudioSystem();
    initCollectionSystem();
    initAchievementSystem();
    initDeliverySystem();
    initKarinUI();
    initShopUI();
    initInventoryUI();
    initDeliveryUI();
    initBranchUI();
    initCollectionUI();
    initAchievementUI();
    initEndDayUI();
    registerRenderers();
    registerUpdates();
    wireEvents();
    exposeDebug();
    const { loaded, elapsed } = loadGame();
    if (!loaded) {
      setupDay(true);
      discoverStarting();
    }
    markAllDirty();
    flushRender();
    startLoop();
    if (loaded) {
      const offline = applyOfflineProgress(elapsed);
      if (!offline) toast(`Ch\xE0o m\u1EEBng tr\u1EDF l\u1EA1i! Ng\xE0y ${gameState.day} \xB7 ${formatMoney(gameState.money)}`, "info", 2e3);
      if (isDayFinishedOnLoad()) setTimeout(openEndDay, 400);
    } else {
      setTimeout(() => openTutorial(false), 400);
    }
    checkAchievements();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
