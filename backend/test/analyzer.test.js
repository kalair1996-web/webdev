import { test } from 'node:test';
import assert from 'node:assert';
import { analyzeResume } from '../service/analyzer.js';

test('scores a resume that matches the whole JD', () => {
  const jd = 'Need React, TypeScript, and CI/CD experience.';
  const resume = 'I built dashboards in React and TypeScript, with GitHub Actions CI/CD.';
  const { score, missing } = analyzeResume(jd, resume);
  assert.equal(missing.length, 0);
  assert.equal(score, 100);
});

test('marks skills the resume lacks as missing', () => {
  const jd = 'Need React and Docker.';
  const resume = 'I use React daily.';
  const { present, missing } = analyzeResume(jd, resume);
  assert.deepEqual(present, ['React']);
  assert.deepEqual(missing, ['Docker']);
});

test('returns 0 when the JD names no known skills', () => {
  const { score } = analyzeResume('Need a good communicator.', 'Some resume text.');
  assert.equal(score, 0);
});
