import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Lock, UserCircle } from 'lucide-react';
import { apiClient } from '@/api/client';
import { User } from '@/types';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  user: User;
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

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ open, onClose, user }) => {
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

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const changePasswordMutation = useMutation({
    mutationFn: async (payload: PasswordForm) => {
      const token = localStorage.getItem('revenue_max_token');
      if (!token) throw new Error('Missing auth token');
      await apiClient.post(
        '/auth/change-password',
        { currentPassword: payload.currentPassword, newPassword: payload.newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    },
    onSuccess: () => {
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-blue-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Profile & Password</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pt-6">
          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-500">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-xs font-semibold text-slate-500 truncate">{user.email}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{user.role}</p>
            </div>
            <UserCircle size={28} className="ml-auto text-slate-200" />
          </div>
        </div>

        <form onSubmit={handleSubmit((payload) => changePasswordMutation.mutate(payload))} className="px-6 py-6 space-y-4">
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
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
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

export default ChangePasswordDialog;
