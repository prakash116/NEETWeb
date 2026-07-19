import { z } from 'zod';

/** Mirrors `CreateSubjectDto` (code is uppercased before submit). */
export const subjectSchema = z.object({
  name: z.string().trim().min(2, 'At least 2 characters').max(100),
  code: z
    .string()
    .trim()
    .regex(/^[A-Za-z][A-Za-z0-9_-]{1,19}$/, '2–20 chars, starts with a letter (letters, numbers, _ or -)'),
  description: z.string().trim().max(1000),
  status: z.enum(['active', 'inactive']),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;

/** Mirrors `CreateTopicDto` / `UpdateTopicDto` (order kept as string for the input). */
export const topicSchema = z.object({
  topicName: z.string().trim().min(2, 'At least 2 characters').max(150),
  description: z.string().trim().max(1500),
  order: z
    .string()
    .regex(/^\d*$/, 'Numbers only')
    .refine((value) => value === '' || Number(value) <= 100000, 'Too large'),
  status: z.enum(['active', 'inactive']),
});

export type TopicFormValues = z.infer<typeof topicSchema>;

const optionField = z.string().trim().min(1, 'Required').max(2000);

const decimalField = (min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || (/^\d*\.?\d{0,2}$/.test(value) && Number(value) >= min && Number(value) <= max), {
      message: `Must be between ${min} and ${max}`,
    });

/** Mirrors `CreateQuestionDto`; numbers stay strings for the inputs. */
export const questionSchema = z.object({
  subjectId: z.string().min(1, 'Select a subject'),
  topicId: z.string().min(1, 'Select a topic'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  question: z.string().trim().min(3, 'At least 3 characters').max(5000),
  optionA: optionField,
  optionB: optionField,
  optionC: optionField,
  optionD: optionField,
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().trim().max(5000),
  marks: decimalField(0.01, 100),
  negativeMarks: decimalField(0, 100),
  status: z.enum(['active', 'inactive', 'archived']),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;
