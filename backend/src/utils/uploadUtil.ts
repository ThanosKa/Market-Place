import multer from "multer";
import path from "path";
import fs from "fs";

function ensureDirectoryExistence(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const storage = (
  folder: string,
  filenamePrefix: string = ""
): multer.StorageEngine =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), folder);
      ensureDirectoryExistence(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(
        null,
        `${filenamePrefix}${uniqueSuffix}${path.extname(file.originalname)}`
      );
    },
  });

export const upload = (folder: string, fileCount: number = 1) =>
  multer({ storage: storage(folder, "images-") }).array("images", fileCount);

export const uploadSingle = (folder: string) =>
  multer({ storage: storage(folder, "profilePicture-") }).single(
    "profilePicture"
  );

export const uploadChatImages = multer({
  storage: storage("uploads/", "chatIMG-"),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."));
    }
  },
}).array("images", 5); // Allow up to 5 images per message
