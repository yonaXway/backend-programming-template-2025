const express = require('express');
const gachaController = require('./gacha-controller');

const route = express.Router();

module.exports = (app) => {
  app.use('/gacha', route);

  // Endpoint utama: lakukan gacha
  // POST /api/gacha
  // Body: { user_id, user_name }
  route.post('/', gachaController.doGacha);

  // Bonus 1: Riwayat gacha seorang user
  // GET /api/gacha/history/:userId
  route.get('/history/:userId', gachaController.getGachaHistory);

  // Bonus 2: Daftar hadiah dan sisa kuota
  // GET /api/gacha/prizes
  route.get('/prizes', gachaController.getPrizes);

  // Bonus 3: Daftar pemenang per hadiah (nama disamarkan)
  // GET /api/gacha/winners
  route.get('/winners', gachaController.getWinners);
};
