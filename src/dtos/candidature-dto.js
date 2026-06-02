const { z } = require('zod');

const candidatureCreateSchema = z.object({
  offreId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de l\'offre invalide'),
  cvId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID du CV invalide'),
  lettreId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de la lettre invalide'),
  commentaire: z.string().optional()
});

module.exports = { candidatureCreateSchema };
