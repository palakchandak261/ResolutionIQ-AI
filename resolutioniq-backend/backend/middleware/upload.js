const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isAudio = file.mimetype.startsWith("audio/");
    const dir = path.join(__dirname, "..", "uploads", isAudio ? "voice" : "images");
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|mp3|wav|m4a|ogg|webm/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const typeOk = /image\/|audio\//.test(file.mimetype);
  if (extOk && typeOk) return cb(null, true);
  cb(new Error("Unsupported file type. Only images and audio are allowed."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB) || 15) * 1024 * 1024 },
});

module.exports = upload;
