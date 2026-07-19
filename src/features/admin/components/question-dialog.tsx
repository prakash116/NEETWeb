'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { AnswerOption, Question, Subject } from '@/types/entities';
import { useCreateQuestion, useTopicTree, useUpdateQuestion } from '../hooks';
import { questionSchema, type QuestionFormValues } from '../schemas';
import { flattenTopics, topicIndentLabel } from '../topic-utils';

const ANSWER_KEYS: AnswerOption[] = ['A', 'B', 'C', 'D'];

function optionText(question: Question | null, key: AnswerOption): string {
  return question?.options.find((option) => option.key === key)?.text ?? '';
}

export function QuestionDialog({
  open,
  onOpenChange,
  editing,
  subjects,
  defaultSubjectId,
  defaultTopicId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Question | null;
  subjects: Subject[];
  defaultSubjectId?: string;
  defaultTopicId?: string;
}) {
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();
  const pending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    values: {
      subjectId: editing?.subjectId ?? defaultSubjectId ?? '',
      topicId: editing?.topicId ?? defaultTopicId ?? '',
      difficulty: editing?.difficulty ?? 'medium',
      question: editing?.question ?? '',
      optionA: optionText(editing, 'A'),
      optionB: optionText(editing, 'B'),
      optionC: optionText(editing, 'C'),
      optionD: optionText(editing, 'D'),
      correctAnswer: editing?.correctAnswer ?? 'A',
      explanation: editing?.explanation ?? '',
      marks: editing ? String(editing.marks) : '4',
      negativeMarks: editing ? String(editing.negativeMarks) : '1',
      status: editing?.status ?? 'active',
    },
  });
  const { errors } = form.formState;

  const subjectId = useWatch({ control: form.control, name: 'subjectId', defaultValue: '' });
  const treeQuery = useTopicTree(open && subjectId ? subjectId : null);
  const topics = flattenTopics(treeQuery.data ?? []).filter((topic) => topic.status === 'active');

  const submit = form.handleSubmit((values) => {
    const close = () => onOpenChange(false);
    const payload = {
      subjectId: values.subjectId,
      topicId: values.topicId,
      difficulty: values.difficulty,
      question: values.question,
      options: ANSWER_KEYS.map((key) => ({ key, text: values[`option${key}`] })),
      correctAnswer: values.correctAnswer,
      explanation: values.explanation || undefined,
      marks: values.marks === '' ? undefined : Number(values.marks),
      negativeMarks: values.negativeMarks === '' ? undefined : Number(values.negativeMarks),
      status: values.status,
    };
    if (editing) updateMutation.mutate({ id: editing.id, payload }, { onSuccess: close });
    else createMutation.mutate(payload, { onSuccess: close });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-3rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit question' : 'New MCQ question'}</DialogTitle>
          <DialogDescription>
            Four options, one correct answer — exactly like NEET.
          </DialogDescription>
        </DialogHeader>

        <form noValidate className="space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={errors.subjectId ? true : undefined}>
              <FieldLabel htmlFor="q-subject">Subject</FieldLabel>
              <Controller
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('topicId', '');
                    }}
                    disabled={pending}
                  >
                    <SelectTrigger id="q-subject" className="w-full">
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
                )}
              />
              {errors.subjectId ? <FieldError>{errors.subjectId.message}</FieldError> : null}
            </Field>

            <Field data-invalid={errors.topicId ? true : undefined}>
              <FieldLabel htmlFor="q-topic">Topic</FieldLabel>
              <Controller
                control={form.control}
                name="topicId"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={pending || !subjectId}
                  >
                    <SelectTrigger id="q-topic" className="w-full">
                      <SelectValue placeholder={subjectId ? 'Select topic' : 'Pick a subject first'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          <span className="whitespace-pre">{topicIndentLabel(topic)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.topicId ? <FieldError>{errors.topicId.message}</FieldError> : null}
            </Field>
          </div>

          <Field data-invalid={errors.question ? true : undefined}>
            <FieldLabel htmlFor="q-text">Question</FieldLabel>
            <Textarea
              id="q-text"
              rows={3}
              placeholder="A car accelerates uniformly from rest to 20 m/s in 5 s…"
              disabled={pending}
              aria-invalid={errors.question ? true : undefined}
              {...form.register('question')}
            />
            {errors.question ? <FieldError>{errors.question.message}</FieldError> : null}
          </Field>

          <Field>
            <FieldLabel>Options — select the correct answer</FieldLabel>
            <Controller
              control={form.control}
              name="correctAnswer"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="gap-2"
                  disabled={pending}
                >
                  {ANSWER_KEYS.map((key) => {
                    const fieldName = `option${key}` as const;
                    const error = errors[fieldName];
                    return (
                      <div key={key} className="flex items-start gap-2.5">
                        <RadioGroupItem
                          value={key}
                          id={`q-correct-${key}`}
                          aria-label={`Mark option ${key} correct`}
                          className="mt-2.5"
                        />
                        <span className="mt-1.5 w-5 text-sm font-semibold text-slate-500">
                          {key}
                        </span>
                        <div className="flex-1">
                          <Input
                            placeholder={`Option ${key}`}
                            disabled={pending}
                            aria-label={`Option ${key} text`}
                            aria-invalid={error ? true : undefined}
                            {...form.register(fieldName)}
                          />
                          {error ? (
                            <p className="mt-1 text-xs text-destructive">{error.message}</p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </RadioGroup>
              )}
            />
          </Field>

          <Field data-invalid={errors.explanation ? true : undefined}>
            <FieldLabel htmlFor="q-explanation">Explanation (optional)</FieldLabel>
            <Textarea
              id="q-explanation"
              rows={2}
              placeholder="Why the correct option is right"
              disabled={pending}
              {...form.register('explanation')}
            />
            {errors.explanation ? <FieldError>{errors.explanation.message}</FieldError> : null}
          </Field>

          <div className={`grid grid-cols-2 gap-4 ${editing ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
            <Field>
              <FieldLabel htmlFor="q-difficulty">Difficulty</FieldLabel>
              <Controller
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                    <SelectTrigger id="q-difficulty" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field data-invalid={errors.marks ? true : undefined}>
              <FieldLabel htmlFor="q-marks">Marks</FieldLabel>
              <Input
                id="q-marks"
                inputMode="decimal"
                disabled={pending}
                aria-invalid={errors.marks ? true : undefined}
                {...form.register('marks')}
              />
              {errors.marks ? <FieldError>{errors.marks.message}</FieldError> : null}
            </Field>

            <Field data-invalid={errors.negativeMarks ? true : undefined}>
              <FieldLabel htmlFor="q-negative">Negative marks</FieldLabel>
              <Input
                id="q-negative"
                inputMode="decimal"
                disabled={pending}
                aria-invalid={errors.negativeMarks ? true : undefined}
                {...form.register('negativeMarks')}
              />
              {errors.negativeMarks ? <FieldError>{errors.negativeMarks.message}</FieldError> : null}
            </Field>

            {editing ? (
              <Field>
                <FieldLabel htmlFor="q-status">Status</FieldLabel>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                      <SelectTrigger id="q-status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {editing ? 'Save changes' : 'Create question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
