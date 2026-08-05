const multer = require("multer");
const path = require("path");

const ALLOWED_TYPES = /jpeg|jpg|png|gif|webp/;
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `screenshot-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase());
  const mime = ALLOWED_TYPES.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

module.exports = upload;
