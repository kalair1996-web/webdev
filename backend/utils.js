import { SKILLS } from './data/skills.js';

// Names of the known skills that appear in the given text.
export function extractSkills(text) {
  const found = [];
  for (const skill of SKILLS) {
    if (skill.re.test(text)) found.push(skill.name);
  }
  return found;
}

// Intersection helper: items of `a` that also appear in `b`.
export function intersect(a, b) {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
}

// Percentage helper: share of `a` items present in `b`, 0-100.
export function percentPresent(a, b) {
  if (a.length === 0) return 0;
  return Math.round((intersect(a, b).length / a.length) * 100);
}
