const { z } = require('zod');

const offreCreateSchema = z.object({
  titre: z.string().min(1),
  description: z.string().min(1),
  typeContrat: z.string().min(1),
  salaire: z.coerce.number().min(0),
  localisation: z.string().min(1),
  statut: z.string().min(1),
  competences: z.string().min(1).optional(),
  experienceDemandee: z.coerce.number().int().min(0).optional()
});

const offreUpdateSchema = offreCreateSchema.partial();

module.exports = { offreCreateSchema, offreUpdateSchema };
