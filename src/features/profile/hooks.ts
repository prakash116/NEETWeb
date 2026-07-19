import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api-client';
import { authTokens } from '@/lib/auth-tokens';
import { queryKeys } from '@/lib/query-keys';
import { clearRoleCookie } from '@/lib/role-cookie';
import { useAuthStore } from '@/stores/auth-store';
import type { StudentAddress } from '@/types/entities';
import {
  deleteAccount,
  getMyAddress,
  getMyProfile,
  updateMyProfile,
  upsertMyAddress,
  uploadImage,
} from './api';

export function useMyProfile(enabled = true) {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: getMyProfile,
    enabled,
    staleTime: 60_000,
  });
}

export function useMyAddress(enabled = true) {
  return useQuery<StudentAddress | null>({
    queryKey: queryKeys.profile.address,
    queryFn: async () => {
      try {
        return await getMyAddress();
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile.me, profile);
      toast.success('Profile updated');
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not update profile');
    },
  });
}

export function useUpsertAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertMyAddress,
    onSuccess: (address) => {
      queryClient.setQueryData(queryKeys.profile.address, address);
      toast.success('Address saved');
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not save address');
    },
  });
}

/** Uploads to Cloudinary, then persists the URL on the profile. */
export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const upload = await uploadImage(file, 'profile');
      return updateMyProfile({ profilePhotoUrl: upload.secureUrl });
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile.me, profile);
      toast.success('Photo updated');
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not upload photo');
    },
  });
}

export function useDeleteAccount() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setGuest = useAuthStore((state) => state.setGuest);

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      authTokens.clear();
      clearRoleCookie();
      setGuest();
      queryClient.clear();
      toast.success('Your account has been deleted');
      router.replace('/');
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not delete account');
    },
  });
}
