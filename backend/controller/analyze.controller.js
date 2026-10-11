import pdfParse from 'pdf-parse';
import { analyzeResume } from '../service/analyzer.js';
import { Analysis } from '../config/db.js';

// POST /api/analyze — receives the resume PDF (multipart) and JD text,
// extracts the PDF text, scores it against the JD, and stores the result.
export async function analyzeController(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No resume PDF received.' });
  }

  const jdText = String(req.body.jd || '');
  if (!jdText.trim()) {
    return res.status(400).json({ error: 'No job description received.' });
  }

  let resumeText;
  try {
    resumeText = (await pdfParse(req.file.buffer)).text;
  } catch (err) {
    return res
      .status(422)
      .json({ error: 'Could not read that PDF. If it is a scan, there is no text to parse.' });
  }

  const result = analyzeResume(jdText, resumeText);

  // Best effort — a failed save should not block the response.
  try {
    await Analysis.create({
      fileName: req.file.originalname,
      jdText,
      score: result.score,
      present: result.present,
      missing: result.missing,
    });
  } catch (err) {
    console.error('Failed to save analysis:', err.message);
  }

  res.json({ fileName: req.file.originalname, ...result });
}
