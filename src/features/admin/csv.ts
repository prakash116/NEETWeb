import Papa from 'papaparse';
import type { QuestionPayload } from '@/features/questions/api';
import type { AnswerOption, QuestionDifficulty } from '@/types/entities';

export const CSV_HEADERS = [
  'topic',
  'question',
  'optionA',
  'optionB',
  'optionC',
  'optionD',
  'correctAnswer',
  'explanation',
  'difficulty',
  'marks',
  'negativeMarks',
] as const;

const TEMPLATE_ROWS: string[][] = [
  [
    'Motion in a Straight Line',
    'A car accelerates uniformly from rest to 20 m/s in 5 s. Its acceleration is',
    '2 m/s^2',
    '4 m/s^2',
    '5 m/s^2',
    '10 m/s^2',
    'B',
    'a = (v - u)/t = 20/5 = 4 m/s^2.',
    'easy',
    '4',
    '1',
  ],
  [
    '',
    'This row uses the default topic selected in the import dialog',
    'Option A',
    'Option B',
    'Option C',
    'Option D',
    'A',
    '',
    'medium',
    '',
    '',
  ],
];

export function downloadCsvTemplate(): void {
  const csv = Papa.unparse({ fields: [...CSV_HEADERS], data: TEMPLATE_ROWS });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'neetexam-questions-template.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export const MAX_IMPORT_ROWS = 500;

export interface CsvQuestionRow {
  /** 1-based CSV line number (header is line 1). */
  row: number;
  payload?: QuestionPayload;
  error?: string;
}

export function parseQuestionsCsv(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (result) => resolve(result.data),
      error: (error) => reject(error),
    });
  });
}

const DIFFICULTIES: QuestionDifficulty[] = ['easy', 'medium', 'hard'];
const ANSWERS: AnswerOption[] = ['A', 'B', 'C', 'D'];

interface MapContext {
  subjectId: string;
  /** lower-cased active topic name → ids (for ambiguity detection). */
  topicsByName: Map<string, string[]>;
  defaultTopicId?: string;
}

export function mapRowsToPayloads(
  rows: Record<string, string>[],
  context: MapContext,
): CsvQuestionRow[] {
  return rows.map((raw, index) => {
    const rowNumber = index + 2; // header occupies line 1
    const get = (key: string) => (raw[key] ?? '').trim();

    const fail = (error: string): CsvQuestionRow => ({ row: rowNumber, error });

    let topicId = context.defaultTopicId;
    const topicName = get('topic');
    if (topicName) {
      const matches = context.topicsByName.get(topicName.toLowerCase());
      if (!matches || matches.length === 0) return fail(`Unknown topic "${topicName}"`);
      if (matches.length > 1) return fail(`Topic name "${topicName}" is ambiguous`);
      topicId = matches[0];
    }
    if (!topicId) return fail('No topic given and no default topic selected');

    const question = get('question');
    if (question.length < 3) return fail('Question text is required (min 3 characters)');
    if (question.length > 5000) return fail('Question text exceeds 5000 characters');

    const options = ANSWERS.map((key) => ({ key, text: get(`option${key}`) }));
    const missing = options.filter((option) => option.text.length === 0);
    if (missing.length > 0) {
      return fail(`Missing option ${missing.map((option) => option.key).join(', ')}`);
    }

    const correctAnswer = get('correctAnswer').toUpperCase() as AnswerOption;
    if (!ANSWERS.includes(correctAnswer)) {
      return fail('correctAnswer must be A, B, C, or D');
    }

    const difficultyRaw = get('difficulty').toLowerCase();
    const difficulty = (difficultyRaw || 'medium') as QuestionDifficulty;
    if (!DIFFICULTIES.includes(difficulty)) {
      return fail('difficulty must be easy, medium, or hard');
    }

    const parseNumber = (
      key: string,
      min: number,
      max: number,
    ): number | undefined | 'invalid' => {
      const value = get(key);
      if (value === '') return undefined;
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed < min || parsed > max) return 'invalid';
      return parsed;
    };
    const marks = parseNumber('marks', 0.01, 100);
    if (marks === 'invalid') return fail('marks must be between 0.01 and 100');
    const negativeMarks = parseNumber('negativeMarks', 0, 100);
    if (negativeMarks === 'invalid') return fail('negativeMarks must be between 0 and 100');

    const explanation = get('explanation');

    return {
      row: rowNumber,
      payload: {
        subjectId: context.subjectId,
        topicId,
        difficulty,
        question,
        options,
        correctAnswer,
        explanation: explanation || undefined,
        marks,
        negativeMarks,
      },
    };
  });
}
