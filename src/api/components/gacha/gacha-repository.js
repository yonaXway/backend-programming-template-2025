const { GachaLogs } = require('../../../models');

const PRIZES = [
  { name: 'Emas 10 gram', quota: 1, chance: 0.001 },
  { name: 'Smartphone X', quota: 5, chance: 0.005 },
  { name: 'Smartwatch Y', quota: 10, chance: 0.01 },
  { name: 'Voucher Rp100.000', quota: 100, chance: 0.1 },
  { name: 'Pulsa Rp50.000', quota: 500, chance: 0.3 },
];

const MAX_GACHA_PER_DAY = 5;

/**
 * Hitung berapa kali user sudah gacha hari ini
 */
async function countGachaToday(userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return GachaLogs.countDocuments({
    userId,
    gachaDate: { $gte: startOfDay, $lte: endOfDay },
  });
}

/**
 * Hitung berapa pemenang suatu hadiah sampai sekarang
 */
async function countPrizeWinners(prizeName) {
  return GachaLogs.countDocuments({ prize: prizeName });
}

/**
 * Simpan log gacha ke database
 */
async function saveGachaLog(userId, userName, prize) {
  return GachaLogs.create({
    userId,
    userName,
    prize: prize || null,
    gachaDate: new Date(),
  });
}

/**
 * Ambil semua riwayat gacha seorang user
 */
async function getGachaHistoryByUser(userId) {
  return GachaLogs.find({ userId }).sort({ gachaDate: -1 });
}

/**
 * Ambil semua pemenang suatu hadiah
 */
async function getWinnersByPrize(prizeName) {
  return GachaLogs.find({ prize: prizeName }).select('userName gachaDate');
}

module.exports = {
  PRIZES,
  MAX_GACHA_PER_DAY,
  countGachaToday,
  countPrizeWinners,
  saveGachaLog,
  getGachaHistoryByUser,
  getWinnersByPrize,
};
