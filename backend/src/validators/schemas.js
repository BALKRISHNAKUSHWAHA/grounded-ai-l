import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const projectSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  domain: z.string().min(2),
});

export const chatSchema = z.object({
  message: z.string().min(1),
});

export const sourceTextSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  authors: z.string().optional(),
  publication_year: z.number().optional(),
});

export const sourceUrlSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  authors: z.string().optional(),
  publication_year: z.number().optional(),
});

export const synthesisSchema = z.object({
  title: z.string().min(1),
  source_ids: z.array(z.string().uuid()).min(2),
});

export const exportSchema = z.object({
  format: z.enum(['markdown', 'json', 'bibtex']),
  include_sources: z.boolean().optional().default(true),
  include_synthesis: z.boolean().optional().default(true),
});
