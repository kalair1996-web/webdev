import { Router } from 'express';
import upload from '../middleware/upload.js';
import { analyzeController } from '../controller/analyze.controller.js';

const router = Router();

router.post('/analyze', upload, analyzeController);

export default router;
