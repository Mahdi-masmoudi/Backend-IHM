const { z } = require('zod');

const candidatureCreateSchema = z.object({
  offreId: z.coerce.number().int().positive(),
  cvId: z.coerce.number().int().positive(),
  lettreId: z.coerce.number().int().positive(),
  commentaire: z.string().optional()
});

module.exports = { candidatureCreateSchema };
