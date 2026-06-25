function calculateScore(candidat, offre) {
  let score = 0;

  // Score from experience (Max 50 points)
  const experienceDemandee = offre.experienceDemandee || 0;
  const experienceCandidat = candidat.experience || 0;
  
  if (experienceDemandee > 0) {
    if (experienceCandidat >= experienceDemandee) {
      score += 50;
    } else {
      score += Math.round((experienceCandidat / experienceDemandee) * 50);
    }
  } else {
    score += 50;
  }

  // Score from competences (Max 50 points)
  const offreCompetencesStr = offre.competences ? offre.competences.toLowerCase() : '';
  // Split by commas, or if no commas, split by spaces, or just check substring
  // We'll split by commas or newlines and trim
  const offreCompetences = offreCompetencesStr.split(/[,;\n]/).map(c => c.trim()).filter(c => c.length > 0);
  
  if (offreCompetences.length > 0) {
    const candidatCompetences = (candidat.competences || []).map(c => c.toLowerCase().trim());
    const expDesc = (candidat.experienceDescription || '').toLowerCase();
    let matchCount = 0;
    
    for (const comp of offreCompetences) {
      const compLower = comp.toLowerCase();
      const inArray = candidatCompetences.some(c => c.includes(compLower) || compLower.includes(c));
      const inDesc = expDesc.includes(compLower);
      
      if (inArray || inDesc) {
        matchCount++;
      }
    }
    
    score += Math.round((matchCount / offreCompetences.length) * 50);
  } else {
    score += 50;
  }

  return Math.min(score, 100);
}

module.exports = { calculateScore };
