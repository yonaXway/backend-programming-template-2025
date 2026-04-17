const gachaRepository = require('./gacha-repository');

/**
 * Lakukan proses gacha untuk user tertentu
 */
async function doGacha(userId, userName) {
  // 1. Cek apakah user sudah melebihi kuota gacha hari ini
  const gachaCountToday = await gachaRepository.countGachaToday(userId);
  if (gachaCountToday >= gachaRepository.MAX_GACHA_PER_DAY) {
    return {
      success: false,
      error: `Anda sudah mencapai batas maksimal gacha (${gachaRepository.MAX_GACHA_PER_DAY} kali) untuk hari ini.`,
    };
  }

  // 2. Tentukan hadiah yang dimenangkan (atau tidak menang)
  let wonPrize = null;

  for (const prize of gachaRepository.PRIZES) {
    // Cek sisa kuota hadiah ini
    const winnerCount = await gachaRepository.countPrizeWinners(prize.name);
    if (winnerCount >= prize.quota) {
      // Kuota hadiah ini sudah habis, lewati
      continue;
    }

    // Cek apakah user beruntung mendapatkan hadiah ini
    const random = Math.random();
    if (random < prize.chance) {
      wonPrize = prize.name;
      break; // Hanya menang 1 hadiah
    }
  }

  // 3. Simpan log gacha ke database
  await gachaRepository.saveGachaLog(userId, userName, wonPrize);

  return {
    success: true,
    prize: wonPrize,
    gachaUsedToday: gachaCountToday + 1,
    gachaRemainingToday: gachaRepository.MAX_GACHA_PER_DAY - (gachaCountToday + 1),
  };
}

/**
 * Ambil riwayat gacha seorang user
 */
async function getGachaHistory(userId) {
  const logs = await gachaRepository.getGachaHistoryByUser(userId);
  return logs.map((log) => ({
    gachaDate: log.gachaDate,
    prize: log.prize || 'Tidak menang',
  }));
}

/**
 * Ambil daftar hadiah dan sisa kuota masing-masing
 */
async function getPrizesWithRemainingQuota() {
  const result = [];

  for (const prize of gachaRepository.PRIZES) {
    const winnerCount = await gachaRepository.countPrizeWinners(prize.name);
    result.push({
      prize: prize.name,
      totalQuota: prize.quota,
      winnersCount: winnerCount,
      remainingQuota: prize.quota - winnerCount,
    });
  }

  return result;
}

/**
 * Samarkan nama pemenang secara acak
 * Contoh: "Jane Doe" -> "J*** *oe" atau "*an* D*e"
 */
function maskName(name) {
  return name
    .split(' ')
    .map((word) => {
      if (word.length <= 1) return word;

      const chars = word.split('');
      // Tentukan berapa karakter yang disembunyikan (sekitar setengah)
      const maskCount = Math.floor(word.length / 2);

      // Pilih posisi acak untuk disembunyikan
      const positions = [];
      while (positions.length < maskCount) {
        const pos = Math.floor(Math.random() * word.length);
        if (!positions.includes(pos)) {
          positions.push(pos);
        }
      }

      positions.forEach((pos) => {
        chars[pos] = '*';
      });

      return chars.join('');
    })
    .join(' ');
}

/**
 * Ambil daftar pemenang setiap hadiah (nama disamarkan)
 */
async function getWinnersPerPrize() {
  const result = [];

  for (const prize of gachaRepository.PRIZES) {
    const winners = await gachaRepository.getWinnersByPrize(prize.name);
    result.push({
      prize: prize.name,
      winners: winners.map((w) => ({
        maskedName: maskName(w.userName),
        gachaDate: w.gachaDate,
      })),
    });
  }

  return result;
}

module.exports = {
  doGacha,
  getGachaHistory,
  getPrizesWithRemainingQuota,
  getWinnersPerPrize,
};
