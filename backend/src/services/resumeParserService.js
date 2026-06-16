const fs = require('node:fs');
const pdfParse = require('pdf-parse');

const COMMON_SKILLS = [
  'javascript', 'typescript', 'react', 'node.js', 'node', 'express', 'python',
  'java', 'sql', 'postgresql', 'sqlite', 'mongodb', 'aws', 'docker', 'kubernetes',
  'html', 'css', 'tailwind', 'git', 'github', 'rest', 'api', 'testing', 'jest', 'vitest',
];

const SECTION_PATTERNS = {
  summary: /(?:summary|profile|objective)\s*[:\n]([\s\S]*?)(?=\n\s*(?:experience|projects|skills|education|certifications)\b|$)/i,
  experience: /(?:experience|work history)\s*[:\n]([\s\S]*?)(?=\n\s*(?:projects|skills|education|certifications|summary)\b|$)/i,
  projects: /(?:projects?)\s*[:\n]([\s\S]*?)(?=\n\s*(?:experience|skills|education|certifications|summary)\b|$)/i,
  skills: /(?:skills?|technical skills)\s*[:\n]([\s\S]*?)(?=\n\s*(?:experience|projects|education|certifications|summary)\b|$)/i,
  education: /(?:education)\s*[:\n]([\s\S]*?)(?=\n\s*(?:experience|projects|skills|certifications|summary)\b|$)/i,
};

function normalizeText(text = '') {
  return text.replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function extractSections(text) {
  const normalized = normalizeText(text);
  const sections = {};

  Object.entries(SECTION_PATTERNS).forEach(([name, pattern]) => {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      sections[name] = match[1].trim();
    }
  });

  return sections;
}

function extractSkills(text) {
  const normalized = normalizeText(text).toLowerCase();
  const detected = new Set();

  COMMON_SKILLS.forEach((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    if (regex.test(normalized)) {
      detected.add(skill);
    }
  });

  return Array.from(detected).sort();
}

async function parseResumeFile(filePath, mimeType) {
  const buffer = fs.readFileSync(filePath);
  let text;

  if (mimeType === 'application/pdf' || filePath.toLowerCase().endsWith('.pdf')) {
    const parsed = await pdfParse(buffer);
    text = parsed.text;
  } else {
    text = buffer.toString('utf8');
  }

  const normalizedText = normalizeText(text);

  return {
    text: normalizedText,
    skills: extractSkills(normalizedText),
    sections: extractSections(normalizedText),
  };
}

module.exports = {
  normalizeText,
  extractSections,
  extractSkills,
  parseResumeFile,
};
