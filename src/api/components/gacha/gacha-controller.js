const gachaService = require('./gacha-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * POST /api/gacha
 * Endpoint utama: lakukan gacha
 * Body: { user_id, user_name }
 */
async function doGacha(request, response, next) {
  try {
    const { user_id: userId, user_name: userName } = request.body;

    if (!userId) {
      throw errorResponder(errorTypes.VALIDATION, 'user_id wajib diisi');
    }
    if (!userName) {
      throw errorResponder(errorTypes.VALIDATION, 'user_name wajib diisi');
    }

    const result = await gachaService.doGacha(userId, userName);

    if (!result.success) {
      throw errorResponder(errorTypes.FORBIDDEN, result.error);
    }

    return response.status(200).json({
      message: result.prize
        ? `Selamat! Anda memenangkan: ${result.prize}`
        : 'Sayang sekali, Anda tidak memenangkan hadiah kali ini. Coba lagi!',
      prize: result.prize || null,
      gacha_used_today: result.gachaUsedToday,
      gacha_remaining_today: result.gachaRemainingToday,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/gacha/history/:userId
 * Bonus 1: Lihat riwayat gacha seorang user
 */
async function getGachaHistory(request, response, next) {
  try {
    const { userId } = request.params;

    if (!userId) {
      throw errorResponder(errorTypes.VALIDATION, 'userId wajib diisi');
    }

    const history = await gachaService.getGachaHistory(userId);

    return response.status(200).json({
      userId,
      totalGacha: history.length,
      history,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/gacha/prizes
 * Bonus 2: Lihat daftar hadiah dan sisa kuota
 */
async function getPrizes(request, response, next) {
  try {
    const prizes = await gachaService.getPrizesWithRemainingQuota();
    return response.status(200).json({ prizes });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/gacha/winners
 * Bonus 3: Lihat daftar pemenang setiap hadiah (nama disamarkan)
 */
async function getWinners(request, response, next) {
  try {
    const winners = await gachaService.getWinnersPerPrize();
    return response.status(200).json({ winners });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  doGacha,
  getGachaHistory,
  getPrizes,
  getWinners,
};
