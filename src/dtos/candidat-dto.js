const { z } = require('zod');

const candidatUpdateSchema = z
  .object({
    adresse: z.string().min(1),
    dateNaissance: z.string().min(1),
    niveauEtude: z.string().min(1),
    experience: z.coerce.number().int().min(0)
  })
  .partial();

const lettreSchema = z.object({
  contenu: z.string().min(1)
});

module.exports = { candidatUpdateSchema, lettreSchema };
