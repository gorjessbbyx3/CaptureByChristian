import multer from "multer";
import path from "path";
import { Request, Response, NextFunction } from "express";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
// File signature validation (magic numbers)
const IMAGE_SIGNATURES = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/gif": [0x47, 0x49, 0x46],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
  "image/bmp": [0x42, 0x4d],
};

const validateFileSignature = (buffer: Buffer, mimeType: string): boolean => {
  const signature = IMAGE_SIGNATURES[mimeType as keyof typeof IMAGE_SIGNATURES];
  if (!signature) return false;

  return signature.every((byte, index) => buffer[index] === byte);
};

const sanitizeFilename = (filename: string): string => {
  // Remove path traversal attempts and dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/\.+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .substring(0, 100); // Limit filename length
};

const validateImageFile = (file: MulterFile): boolean => {
  // Check file signature
  if (!validateFileSignature(file.buffer, file.mimetype)) {
    return false;
  }

  // Additional checks for image files
  if (file.size === 0) return false;
  if (file.size > 50 * 1024 * 1024) return false; // 50MB limit

  return true;
};

// Enhanced multer configuration
export const createSecureUpload = () => {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit for high-resolution photography
      files: 10, // Maximum 10 files per upload
      fieldSize: 1024 * 1024, // 1MB field size limit
    },
    fileFilter: (
      _req: Request,
      file: MulterFile,
      cb: multer.FileFilterCallback,
    ) => {
      try {
        // Check MIME type
        if (!file.mimetype.startsWith("image/")) {
          return cb(new Error("Only image files are allowed"));
        }

        // Check file extension
        const allowedExtensions = [
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".webp",
          ".bmp",
        ];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          return cb(new Error("Invalid file extension"));
        }

        // Sanitize filename
        file.originalname = sanitizeFilename(file.originalname);

        cb(null, true);
      } catch (error) {
        cb(new Error("File validation failed"));
      }
    },
  });
};

// Middleware to validate uploaded files after multer processing
export const validateUploadedFiles = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.files) {
      const files = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat();

      for (const file of files) {
        if (!validateImageFile(file)) {
          return res.status(400).json({
            error: "Invalid file detected",
            filename: file.originalname,
          });
        }
      }
    }

    if (req.file && !validateImageFile(req.file)) {
      return res.status(400).json({
        error: "Invalid file detected",
        filename: req.file.originalname,
      });
    }

    next();
  } catch (error) {
    res.status(400).json({ error: "File validation failed" });
  }
};
