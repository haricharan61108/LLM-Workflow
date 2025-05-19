import express from 'express';
import { getNews } from '../services/fetchNews.js';
import { exportNewsToDoc } from '../services/exportNewsToDoc.js';
import { extractAndSendNewsToLLM } from '../services/summarizeNews.js';

const router = express.Router();

router.get('/get',exportNewsToDoc);
router.get('/getNews',extractAndSendNewsToLLM);

export default router;