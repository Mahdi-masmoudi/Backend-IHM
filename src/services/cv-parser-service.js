const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * CV Parser Service
 * Extracts structured data from PDF and DOCX CVs using regex and NLP patterns.
 */

// ── Extraction helpers ──────────────────────────────────────────────

const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[\w.-]+/gi;
const PHONE_REGEX = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}(?:[\s.-]?\d{2,4})?/g;
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+\/?/gi;
const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+\/?/gi;
const PORTFOLIO_REGEX = /(?:portfolio|site\s*web|website)\s*[:=]?\s*(https?:\/\/[\w./?&=%-]+)/gi;

const EDUCATION_LEVELS = [
  { pattern: /doctorat|phd|ph\.d/i, level: 'Doctorat' },
  { pattern: /master|mast[eè]re|m2|m1|bac\s*\+?\s*5/i, level: 'Master (Bac+5)' },
  { pattern: /ing[ée]nieur|engineering/i, level: 'Ingénieur (Bac+5)' },
  { pattern: /licence|bachelor|bac\s*\+?\s*3/i, level: 'Licence (Bac+3)' },
  { pattern: /bts|dut|deug|bac\s*\+?\s*2/i, level: 'Bac+2' },
  { pattern: /baccalaur[ée]at|bac(?:\s|$)/i, level: 'Baccalauréat' }
];

const COMPETENCE_KEYWORDS = [
  // Programming
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C\\+\\+', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
  // Frontend
  'Angular', 'React', 'Vue\\.js', 'Next\\.js', 'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
  // Backend
  'Node\\.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'ASP\\.NET',
  // Data
  'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'Firebase',
  // DevOps
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins', 'Git',
  // Design
  'Figma', 'Adobe XD', 'Photoshop', 'Illustrator',
  // Management
  'Agile', 'Scrum', 'Jira', 'Kanban',
  // Langues
  'Français', 'Anglais', 'Arabe', 'Espagnol', 'Allemand', 'Italien'
];

const SECTION_HEADERS = {
  experience: /(?:exp[ée]riences?\s*(?:professionnelles?)?|work\s*experience|professional\s*experience|employment)/i,
  education: /(?:formations?|[ée]ducation|[ée]tudes|education|academic|dipl[oô]mes?)/i,
  skills: /(?:comp[ée]tences?|skills?|technologies?|outils?|tools?)/i,
  languages: /(?:langues?|languages?)/i,
  certifications: /(?:certifications?|certificates?)/i,
  projects: /(?:projets?|projects?)/i
};

// ── Text extraction ─────────────────────────────────────────────────

async function extractTextFromPdf(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function extractTextFromDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') {
    return extractTextFromPdf(filePath);
  }
  if (ext === '.docx') {
    return extractTextFromDocx(filePath);
  }
  throw new Error(`Unsupported file format: ${ext}`);
}

// ── Field extraction ────────────────────────────────────────────────

function extractEmail(text) {
  const matches = text.match(EMAIL_REGEX);
  return matches ? matches[0] : '';
}

function extractPhone(text) {
  const matches = text.match(PHONE_REGEX);
  if (!matches) return '';
  // Return longest match (most likely a full number)
  return matches.sort((a, b) => b.length - a.length)[0].trim();
}

function extractLinkedin(text) {
  const matches = text.match(LINKEDIN_REGEX);
  return matches ? matches[0] : '';
}

function extractGithub(text) {
  const matches = text.match(GITHUB_REGEX);
  return matches ? matches[0] : '';
}

function extractPortfolio(text) {
  const matches = PORTFOLIO_REGEX.exec(text);
  return matches ? matches[1] : '';
}

function extractName(text) {
  // Try to extract name from the first few lines
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let nom = '';
  let prenom = '';

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Skip lines that look like headers, emails, phones, addresses
    if (EMAIL_REGEX.test(line) || PHONE_REGEX.test(line)) continue;
    if (/^(curriculum|cv|resume|profil)/i.test(line)) continue;
    if (line.length > 50) continue;

    // A name line is typically 2-4 words, all alphabetic
    const words = line.split(/\s+/).filter((w) => /^[A-ZÀ-ÿa-z'-]+$/.test(w));
    if (words.length >= 2 && words.length <= 4) {
      prenom = words[0];
      nom = words.slice(1).join(' ');
      break;
    }
  }

  return { nom, prenom };
}

function extractAddress(text) {
  // Look for address patterns (street number + city)
  const addressPatterns = [
    /(?:adresse|address)\s*[:=]?\s*(.+)/i,
    /(\d+[\s,]+(?:rue|avenue|boulevard|bd|av|allée|chemin|place|impasse).+)/i
  ];

  for (const pattern of addressPatterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[1].trim().substring(0, 200);
    }
  }
  return '';
}

function extractEducationLevel(text) {
  for (const { pattern, level } of EDUCATION_LEVELS) {
    if (pattern.test(text)) {
      return level;
    }
  }
  return '';
}

function extractCompetences(text) {
  const found = new Set();
  const textLower = text.toLowerCase();

  for (const keyword of COMPETENCE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (regex.test(text) || regex.test(textLower)) {
      // Use original case from keyword list
      found.add(keyword.replace(/\\\./g, '.').replace(/\\\+/g, '+'));
    }
  }

  return Array.from(found);
}

function extractExperienceYears(text) {
  const patterns = [
    /(\d+)\s*(?:ans?|years?)\s*(?:d['']exp[ée]rience|of\s*experience)/i,
    /exp[ée]rience\s*[:=]?\s*(\d+)\s*(?:ans?|years?)/i
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return 0;
}

function extractLanguages(text) {
  const langPatterns = [
    { regex: /fran[çc]ais/i, name: 'Français' },
    { regex: /anglais|english/i, name: 'Anglais' },
    { regex: /arabe|arabic/i, name: 'Arabe' },
    { regex: /espagnol|spanish/i, name: 'Espagnol' },
    { regex: /allemand|german/i, name: 'Allemand' },
    { regex: /italien|italian/i, name: 'Italien' },
    { regex: /chinois|chinese|mandarin/i, name: 'Chinois' },
    { regex: /portugais|portuguese/i, name: 'Portugais' }
  ];

  const found = [];
  for (const { regex, name } of langPatterns) {
    if (regex.test(text)) {
      found.push(name);
    }
  }
  return found;
}

function extractSections(text) {
  const lines = text.split('\n');
  const sections = {};
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let foundSection = null;
    for (const [key, regex] of Object.entries(SECTION_HEADERS)) {
      if (regex.test(trimmed) && trimmed.length < 60) {
        foundSection = key;
        break;
      }
    }

    if (foundSection) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n');
      }
      currentSection = foundSection;
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(trimmed);
    }
  }

  if (currentSection) {
    sections[currentSection] = currentContent.join('\n');
  }

  return sections;
}

function extractExperiences(sections) {
  if (!sections.experience) return [];
  const lines = sections.experience.split('\n').filter(Boolean);
  const experiences = [];
  let current = null;

  for (const line of lines) {
    // Check if it's a date/period line
    const dateMatch = line.match(/(\d{4})\s*[-–à]\s*(\d{4}|pr[ée]sent|actuel|current)/i);
    if (dateMatch || /^\d{2}\/\d{4}/.test(line)) {
      if (current) experiences.push(current);
      current = { period: line.trim(), description: '' };
    } else if (current) {
      current.description += (current.description ? ' ' : '') + line.trim();
    }
  }
  if (current) experiences.push(current);
  return experiences.slice(0, 10);
}

function extractFormations(sections) {
  if (!sections.education) return [];
  const lines = sections.education.split('\n').filter(Boolean);
  const formations = [];
  let current = null;

  for (const line of lines) {
    const dateMatch = line.match(/(\d{4})\s*[-–à]\s*(\d{4}|pr[ée]sent|actuel|current)/i);
    const yearMatch = line.match(/\b(20\d{2}|19\d{2})\b/);
    if (dateMatch || yearMatch) {
      if (current) formations.push(current);
      current = { period: line.trim(), description: '' };
    } else if (current) {
      current.description += (current.description ? ' ' : '') + line.trim();
    }
  }
  if (current) formations.push(current);
  return formations.slice(0, 10);
}

function extractCertifications(sections) {
  if (!sections.certifications) return [];
  return sections.certifications
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 10);
}

// ── Score calculation ───────────────────────────────────────────────

function calculateExtractionScore(data) {
  let score = 0;
  const weights = {
    nom: 10,
    prenom: 10,
    email: 15,
    telephone: 10,
    adresse: 5,
    competences: 15,
    experience: 10,
    niveauEtude: 10,
    linkedin: 5,
    formations: 5,
    experiences: 5
  };

  if (data.nom) score += weights.nom;
  if (data.prenom) score += weights.prenom;
  if (data.email) score += weights.email;
  if (data.telephone) score += weights.telephone;
  if (data.adresse) score += weights.adresse;
  if (data.competences && data.competences.length > 0) score += weights.competences;
  if (data.experience > 0) score += weights.experience;
  if (data.niveauEtude) score += weights.niveauEtude;
  if (data.linkedin) score += weights.linkedin;
  if (data.formations && data.formations.length > 0) score += weights.formations;
  if (data.experiences && data.experiences.length > 0) score += weights.experiences;

  return score;
}

// ── Main parse function ─────────────────────────────────────────────

async function parseCv(filePath) {
  const text = await extractText(filePath);
  const sections = extractSections(text);
  const { nom, prenom } = extractName(text);

  const data = {
    nom,
    prenom,
    email: extractEmail(text),
    telephone: extractPhone(text),
    adresse: extractAddress(text),
    competences: extractCompetences(text),
    experience: extractExperienceYears(text),
    niveauEtude: extractEducationLevel(text),
    langues: extractLanguages(text),
    linkedin: extractLinkedin(text),
    github: extractGithub(text),
    portfolio: extractPortfolio(text),
    experiences: extractExperiences(sections),
    formations: extractFormations(sections),
    certifications: extractCertifications(sections)
  };

  const scoreExtraction = calculateExtractionScore(data);

  return {
    success: true,
    data,
    scoreExtraction
  };
}

module.exports = { parseCv };
