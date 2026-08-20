import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

// Directory where uploaded vehicle photos are stored
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const uploadPath = path.resolve(process.cwd(), UPLOAD_DIR);

// Ensure the upload directory exists
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `vehicle-${unique}${ext}`);
    }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Public URL path (relative) for a stored file, e.g. uploads/vehicle-123.png
export const toPublicPath = (filename: string): string => `${UPLOAD_DIR}/${filename}`;

export { UPLOAD_DIR, uploadPath };
export default upload;
