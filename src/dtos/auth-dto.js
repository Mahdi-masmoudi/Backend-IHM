const { z } = require('zod');
const { Roles } = require('../config/roles');

const baseUserSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().optional().or(z.literal('')),
  email: z.string().email(),
  motDePasse: z.string().min(8),
  telephone: z.string().optional().or(z.literal(''))
});

const candidatRegisterSchema = baseUserSchema.extend({
  role: z.literal(Roles.CANDIDAT),
  adresse: z.string().optional().or(z.literal('')),
  dateNaissance: z.string().optional().or(z.literal('')),
  niveauEtude: z.string().optional().or(z.literal('')),
  experience: z.coerce.number().int().min(0).optional().default(0),
  competences: z.array(z.string()).optional(),
  langues: z.array(z.string()).optional(),
  experienceDescription: z.string().optional().or(z.literal(''))
});

const entrepriseRegisterSchema = baseUserSchema.extend({
  role: z.literal(Roles.ENTREPRISE),
  nomEntreprise: z.string().min(1),
  adresseEntreprise: z.string().optional().or(z.literal('')),
  secteurActivite: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  logo: z.string().optional().or(z.literal(''))
});

const candidatRegisterSchemaNoRole = baseUserSchema.extend({
  adresse: z.string().optional().or(z.literal('')),
  dateNaissance: z.string().optional().or(z.literal('')),
  niveauEtude: z.string().optional().or(z.literal('')),
  experience: z.coerce.number().int().min(0).optional().default(0),
  competences: z.array(z.string()).optional(),
  langues: z.array(z.string()).optional(),
  experienceDescription: z.string().optional().or(z.literal(''))
});

const entrepriseRegisterSchemaNoRole = baseUserSchema.extend({
  nomEntreprise: z.string().min(1),
  adresseEntreprise: z.string().optional().or(z.literal('')),
  secteurActivite: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  logo: z.string().optional().or(z.literal(''))
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
