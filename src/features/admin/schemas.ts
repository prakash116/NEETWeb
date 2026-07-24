import { z } from 'zod';

/** Mirrors `CreateSubjectDto` (code is uppercased before submit). */
export const subjectSchema = z.object({
  name: z.string().trim().min(2, 'At least 2 characters').max(100),
  code: z
    .string()
    .trim()
    .regex(/^[A-Za-z][A-Za-z0-9_-]{1,19}$/, '2–20 chars, starts with a letter (letters, numbers, _ or -)'),
  description: z.string().trim().max(1000),
  preparationTrackIds: z
    .array(z.string().min(1))
    .min(1, 'Select at least one preparation path'),
  status: z.enum(['active', 'inactive']),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;

/** Mirrors `CreateTopicDto` / `UpdateTopicDto` (order kept as string for the input). */
export const topicSchema = z.object({
  topicName: z.string().trim().min(2, 'At least 2 characters').max(150),
  description: z.string().trim().max(1500),
  studyContent: z
    .string()
    .max(100_000, 'Study text cannot exceed 100,000 characters'),
  preparationTrackIds: z
    .array(z.string().min(1))
    .min(1, 'Select at least one preparation path'),
  order: z
    .string()
    .regex(/^\d*$/, 'Numbers only')
    .refine((value) => value === '' || Number(value) <= 100000, 'Too large'),
  status: z.enum(['active', 'inactive']),
});

export type TopicFormValues = z.infer<typeof topicSchema>;

/** Mirrors `CreatePreparationTrackDto`. */
export const trackSchema = z.object({
  title: z.string().trim().min(2, 'At least 2 characters').max(100),
  shortTitle: z.string().trim().min(2, 'At least 2 characters').max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers, and single hyphens'),
  eyebrow: z.string().trim().max(80),
  description: z.string().trim().max(1000),
  focus: z.string().trim().max(300),
  icon: z.string().trim().max(500),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Hex color, e.g. #2563eb'),
  tint: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Hex color, e.g. #eff6ff'),
  order: z.string().regex(/^\d*$/, 'Numbers only'),
  status: z.enum(['active', 'inactive']),
});

export type TrackFormValues = z.infer<typeof trackSchema>;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const optionField = z.string().trim().min(1, 'Required').max(2000);

const decimalField = (min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || (/^\d*\.?\d{0,2}$/.test(value) && Number(value) >= min && Number(value) <= max), {
      message: `Must be between ${min} and ${max}`,
    });

const requiredDecimal = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, 'Required')
    .refine(
      (value) => /^\d*\.?\d{0,2}$/.test(value) && Number(value) >= min && Number(value) <= max,
      { message: `Must be between ${min} and ${max}` },
    );

const requiredInt = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, 'Required')
    .refine((value) => /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max, {
      message: `Whole number between ${min} and ${max}`,
    });

/** Mirrors `CreateExamDto`; numbers stay strings for the inputs. */
export const examSchema = z.object({
  examName: z.string().trim().min(3, 'At least 3 characters').max(160),
  examCode: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9_-]{0,29}$/,
      '1–30 chars: letters, numbers, _ or - (no spaces)',
    ),
  subjectId: z.string().min(1, 'Select a subject'),
  topicIds: z.array(z.string()).min(1, 'Pick at least one topic'),
  totalQuestions: requiredInt(1, 200),
  marksPerQuestion: requiredDecimal(0.01, 100),
  negativeMarks: requiredDecimal(0, 100),
  questionTime: requiredInt(1, 60),
  passingMarks: requiredDecimal(0, 20000),
  instructions: z.string().trim().min(1, 'Required').max(5000),
});

export type ExamFormValues = z.infer<typeof examSchema>;

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
