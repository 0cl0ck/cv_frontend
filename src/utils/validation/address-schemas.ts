/**
 * Schémas de validation spécifiques aux adresses
 */

import { z } from 'zod';

// Constantes pour les regex
const FRENCH_POSTAL_CODE_REGEX = /^(?:0[1-9]|[1-8]\d|9[0-8])\d{3}$/;
const BELGIAN_POSTAL_CODE_REGEX = /^[1-9]\d{3}$/;
const SWISS_POSTAL_CODE_REGEX = /^\d{4}$/;
const LUXEMBOURG_POSTAL_CODE_REGEX = /^L-\d{4}$/;

// Constantes pour les validations de téléphone par pays
const PHONE_REGEX_MAP = {
  France: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  Belgique: /^(?:(?:\+|00)32|0)(?:\s*[1-69](?:\s*\d{2}){4}|\s*7[0-9](?:\s*\d{2}){3}|\s*[23](?:\s*\d{2}){3})$/,
  Suisse: /^(?:(?:\+|00)41|0)(?:\s*[1-9]\d{1}(?:\s*\d{3}){2})$/,
  Luxembourg: /^(?:(?:\+|00)352|0)(?:\s*\d{2}(?:\s*\d{2}){3})$/,
};

// Regex de base pour les téléphones (fallback générique)
const GENERIC_PHONE_REGEX = /^\+?[0-9\s.-]{8,15}$/;

// Schéma pour le type d'adresse
export const addressTypeSchema = z.enum(['shipping', 'billing', 'both'], {
  errorMap: () => ({ message: 'Le type d\'adresse doit être "shipping", "billing" ou "both"' })
});

// Schéma du code postal avec validation dynamique selon le pays
export const postalCodeSchema = z.string()
  .min(4, 'Le code postal est trop court')
  .max(10, 'Le code postal est trop long')
  .superRefine((val, ctx) => {
    const country = ctx.path?.length ? (ctx.path[0] as { country?: string })?.country || '' : '';
    
    let isValid = true;
    
    if (country.includes('France')) {
      isValid = FRENCH_POSTAL_CODE_REGEX.test(val);
    } else if (country.includes('Belgique')) {
      isValid = BELGIAN_POSTAL_CODE_REGEX.test(val);
    } else if (country.includes('Suisse')) {
      isValid = SWISS_POSTAL_CODE_REGEX.test(val);
    } else if (country.includes('Luxembourg')) {
      isValid = LUXEMBOURG_POSTAL_CODE_REGEX.test(val);
    } else {
      // Par défaut, accepter les codes postaux non vides
      isValid = val.trim().length > 0;
    }
    
    if (!isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Format de code postal invalide pour le pays sélectionné'
      });
    }
  });

// Schéma du numéro de téléphone avec validation dynamique selon le pays
export const phoneSchema = z.string()
  .min(8, 'Le numéro de téléphone est trop court')
  .max(20, 'Le numéro de téléphone est trop long')
  .superRefine((val, ctx) => {
    const country = ctx.path?.length ? (ctx.path[0] as { country?: string })?.country || '' : '';
    
    let isValid = true;
    
    if (country.includes('France') && PHONE_REGEX_MAP.France) {
      isValid = PHONE_REGEX_MAP.France.test(val);
    } else if (country.includes('Belgique') && PHONE_REGEX_MAP.Belgique) {
      isValid = PHONE_REGEX_MAP.Belgique.test(val);
    } else if (country.includes('Suisse') && PHONE_REGEX_MAP.Suisse) {
      isValid = PHONE_REGEX_MAP.Suisse.test(val);
    } else if (country.includes('Luxembourg') && PHONE_REGEX_MAP.Luxembourg) {
      isValid = PHONE_REGEX_MAP.Luxembourg.test(val);
    } else {
      // Par défaut, utiliser une validation générique
      isValid = GENERIC_PHONE_REGEX.test(val);
    }
    
    if (!isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Format de numéro de téléphone invalide pour le pays sélectionné'
      });
    }
  });

// Schéma complet d'une adresse
export const addressSchema = z.object({
  id: z.string().optional(),
  type: addressTypeSchema,
  name: z.string()
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom est trop long')
    .refine(val => /^[a-zA-ZÀ-ÿ0-9\s'-]+$/.test(val), {
      message: 'Le nom contient des caractères non autorisés'
    }),
  line1: z.string()
    .min(3, 'L\'adresse est trop courte')
    .max(100, 'L\'adresse est trop longue')
    .refine(val => /^[a-zA-ZÀ-ÿ0-9\s,'.-]+$/.test(val), {
      message: 'L\'adresse contient des caractères non autorisés'
    }),
  line2: z.string()
    .max(100, 'L\'adresse complémentaire est trop longue')
    .refine(val => !val || /^[a-zA-ZÀ-ÿ0-9\s,'.-]+$/.test(val), {
      message: 'L\'adresse complémentaire contient des caractères non autorisés'
    })
    .optional(),
  city: z.string()
    .min(2, 'Le nom de la ville est trop court')
    .max(50, 'Le nom de la ville est trop long')
    .refine(val => /^[a-zA-ZÀ-ÿ\s'-]+$/.test(val), {
      message: 'Le nom de la ville contient des caractères non autorisés'
    }),
  state: z.string()
    .max(50, 'Le nom de la région/département est trop long')
    .refine(val => !val || /^[a-zA-ZÀ-ÿ0-9\s'-]+$/.test(val), {
      message: 'Le nom de la région/département contient des caractères non autorisés'
    })
    .optional(),
  postalCode: postalCodeSchema,
  country: z.string()
    .min(2, 'Le pays est requis')
    .max(56, 'Le nom du pays est trop long')
    .refine(val => /^[a-zA-ZÀ-ÿ\s'-]+$/.test(val), {
      message: 'Le nom du pays contient des caractères non autorisés'
    }),
  phone: phoneSchema,
  isDefault: z.boolean().default(false)
});

// Schéma pour mettre à jour les adresses d'un utilisateur
export const userAddressesSchema = z.object({
  addresses: z.array(addressSchema)
});
