import multer from 'multer';

// Resume PDFs are held in memory only — nothing is written to disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export default upload.single('resume');
