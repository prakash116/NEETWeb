'use client';

import { useRef } from 'react';
import { Camera, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { initialsOf } from '@/lib/format';
import type { StudentProfile } from '@/types/entities';
import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_BYTES } from '../constants';
import { useUploadProfilePhoto } from '../hooks';

export function ProfileCard({ profile }: { profile: StudentProfile }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadMutation = useUploadProfilePhoto();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error('Image must be 5MB or smaller');
      return;
    }
    uploadMutation.mutate(file);
  };

  const copyStudentId = async () => {
    try {
      await navigator.clipboard.writeText(profile.studentId);
      toast.success('Student ID copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-center shadow-xl shadow-slate-900/5 backdrop-blur-xl">
      <div className="relative mx-auto w-fit">
        <Avatar className="size-24 shadow-md ring-2 ring-white/90">
          <AvatarImage src={profile.profilePhotoUrl} alt="" />
          <AvatarFallback className="bg-blue-50 text-xl font-semibold text-primary">
            {initialsOf(profile.fullName)}
          </AvatarFallback>
        </Avatar>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_PHOTO_TYPES.join(',')}
        className="hidden"
        onChange={handleFileChange}
        aria-label="Choose profile photo"
      />
      <Button
        variant="outline"
        size="sm"
        className="mt-3 rounded-lg"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadMutation.isPending}
      >
        {uploadMutation.isPending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <Camera className="size-3.5" aria-hidden />
        )}
        {uploadMutation.isPending ? 'Uploading…' : 'Change photo'}
      </Button>

      <h2 className="mt-4 text-lg font-semibold text-foreground">{profile.fullName}</h2>
      <p className="text-sm text-slate-600">{profile.email}</p>

      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-2.5">
        <span className="text-sm font-medium text-slate-700 tabular-nums">{profile.studentId}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={copyStudentId}
          aria-label="Copy student ID"
          className="text-slate-500"
        >
          <Copy className="size-3.5" aria-hidden />
        </Button>
      </div>

      <Badge variant="secondary" className="mt-4">
        Student
      </Badge>
    </div>
  );
}
