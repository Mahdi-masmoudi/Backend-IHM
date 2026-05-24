const { z } = require('zod');
const { Roles } = require('../config/roles');

const baseUserSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  email: z.string().email(),
  motDePasse: z.string().min(8),
  telephone: z.string().min(6)
});

const candidatRegisterSchema = baseUserSchema.extend({
  role: z.literal(Roles.CANDIDAT),
  adresse: z.string().min(1),
  dateNaissance: z.string().min(1),
  niveauEtude: z.string().min(1),
  experience: z.coerce.number().int().min(0)
});

const entrepriseRegisterSchema = baseUserSchema.extend({
  role: z.literal(Roles.ENTREPRISE),
  nomEntreprise: z.string().min(1),
  adresseEntreprise: z.string().min(1),
  secteurActivite: z.string().min(1),
  description: z.string().min(1),
  logo: z.string().min(1).optional()
});

const candidatRegisterSchemaNoRole = baseUserSchema.extend({
  adresse: z.string().min(1),
  dateNaissance: z.string().min(1),
  niveauEtude: z.string().min(1),
  experience: z.coerce.number().int().min(0)
});

const entrepriseRegisterSchemaNoRole = baseUserSchema.extend({
  nomEntreprise: z.string().min(1),
  adresseEntreprise: z.string().min(1),
  secteurActivite: z.string().min(1),
  description: z.string().min(1),
  logo: z.string().min(1).optional()
});

const registerSchema = z.discriminatedUnion('role', [candidatRegisterSchema, entrepriseRegisterSchema]);

const loginSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(8)
});

module.exports = {
  registerSchema,
  loginSchema,
  candidatRegisterSchema,
  entrepriseRegisterSchema,
  candidatRegisterSchemaNoRole,
  entrepriseRegisterSchemaNoRole
};
