const multer = require("multer");
const path = require("path");

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const ALLOWED_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

// Magic bytes (file signatures) for allowed image types
const MAGIC_BYTES = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/gif": [0x47, 0x49, 0x46, 0x38],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF header
};

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `screenshot-${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // 1. Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error("Only image files (jpg, png, gif, webp) are allowed"));
  }

  // 2. Check for double extensions (e.g., image.jpg.php)
  const parts = file.originalname.split(".");
  if (parts.length > 2) {
    return cb(new Error("Invalid file name"));
  }

  // 3. Check MIME type
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error("Invalid file type"));
  }

  cb(null, true);
};

// Check magic bytes after file is written to disk
function validateMagicBytes(req, res, next) {
  if (!req.file) return next();

  const fs = require("fs");
  const buffer = Buffer.alloc(8);
  const fd = fs.openSync(req.file.path, "r");

  try {
    fs.readSync(fd, buffer, 0, 8, 0);
  } finally {
    fs.closeSync(fd);
  }

  const expected = MAGIC_BYTES[req.file.mimetype];
  if (!expected) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "Unsupported image type" });
  }

  // Check header bytes match expected magic bytes
  const matches = expected.every((byte, i) => buffer[i] === byte);
  if (!matches) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "File content does not match image type" });
  }

  // For WebP, also verify the "WEBP" marker at offset 8
  if (req.file.mimetype === "image/webp") {
    const webpMarker = Buffer.from("WEBP");
    const markerBuf = Buffer.alloc(4);
    const fd2 = fs.openSync(req.file.path, "r");
    try {
      fs.readSync(fd2, markerBuf, 0, 4, 8);
    } finally {
      fs.closeSync(fd2);
    }
    if (!markerBuf.equals(webpMarker)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Invalid WebP file" });
    }
  }

  next();
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

module.exports = { upload, validateMagicBytes };
