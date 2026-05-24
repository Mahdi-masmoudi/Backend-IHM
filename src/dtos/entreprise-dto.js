const { z } = require('zod');

const entrepriseUpdateSchema = z
  .object({
    nomEntreprise: z.string().min(1),
    adresseEntreprise: z.string().min(1),
    secteurActivite: z.string().min(1),
    description: z.string().min(1),
    logo: z.string().min(1)
  })
  .partial();

module.exports = { entrepriseUpdateSchema };
