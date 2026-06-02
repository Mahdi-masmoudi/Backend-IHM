const { z } = require('zod');

const candidatUpdateSchema = z
  .object({
    adresse: z.string().optional().or(z.literal('')),
    dateNaissance: z.string().optional().or(z.literal('')),
    niveauEtude: z.string().optional().or(z.literal('')),
    experience: z.coerce.number().int().min(0).optional(),
    competences: z.array(z.string()).optional(),
    langues: z.array(z.string()).optional(),
    experienceDescription: z.string().optional().or(z.literal(''))
  })
  .partial();

const lettreSchema = z.object({
  contenu: z.string().min(1)
});

module.exports = { candidatUpdateSchema, lettreSchema };
