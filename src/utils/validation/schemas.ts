/**
 * Schémas de validation centralisés pour Chanvre Vert
 * 
 * Ce fichier contient tous les schémas Zod réutilisables pour valider
 * les entrées utilisateurs dans l'application.
 */

import { z } from 'zod';

// Regex couramment utilisés
const POSTAL_CODE_REGEX = /^(?:(?:0[1-9]|[1-8]\d|9[0-8])\d{3}|[1-9]\d{3})$/; // Format code postal français ou belge
const PHONE_REGEX = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/; // Format téléphone français
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Schémas de base
export const emailSchema = z.string()
  .email('Format d\'email invalide')
  .min(5, 'L\'email est trop court')
  .max(100, 'L\'email est trop long');

export const passwordSchema = z.string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(100, 'Le mot de passe est trop long')
  .regex(
    PASSWORD_REGEX,
    'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial'
  );

export const nameSchema = z.string()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(50, 'Le nom est trop long')
  .refine(name => /^[a-zA-ZÀ-ÿ\s'-]+$/.test(name), {
    message: 'Le nom contient des caractères non autorisés'
  });

// Schémas d'adresse
export const postalCodeSchema = z.string()
  .regex(POSTAL_CODE_REGEX, 'Format de code postal invalide');

export const phoneSchema = z.string()
  .regex(PHONE_REGEX, 'Format de numéro de téléphone invalide');

export const addressSchema = z.object({
  line1: z.string().min(3, 'L\'adresse est trop courte').max(100, 'L\'adresse est trop longue'),
  line2: z.string().max(100, 'L\'adresse est trop longue').optional(),
  city: z.string().min(2, 'Le nom de la ville est trop court').max(50, 'Le nom de la ville est trop long'),
  postalCode: postalCodeSchema,
  country: z.string().min(2, 'Le pays est requis'),
  phone: phoneSchema.optional()
});

// Schémas d'authentification
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  collection: z.enum(['customers', 'admins'], {
    errorMap: () => ({ message: 'Collection doit être "customers" ou "admins"' })
  })
});

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  gdprConsent: z.object({
    newsletterAccepted: z.boolean().optional(),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: 'Vous devez accepter les conditions générales' })
    }),
    privacyAccepted: z.literal(true, {
      errorMap: () => ({ message: 'Vous devez accepter la politique de confidentialité' })
    })
  })
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  passwordConfirm: z.string().min(8, 'La confirmation du mot de passe est requise'),
  token: z.string().min(10, 'Token invalide')
}).refine(data => data.password === data.passwordConfirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['passwordConfirm']
});

// Schémas pour les avis
export const reviewSchema = z.object({
  productId: z.string().min(1, 'L\'identifiant du produit est requis'),
  rating: z.number().int().min(1, 'La note minimale est 1').max(5, 'La note maximale est 5'),
  reviewTitle: z.string().max(100, 'Le titre est trop long').optional(),
  reviewContent: z.string().min(1, 'Le contenu de l\'avis est requis').max(1000, 'L\'avis est trop long')
});

// Schémas de contact
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  message: z.string().min(10, 'Le message est trop court').max(2000, 'Le message est trop long')
});

// Validation des IDs
export const idSchema = z.string().min(1, 'L\'identifiant est requis');

// Schémas pour les paiements
export const paymentSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  currency: z.string().length(3, 'Le code de devise doit contenir 3 caractères'),
  orderId: z.string().min(1, 'L\'identifiant de commande est requis'),
  billingAddress: addressSchema,
  shippingAddress: addressSchema
});
