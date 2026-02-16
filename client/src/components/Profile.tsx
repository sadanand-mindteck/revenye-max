import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, UserCircle } from 'lucide-react';
import { apiClient } from '@/api/client';
import { User } from '@/types';

interface ProfileProps {
  user: User;
  onPasswordChanged: () => void;
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

const Profile: React.FC<ProfileProps> = ({ user, onPasswordChanged }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (payload: PasswordForm) => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Missing auth token');
      await apiClient.post(
        '/auth/change-password',
        { currentPassword: payload.currentPassword, newPassword: payload.newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    },
    onSuccess: () => {
      reset();
      onPasswordChanged();
    },
  });

  useEffect(() => {
    return () => reset();
  }, [reset]);

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-200">
          <UserCircle size={18} className="text-blue-600" />
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Profile</h2>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-500">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-sm font-semibold text-slate-500 truncate">{user.email}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{user.role}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-2">
          <Lock size={16} className="text-blue-600" />
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Change Password</h3>
        </div>

        <form onSubmit={handleSubmit((payload) => changePasswordMutation.mutate(payload))} className="px-6 pb-6 space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
            <input
              type="password"
              {...register('currentPassword')}
              className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
            {errors.currentPassword && (
              <div className="mt-1 text-xs font-bold text-red-500">{errors.currentPassword.message}</div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
            <input
              type="password"
              {...register('newPassword')}
              className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
            {errors.newPassword && (
              <div className="mt-1 text-xs font-bold text-red-500">{errors.newPassword.message}</div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="mt-2 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
            {errors.confirmPassword && (
              <div className="mt-1 text-xs font-bold text-red-500">{errors.confirmPassword.message}</div>
            )}
          </div>

          {changePasswordMutation.isError && (
            <div className="text-xs font-bold text-red-500">Password update failed. Try again.</div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={!isValid || changePasswordMutation.isPending}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-60"
            >
              {changePasswordMutation.isPending ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
