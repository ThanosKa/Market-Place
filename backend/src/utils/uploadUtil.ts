// utils/uploadUtil.ts
import multer from "multer";
import path from "path";

const storage = (folder: string): multer.StorageEngine =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
      );
    },
  });

export const upload = (folder: string, fileCount: number = 1) =>
  multer({ storage: storage(folder) }).array("images", fileCount);
export const uploadSingle = (folder: string) =>
  multer({ storage: storage(folder) }).single("profilePicture");
