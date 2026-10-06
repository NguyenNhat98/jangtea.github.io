/**
 * Toàn bộ dữ liệu cấu hình/balance của game. Các system chỉ đọc, không ghi vào đây.
 */
export const DEBUG = true;
export const SAVE_KEY = 'dreamTeaSave';
export const SAVE_VERSION = 2;
export const AUTOSAVE_INTERVAL = 30;
export const OFFLINE_MAX_SECONDS = 8 * 3600;
export const DAYS_PER_SEASON = 7;

export const SEASONS = {
  spring: { id: 'spring', name: 'Xuân', icon: '🌸', temp: [20, 28], weathers: { sunny: 40, cloudy: 30, rain: 25, hot: 0, cold: 5 } },
  summer: { id: 'summer', name: 'Hạ', icon: '🌻', temp: [28, 37], weathers: { sunny: 35, cloudy: 15, rain: 15, hot: 35, cold: 0 } },
  autumn: { id: 'autumn', name: 'Thu', icon: '🍂', temp: [18, 26], weathers: { sunny: 35, cloudy: 35, rain: 20, hot: 0, cold: 10 } },
  winter: { id: 'winter', name: 'Đông', icon: '⛄', temp: [8, 17], weathers: { sunny: 20, cloudy: 30, rain: 15, hot: 0, cold: 35 } },
};
export const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'];

export const WEATHERS = {
  sunny: { id: 'sunny', name: 'Nắng', icon: '☀️', spawnMul: 1.1, coldBias: 0, hotBias: 0, deliveryMul: 1, tip: 'Trời nắng: +10% khách ghé tiệm' },
  cloudy: { id: 'cloudy', name: 'Nhiều mây', icon: '⛅', spawnMul: 1, coldBias: 0, hotBias: 0, deliveryMul: 1, tip: 'Trời mát, mọi thứ bình thường' },
  rain: { id: 'rain', name: 'Mưa', icon: '🌧️', spawnMul: 0.85, coldBias: 0, hotBias: 0.1, deliveryMul: 1.3, tip: 'Trời mưa: +30% đơn giao hàng' },
  hot: { id: 'hot', name: 'Nóng', icon: '🔥', spawnMul: 1, coldBias: 0.2, hotBias: 0, deliveryMul: 1, tip: 'Trời nóng: +20% khách gọi đồ lạnh' },
  cold: { id: 'cold', name: 'Lạnh', icon: '❄️', spawnMul: 0.95, coldBias: 0, hotBias: 0.2, deliveryMul: 1, tip: 'Trời lạnh: +20% khách gọi đồ nóng' },
};

export const RARITY = {
  common: { name: 'Thường', order: 0 },
  uncommon: { name: 'Khá hiếm', order: 1 },
  rare: { name: 'Hiếm', order: 2 },
  epic: { name: 'Cực hiếm', order: 3 },
  legendary: { name: 'Huyền thoại', order: 4 },
};

export const INGREDIENTS = [
  { id: 'tea', name: 'Trà', icon: '🍵', cost: 2000, maxStock: 30, rarity: 'common', unlockLevel: 1, desc: 'Lá trà thơm, nền của mọi thức uống.' },
  { id: 'milk', name: 'Sữa', icon: '🥛', cost: 3000, maxStock: 25, rarity: 'common', unlockLevel: 1, desc: 'Sữa tươi béo ngậy.' },
  { id: 'sugar', name: 'Đường', icon: '🍬', cost: 1000, maxStock: 40, rarity: 'common', unlockLevel: 1, desc: 'Ngọt ngào vừa đủ.' },
  { id: 'ice', name: 'Đá', icon: '🧊', cost: 500, maxStock: 40, rarity: 'common', unlockLevel: 1, desc: 'Mát lạnh cho ngày nóng.' },
  { id: 'lemon', name: 'Chanh', icon: '🍋', cost: 2500, maxStock: 25, rarity: 'common', unlockLevel: 1, desc: 'Chanh tươi chua dịu.' },
  { id: 'peach', name: 'Đào', icon: '🍑', cost: 4000, maxStock: 20, rarity: 'uncommon', unlockLevel: 1, desc: 'Đào ngâm thơm lừng.' },
  { id: 'pearl', name: 'Trân châu', icon: '⚫', cost: 3500, maxStock: 30, rarity: 'common', unlockLevel: 2, desc: 'Trân châu dai dai, ai cũng mê.' },
  { id: 'lychee', name: 'Vải', icon: '🍒', cost: 4500, maxStock: 20, rarity: 'uncommon', unlockLevel: 3, desc: 'Vải thiều mọng nước.' },
  { id: 'matcha', name: 'Matcha', icon: '🍃', cost: 6000, maxStock: 15, rarity: 'rare', unlockLevel: 3, desc: 'Bột trà xanh hảo hạng.' },
  { id: 'fruit', name: 'Trái cây', icon: '🍓', cost: 5000, maxStock: 20, rarity: 'uncommon', unlockLevel: 4, desc: 'Hỗn hợp trái cây theo mùa.' },
  { id: 'honey', name: 'Mật ong', icon: '🍯', cost: 7000, maxStock: 15, rarity: 'rare', unlockLevel: 5, desc: 'Mật ong rừng nguyên chất.' },
  { id: 'rose', name: 'Hoa hồng', icon: '🌹', cost: 9000, maxStock: 10, rarity: 'epic', unlockLevel: 7, desc: 'Cánh hoa hồng sấy, thơm dịu.' },
  { id: 'mint', name: 'Bạc hà', icon: '🌿', cost: 3500, maxStock: 20, rarity: 'uncommon', unlockLevel: 3, desc: 'Lá bạc hà mát lạnh.' },
  { id: 'ginger', name: 'Gừng', icon: '🫚', cost: 4000, maxStock: 20, rarity: 'uncommon', unlockLevel: 4, desc: 'Vị cay ấm cho trà nóng.' },
  { id: 'chrysanthemum', name: 'Hoa cúc', icon: '🌼', cost: 5000, maxStock: 15, rarity: 'rare', unlockLevel: 4, desc: 'Hương hoa dịu nhẹ.' },
  { id: 'jasmine', name: 'Hoa nhài', icon: '🌼', cost: 9000, maxStock: 10, rarity: 'epic', unlockLevel: 6, desc: 'Hương thơm thanh khiết.' },
  { id: 'snowpearl', name: 'Trân châu tuyết', icon: '💎', cost: 15000, maxStock: 8, rarity: 'legendary', unlockLevel: 10, desc: 'Trân châu trong suốt như pha lê.' },
];
export const INGREDIENT_MAP = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

export const RECIPES = [
  { id: 'lemonTea', name: 'Trà chanh', icon: '🍋', price: 20000, preparationTime: 3, temp: 'cold', unlockLevel: 1, rarity: 'common', ingredients: { tea: 1, lemon: 1, sugar: 1, ice: 1 }, desc: 'Chua ngọt mát lạnh.' },
  { id: 'peachTea', name: 'Trà đào', icon: '🍑', price: 25000, preparationTime: 3, temp: 'cold', unlockLevel: 1, rarity: 'common', ingredients: { tea: 1, peach: 1, sugar: 1, ice: 1 }, desc: 'Món tủ của mọi tiệm trà.' },
  { id: 'milkTea', name: 'Trà sữa', icon: '🧋', price: 30000, preparationTime: 3.5, temp: 'cold', unlockLevel: 1, rarity: 'common', ingredients: { tea: 1, milk: 1, sugar: 1, ice: 1 }, desc: 'Béo thơm, dễ uống.' },
  { id: 'hotTea', name: 'Trà nóng', icon: '☕', price: 18000, preparationTime: 2.5, temp: 'hot', unlockLevel: 1, rarity: 'common', ingredients: { tea: 1, sugar: 1 }, desc: 'Ấm bụng ngày lạnh.' },
  { id: 'pearlMilkTea', name: 'Trà sữa trân châu', icon: '🧋', price: 35000, preparationTime: 4, temp: 'cold', unlockLevel: 2, rarity: 'uncommon', ingredients: { tea: 1, milk: 1, pearl: 2, sugar: 1 }, desc: 'Thêm trân châu dai dai.' },
  { id: 'hotMilkTea', name: 'Trà sữa nóng', icon: '🍶', price: 30000, preparationTime: 3.5, temp: 'hot', unlockLevel: 2, rarity: 'common', ingredients: { tea: 1, milk: 1, sugar: 1 }, desc: 'Trà sữa phiên bản ấm áp.' },
  { id: 'matchaLatte', name: 'Matcha latte', icon: '🍵', price: 40000, preparationTime: 4.5, temp: 'hot', unlockLevel: 3, rarity: 'rare', ingredients: { matcha: 1, milk: 1, sugar: 1 }, desc: 'Vị trà xanh đậm đà.' },
  { id: 'lycheeTea', name: 'Trà vải', icon: '🍒', price: 32000, preparationTime: 3.5, temp: 'cold', unlockLevel: 3, rarity: 'uncommon', ingredients: { tea: 1, lychee: 2, sugar: 1, ice: 1 }, desc: 'Ngọt thanh hương vải.' },
  { id: 'fruitTea', name: 'Trà trái cây', icon: '🍓', price: 38000, preparationTime: 4, temp: 'cold', unlockLevel: 4, rarity: 'uncommon', ingredients: { tea: 1, fruit: 2, sugar: 1, ice: 1 }, desc: 'Đầy ắp trái cây tươi.' },
  { id: 'honeyTea', name: 'Trà mật ong', icon: '🍯', price: 28000, preparationTime: 3, temp: 'hot', unlockLevel: 5, rarity: 'rare', ingredients: { tea: 1, honey: 1 }, desc: 'Dịu họng, ấm lòng.' },
  { id: 'matchaPearl', name: 'Matcha trân châu', icon: '🥤', price: 50000, preparationTime: 5, temp: 'cold', unlockLevel: 6, rarity: 'rare', ingredients: { matcha: 1, milk: 1, pearl: 2, ice: 1 }, desc: 'Kết hợp hoàn hảo.' },
  { id: 'roseMilkTea', name: 'Trà sữa hoa hồng', icon: '🌹', price: 48000, preparationTime: 5, temp: 'cold', unlockLevel: 7, rarity: 'epic', ingredients: { tea: 1, milk: 1, rose: 1, sugar: 1, ice: 1 }, desc: 'Thơm ngát, sang trọng.' },
  { id: 'honeyLemon', name: 'Chanh mật ong', icon: '🍋', price: 30000, preparationTime: 3, temp: 'hot', unlockLevel: 8, rarity: 'rare', ingredients: { lemon: 1, honey: 1 }, desc: 'Bí quyết khoẻ người.' },
  { id: 'snowPearlTea', name: 'Trà sữa trân châu tuyết', icon: '💎', price: 80000, preparationTime: 6, temp: 'cold', unlockLevel: 10, rarity: 'legendary', ingredients: { tea: 1, milk: 1, snowpearl: 1, pearl: 1, ice: 1 }, desc: 'Thức uống trong mơ.' },
];
export const RECIPE_MAP = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

export const SPECIAL_REQUESTS = [
  { id: 'lessSugar', name: 'Ít đường' },
  { id: 'moreIce', name: 'Nhiều đá' },
  { id: 'noIce', name: 'Không đá' },
  { id: 'extraPearl', name: 'Thêm trân châu' },
  { id: 'lessMilk', name: 'Ít sữa' },
];

export const CUSTOMER_NAMES = ['Lan', 'Minh', 'Hoa', 'Tuấn', 'My', 'Khoa', 'Trang', 'Đức', 'Vy', 'Huy', 'Ngọc', 'Bảo', 'Linh', 'Nam', 'Thảo', 'Phúc', 'Quỳnh', 'Long', 'Chi', 'An'];
export const CUSTOMER_AVATARS = ['👧', '👦', '👩', '👨', '🧑', '👵', '👴', '👩‍🦰', '👱‍♀️', '🧔', '👩‍🎓', '🧕', '👨‍💼', '👩‍🍳', '🧒'];
export const SEASON_VIPS = {
  spring: { name: 'Cô Tiên Hoa', avatar: '🧚', tipMul: 1.8 },
  summer: { name: 'Anh Cứu Hộ', avatar: '🏄', tipMul: 1.8 },
  autumn: { name: 'Bác Nông Dân', avatar: '🧑‍🌾', tipMul: 1.8 },
  winter: { name: 'Ông Già Tuyết', avatar: '🎅', tipMul: 2.2 },
};

export const CUSTOMER_CONFIG = {
  basePatience: 30,
  baseSpawnInterval: 6,
  minSpawnInterval: 2.5,
  baseSeats: 3,
  vipChance: 0.08,
  specialRequestChance: 0.3,
};

export const QUALITY = {
  PERFECT: { label: 'PERFECT', mul: 1.2, rating: 0.04, xp: 1.4, emoji: '🌟' },
  GOOD: { label: 'GOOD', mul: 1.0, rating: 0.02, xp: 1.0, emoji: '😊' },
  OK: { label: 'OK', mul: 0.8, rating: 0, xp: 0.7, emoji: '🙂' },
  FAILED: { label: 'FAILED', mul: 0, rating: -0.03, xp: 0.2, emoji: '😖' },
};
export const RATING_LEAVE_PENALTY = 0.1;

export const UPGRADES = [
  { id: 'counter', name: 'Quầy pha chế', icon: '🫖', desc: '-8% thời gian pha mỗi cấp', baseCost: 20000, maxLevel: 5, unlockLevel: 1 },
  { id: 'sign', name: 'Biển hiệu', icon: '🪧', desc: 'Khách đến nhanh hơn 10% mỗi cấp', baseCost: 15000, maxLevel: 5, unlockLevel: 1 },
  { id: 'decor', name: 'Trang trí', icon: '🪴', desc: '+5 giây kiên nhẫn mỗi cấp', baseCost: 25000, maxLevel: 5, unlockLevel: 2 },
  { id: 'seats', name: 'Bàn ghế', icon: '🪑', desc: '+1 khách cùng lúc mỗi cấp', baseCost: 30000, maxLevel: 3, unlockLevel: 2 },
  { id: 'storage', name: 'Kho hàng', icon: '📦', desc: '+10 sức chứa mỗi nguyên liệu', baseCost: 20000, maxLevel: 5, unlockLevel: 2 },
  { id: 'vehicle', name: 'Xe giao hàng', icon: '🛵', desc: '+1 xe giao hàng', baseCost: 50000, maxLevel: 3, unlockLevel: 3 },
  { id: 'assistant', name: 'Nhân viên', icon: '👩‍🍳', desc: 'Thuê trợ lý tự pha (cấp cao pha nhanh hơn)', baseCost: 80000, maxLevel: 3, unlockLevel: 4 },
];
export const UPGRADE_COST_GROWTH = 1.35;

export const LEVELS = [
  null,
  { xp: 0, reward: { money: 0 }, note: 'Tiệm nhỏ khai trương' },
  { xp: 120, reward: { money: 20000, items: { pearl: 5 } }, note: 'Mở công thức mới' },
  { xp: 320, reward: { money: 30000 }, note: 'Mở giao hàng 🛵' },
  { xp: 650, reward: { money: 40000, items: { fruit: 3 } }, note: 'Có thể thuê nhân viên' },
  { xp: 1100, reward: { money: 60000 }, note: 'Mở chi nhánh 🏪' },
  { xp: 1700, reward: { money: 80000, items: { matcha: 3 } }, note: 'Công thức mới' },
  { xp: 2500, reward: { money: 100000, items: { rose: 2 } }, note: 'Chi nhánh thứ 2' },
  { xp: 3600, reward: { money: 120000 }, note: 'Công thức mới' },
  { xp: 5000, reward: { money: 150000, items: { honey: 3 } }, note: 'Sắp thành franchise!' },
  { xp: 7000, reward: { money: 300000, items: { snowpearl: 2 } }, note: 'FRANCHISE 🎉' },
  { xp: 9500, reward: { money: 350000 }, note: 'Thương hiệu lớn' },
  { xp: 12500, reward: { money: 400000 }, note: 'Huyền thoại trà' },
];
export const MAX_LEVEL = LEVELS.length - 1;
export const FEATURE_LEVELS = { delivery: 3, farm: 3, assistant: 4, branch: 5, franchise: 10 };
export const FARM_CONFIG = {
  unlockLevel: 3,
  plots: 4,
  lands: [
    { id: 'leftGarden', name: 'Vườn bên trái', plots: 2, cost: 30000, unlockLevel: 3, icon: '🌿' },
    { id: 'rightGarden', name: 'Vườn bên phải', plots: 2, cost: 60000, unlockLevel: 4, icon: '🌳' },
    { id: 'hill', name: 'Khu đồi', plots: 4, cost: 150000, unlockLevel: 5, icon: '⛰️' },
    { id: 'pondGarden', name: 'Vườn hồ nước', plots: 4, cost: 300000, unlockLevel: 7, icon: '💧' },
    { id: 'greenhouse', name: 'Nhà kính', plots: 6, cost: 600000, unlockLevel: 9, icon: '🏡' },
  ],
  buildings: {
    coop: { name: 'Chuồng gà', icon: '🐔', cost: 80000, unlockLevel: 3 },
    pond: { name: 'Ao nước', icon: '💧', cost: 120000, unlockLevel: 4 },
    flowerGarden: { name: 'Vườn hoa', icon: '🌷', cost: 100000, unlockLevel: 4 },
    beehive: { name: 'Tổ ong', icon: '🍯', cost: 180000, unlockLevel: 5 },
  },
  crops: {
    tea: { name: 'Bụi trà', icon: '🍵', ingredient: 'tea', days: 3, yield: [3, 5], seedCost: 2500, sun: 1.1 },
    lemon: { name: 'Cây chanh', icon: '🍋', ingredient: 'lemon', days: 4, yield: [2, 4], seedCost: 3000, sun: 1.05 },
    peach: { name: 'Cây đào', icon: '🍑', ingredient: 'peach', days: 5, yield: [2, 5], seedCost: 4500, sun: 1.0 },
    rose: { name: 'Hoa hồng', icon: '🌹', ingredient: 'rose', days: 6, yield: [1, 3], seedCost: 7000, sun: 0.95 },
    mint: { name: 'Bạc hà', icon: '🌿', ingredient: 'mint', days: 3, yield: [2, 5], seedCost: 3500, sun: 1.1, unlockLevel: 3 },
    ginger: { name: 'Gừng', icon: '🫚', ingredient: 'ginger', days: 4, yield: [2, 4], seedCost: 4000, sun: 1, unlockLevel: 4 },
    chrysanthemum: { name: 'Hoa cúc', icon: '🌼', ingredient: 'chrysanthemum', days: 4, yield: [2, 4], seedCost: 5000, sun: 1, unlockLevel: 4 },
    lychee: { name: 'Cây vải', icon: '🍒', ingredient: 'lychee', days: 5, yield: [2, 4], seedCost: 6500, sun: 1.05, unlockLevel: 5 },
    jasmine: { name: 'Hoa nhài', icon: '🌼', ingredient: 'jasmine', days: 6, yield: [1, 3], seedCost: 9000, sun: 0.95, unlockLevel: 6 },
  },
  waterCost: 300,
  fertilizerCost: 1200,
  pesticideCost: 1500,
};

export const BUFFS = {
  karinBlessing: { id: 'karinBlessing', name: 'Phước lành Karin', icon: '🍀', duration: 30, effects: { patienceMultiplier: 1.2, moneyMultiplier: 1.1 } },
  happyHour: { id: 'happyHour', name: 'Happy Hour', icon: '🎉', duration: 45, effects: { moneyMultiplier: 1.3 } },
  rainBonus: { id: 'rainBonus', name: 'Mưa may mắn', icon: '🌧️', duration: 9999, effects: { deliveryMultiplier: 1.3 } },
  festivalBonus: { id: 'festivalBonus', name: 'Lễ hội', icon: '🎊', duration: 9999, effects: { moneyMultiplier: 1.2, spawnMultiplier: 1.2 } },
  luckyDay: { id: 'luckyDay', name: 'Ngày may mắn', icon: '🎲', duration: 9999, effects: { tipChance: 0.3 } },
};

export const KARIN = {
  name: 'Karin',
  avatar: '🐰',
  skillName: 'Xin Phước',
  cooldown: 60,
  patienceBonus: 20,
  luckyMoney: 5000,
};

export const DELIVERY_DESTINATIONS = [
  { id: 'office', name: 'Văn phòng Mây', icon: '🏢', duration: 25, reward: 30000 },
  { id: 'school', name: 'Trường Hoa Mai', icon: '🏫', duration: 30, reward: 35000 },
  { id: 'park', name: 'Công viên Xanh', icon: '🌳', duration: 20, reward: 25000 },
  { id: 'hospital', name: 'Bệnh viện Nắng', icon: '🏥', duration: 40, reward: 45000 },
  { id: 'apartment', name: 'Chung cư Bình Minh', icon: '🏬', duration: 35, reward: 40000 },
  { id: 'beach', name: 'Bãi biển Mơ', icon: '🏖️', duration: 55, reward: 65000 },
];
export const DELIVERY_CONFIG = { baseVehicles: 1, baseOrdersPerDay: 2, rewardGrowthPerDay: 0.03 };

export const BRANCH_TEMPLATES = [
  { id: 'district1', name: 'Chi nhánh Quận 1', icon: '🏪', cost: 300000, baseRevenue: 6000 },
  { id: 'thuduc', name: 'Chi nhánh Thủ Đức', icon: '🏬', cost: 500000, baseRevenue: 9000 },
  { id: 'dalat', name: 'Chi nhánh Đà Lạt', icon: '🏔️', cost: 800000, baseRevenue: 14000 },
  { id: 'danang', name: 'Chi nhánh Đà Nẵng', icon: '🌉', cost: 1300000, baseRevenue: 22000 },
  { id: 'hanoi', name: 'Chi nhánh Hà Nội', icon: '🏯', cost: 2000000, baseRevenue: 35000 },
];
export const BRANCH_CONFIG = { incomeInterval: 60, upgradeBaseCost: 150000, maxLevel: 10 };
/** Số chi nhánh tối đa theo level người chơi */
export function maxBranchesForLevel(level) {
  if (level >= 10) return 5;
  if (level >= 7) return 2;
  if (level >= 5) return 1;
  return 0;
}

export const ACHIEVEMENTS = [
  { id: 'firstServe', name: 'Khách đầu tiên', icon: '🎈', description: 'Phục vụ khách hàng đầu tiên', reward: { money: 5000, xp: 20 } },
  { id: 'earn100k', name: 'Tiền về!', icon: '💰', description: 'Kiếm tổng cộng 100.000đ', reward: { money: 10000, xp: 30 } },
  { id: 'serve100', name: 'Trăm khách', icon: '👥', description: 'Phục vụ 100 khách', reward: { money: 50000, xp: 150 } },
  { id: 'perfectDay', name: 'Ngày hoàn hảo', icon: '🌈', description: 'Không làm khách bỏ đi trong một ngày', reward: { money: 15000, xp: 60 } },
  { id: 'recipes10', name: 'Bếp trưởng', icon: '📖', description: 'Mở khóa 10 công thức', reward: { money: 40000, xp: 120 } },
  { id: 'firstBranch', name: 'Bành trướng', icon: '🏪', description: 'Mở chi nhánh đầu tiên', reward: { money: 100000, xp: 200 } },
  { id: 'allCommon', name: 'Nhà sưu tầm', icon: '🧺', description: 'Thu thập toàn bộ nguyên liệu Thường', reward: { money: 20000, xp: 80 } },
  { id: 'perfect10', name: 'Tay nghề cao', icon: '🌟', description: 'Pha 10 ly PERFECT', reward: { money: 20000, xp: 80 } },
  { id: 'delivery10', name: 'Shipper vàng', icon: '🛵', description: 'Hoàn thành 10 đơn giao hàng', reward: { money: 30000, xp: 100 } },
  { id: 'karin5', name: 'Bạn thân Karin', icon: '🐰', description: 'Xin phước Karin 5 lần', reward: { money: 10000, xp: 40 } },
];

export const MINIGAME = { cols: 6, rows: 6, colors: 5, duration: 30, freePlaysPerDay: 1, playCost: 5000, moneyPerPoint: 60, pearlPerPoints: 40 };

export const DAY_CONFIG = {
  baseCustomers: 5,
  customersPerDay: 0.7,
  customersPerLevel: 1,
  maxCustomers: 30,
  xpPerServe: 15,
  festivalEvery: 7,
  luckyDayChance: 0.1,
  happyHourAt: 4,
};
