module.exports = (db) =>
  db.model(
    'GachaLogs',
    db.Schema(
      {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        prize: { type: String, default: null }, // null = tidak menang
        gachaDate: { type: Date, default: Date.now },
      },
      { timestamps: true }
    )
  );
