'use client';

import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Download, FileUp, Loader2, TriangleAlert } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createQuestion } from '@/features/questions/api';
import { ApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Subject } from '@/types/entities';
import {
  downloadCsvTemplate,
  mapRowsToPayloads,
  parseQuestionsCsv,
  MAX_IMPORT_ROWS,
  type CsvQuestionRow,
} from '../csv';
import { useTopicTree } from '../hooks';
import { flattenTopics, topicIndentLabel } from '../topic-utils';

type Phase = 'setup' | 'review' | 'running' | 'done';

interface RowFailure {
  row: number;
  message: string;
}

export function QuestionImportDialog({
  open,
  onOpenChange,
  subjects,
  defaultSubjectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  defaultSubjectId?: string;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Derived: follows the page's subject filter until the admin picks one here.
  const [pickedSubjectId, setPickedSubjectId] = useState<string | null>(null);
  const subjectId = pickedSubjectId ?? defaultSubjectId ?? '';
  const [defaultTopicId, setDefaultTopicId] = useState('');
  const [fileName, setFileName] = useState('');
  const [phase, setPhase] = useState<Phase>('setup');
  const [rows, setRows] = useState<CsvQuestionRow[]>([]);
  const [done, setDone] = useState(0);
  const [imported, setImported] = useState(0);
  const [failures, setFailures] = useState<RowFailure[]>([]);

  const treeQuery = useTopicTree(open && subjectId ? subjectId : null);
  const topics = flattenTopics(treeQuery.data ?? []).filter((topic) => topic.status === 'active');

  const validRows = rows.filter((row) => row.payload !== undefined);
  const invalidRows = rows.filter((row) => row.error !== undefined);

  const reset = () => {
    setPhase('setup');
    setRows([]);
    setDone(0);
    setImported(0);
    setFailures([]);
    setFileName('');
    setPickedSubjectId(null);
    setDefaultTopicId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenChange = (next: boolean) => {
    if (phase === 'running') return; // don't allow closing mid-import
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFile = async (file: File) => {
    if (!subjectId) {
      toast.error('Select a subject before choosing a file');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setFileName(file.name);
    try {
      const parsed = await parseQuestionsCsv(file);
      if (parsed.length === 0) {
        toast.error('The CSV has no data rows');
        return;
      }
      if (parsed.length > MAX_IMPORT_ROWS) {
        toast.error(`Too many rows — the limit is ${MAX_IMPORT_ROWS} per import`);
        return;
      }
      const topicsByName = new Map<string, string[]>();
      for (const topic of topics) {
        const key = topic.name.toLowerCase();
        topicsByName.set(key, [...(topicsByName.get(key) ?? []), topic.id]);
      }
      setRows(
        mapRowsToPayloads(parsed, {
          subjectId,
          topicsByName,
          defaultTopicId: defaultTopicId || undefined,
        }),
      );
      setPhase('review');
    } catch {
      toast.error('Could not parse the CSV file');
    }
  };

  const runImport = async () => {
    setPhase('running');
    const failed: RowFailure[] = [];
    let ok = 0;
    let processed = 0;
    for (const row of validRows) {
      try {
        await createQuestion(row.payload!);
        ok += 1;
      } catch (error) {
        failed.push({
          row: row.row,
          message: error instanceof ApiError ? error.message : 'Request failed',
        });
      }
      processed += 1;
      setDone(processed);
      setImported(ok);
      setFailures([...failed]);
    }
    await queryClient.invalidateQueries({ queryKey: queryKeys.questions.root });
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin });
    if (ok > 0) toast.success(`Imported ${ok} question${ok === 1 ? '' : 's'}`);
    setPhase('done');
  };

  const allFailures: RowFailure[] = [
    ...invalidRows.map((row) => ({ row: row.row, message: row.error ?? 'Invalid row' })),
    ...failures,
  ].sort((a, b) => a.row - b.row);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100svh-3rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import questions from CSV</DialogTitle>
          <DialogDescription>
            Topic-wise import — each row can name its topic, or fall back to the default topic you
            pick here.
          </DialogDescription>
        </DialogHeader>

        {phase === 'setup' ? (
          <div className="space-y-4">
            <Field>
              <FieldLabel htmlFor="import-subject">Subject</FieldLabel>
              <Select
                value={subjectId || undefined}
                onValueChange={(value) => {
                  setPickedSubjectId(value);
                  setDefaultTopicId('');
                }}
              >
                <SelectTrigger id="import-subject" className="w-full">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects
                    .filter((subject) => subject.status === 'active')
                    .map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="import-topic">Default topic (optional)</FieldLabel>
              <Select
                value={defaultTopicId || undefined}
                onValueChange={setDefaultTopicId}
                disabled={!subjectId}
              >
                <SelectTrigger id="import-topic" className="w-full">
                  <SelectValue
                    placeholder={subjectId ? 'Used when a row has no topic' : 'Pick a subject first'}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      <span className="whitespace-pre">{topicIndentLabel(topic)}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-5 text-center">
              <FileUp className="mx-auto size-6 text-slate-400" aria-hidden />
              <p className="mt-2 text-sm text-slate-600">
                {fileName || 'Choose a .csv file with your questions'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                aria-label="Choose CSV file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-3 rounded-lg"
                onClick={() => fileInputRef.current?.click()}
                disabled={!subjectId}
              >
                Browse file
              </Button>
            </div>

            <button
              type="button"
              onClick={downloadCsvTemplate}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Download className="size-3.5" aria-hidden />
              Download CSV template
            </button>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Columns: topic, question, optionA–optionD, correctAnswer (A–D), explanation,
              difficulty (easy/medium/hard), marks, negativeMarks. Topic names must match the
              subject&apos;s topic tree.
            </p>
          </div>
        ) : null}

        {phase === 'review' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5">
                <p className="text-lg font-semibold tabular-nums">{rows.length}</p>
                <p className="text-[11px] text-slate-500">Rows</p>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50/70 px-3 py-2.5">
                <p className="text-lg font-semibold text-green-700 tabular-nums">
                  {validRows.length}
                </p>
                <p className="text-[11px] text-green-700">Valid</p>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50/70 px-3 py-2.5">
                <p className="text-lg font-semibold text-red-700 tabular-nums">
                  {invalidRows.length}
                </p>
                <p className="text-[11px] text-red-700">Invalid</p>
              </div>
            </div>

            {invalidRows.length > 0 ? (
              <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-red-200 bg-red-50/60 p-3">
                {invalidRows.map((row) => (
                  <p key={row.row} className="flex items-start gap-1.5 text-xs text-red-700">
                    <TriangleAlert className="mt-0.5 size-3 shrink-0" aria-hidden />
                    Row {row.row}: {row.error}
                  </p>
                ))}
              </div>
            ) : null}

            <DialogFooter>
              <Button variant="outline" className="rounded-lg" onClick={reset}>
                Back
              </Button>
              <Button
                className="rounded-lg"
                disabled={validRows.length === 0}
                onClick={() => void runImport()}
              >
                Import {validRows.length} question{validRows.length === 1 ? '' : 's'}
              </Button>
            </DialogFooter>
          </div>
        ) : null}

        {phase === 'running' ? (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Importing {done} of {validRows.length}…
            </div>
            <Progress value={validRows.length ? (done / validRows.length) * 100 : 0} />
          </div>
        ) : null}

        {phase === 'done' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50/70 px-4 py-3">
              <CheckCircle2 className="size-5 text-green-600" aria-hidden />
              <p className="text-sm font-medium text-green-800">
                {imported} imported · {allFailures.length} failed
              </p>
            </div>
            {allFailures.length > 0 ? (
              <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-red-200 bg-red-50/60 p-3">
                {allFailures.map((failure) => (
                  <p
                    key={`${failure.row}-${failure.message}`}
                    className="flex items-start gap-1.5 text-xs text-red-700"
                  >
                    <TriangleAlert className="mt-0.5 size-3 shrink-0" aria-hidden />
                    Row {failure.row}: {failure.message}
                  </p>
                ))}
              </div>
            ) : null}
            <DialogFooter>
              <Button className="rounded-lg" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
