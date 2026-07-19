'use client';

import { useState } from 'react';
import { Loader2, TriangleAlert } from 'lucide-react';
import { PasswordInput } from '@/components/common/password-input';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { useDeleteAccount } from '../hooks';

export function DangerZone() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const deleteMutation = useDeleteAccount();

  return (
    <div className="rounded-2xl border border-red-200/70 bg-red-50/60 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">Delete account</h3>
          <p className="mt-1 text-sm text-slate-600">
            Permanently removes your account, profile, address, and login sessions. Exam history
            kept by the platform is no longer linked to you. This cannot be undone.
          </p>

          <AlertDialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setPassword(''); }}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="mt-4 rounded-lg border-red-200 text-destructive hover:bg-red-50"
              >
                Delete my account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account permanently?</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter your password to confirm. Your account and personal data are removed
                  immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Field>
                <FieldLabel htmlFor="confirm-password">Password</FieldLabel>
                <PasswordInput
                  id="confirm-password"
                  autoComplete="current-password"
                  placeholder="Your current password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={deleteMutation.isPending}
                />
              </Field>

              <AlertDialogFooter>
                <Button
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => setOpen(false)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-lg bg-destructive text-white hover:bg-destructive/90"
                  disabled={password.length === 0 || deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(password)}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : null}
                  {deleteMutation.isPending ? 'Deleting…' : 'Delete forever'}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
