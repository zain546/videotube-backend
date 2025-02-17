import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.resolve(__dirname, '../../public/temp');

    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    console.log(file);
    
    // Generate a unique filename with the original extension
    const uniqueFilename = file.originalname.replace(/\.[^/.]+$/, '') + '-' + Date.now() + path.extname(file.originalname);
    
    cb(null, uniqueFilename);
  }
});

export const upload = multer({ storage: storage });
