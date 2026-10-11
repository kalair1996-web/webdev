import { extractSkills, intersect, percentPresent } from '../utils.js';

// Match the resume against the skills named in the job description and score
// the overlap. Skill names are extracted via the fixed list of known skills,
// then scored by how many the resume also mentions.
export function analyzeResume(jdText, detectionText) {
  const required = extractSkills(jdText);
  const forResume = extractSkills(detectionText);

  if (required.length === 0) {
    return { score: 0, present: [], missing: [], source: 'JD named no known skills' };
  }

  const present = intersect(required, forResume);
  const missing = required.filter((name) => !forResume.includes(name));
  const score = percentPresent(required, forResume);

  return { score, present, missing, source: `matched against ${required.length} JD skills` };
}
