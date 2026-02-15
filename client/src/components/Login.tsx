
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/api/client';
import { UserRole, User } from '@/types';
import { TrendingUp, ShieldCheck, Lock, ChevronRight, UserCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const loginSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    password: z.string().min(1, 'Password is required'),
  });
  type LoginForm = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      password: '',
    },
  });

  const roleMap: Record<string, UserRole> = {
    ADMIN: UserRole.ADMIN,
    CSO: UserRole.CSO,
    BUH: UserRole.BUH,
    BDM: UserRole.BDM,
    PRACTICE_HEAD: UserRole.PRACTICE_HEAD,
    GEO_HEAD: UserRole.GEO_HEAD,
  };

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginForm) => {
      const response = await apiClient.post('/auth/login', payload);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Login successful:', data);
      const apiRole = data.user.roles?.[0] ?? 'BDM';
      const role = roleMap[apiRole] ?? UserRole.BDM;
      localStorage.setItem('token', data.token);
      onLogin({
        id: String(data.user.id),
        name: data.user.name,
        email: data.user.email,
        role,
      });
    },
  });

  const handleLogin = (payload: LoginForm) => {
    loginMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-inter">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-6 text-white">
            <TrendingUp size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mindteck MIS</h1>
          <p className="text-slate-500 font-medium mt-2">Enterprise Revenue Management Portal</p>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50 p-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserCircle size={14} /> User Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                {...register('name')}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900"
              />
              {errors.name && (
                <div className="text-xs font-bold text-red-500">{errors.name.message}</div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Lock size={14} /> Security Key
              </label>
              <input 
                type="password" 
                placeholder="Enter your password"
                {...register('password')}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
              {errors.password && (
                <div className="text-xs font-bold text-red-500">{errors.password.message}</div>
              )}
            </div>

            {loginMutation.isError && (
              <div className="text-xs font-bold text-red-500">
                Login failed. Please check your credentials.
              </div>
            )}

            <button 
              type="submit"
              disabled={loginMutation.isPending || !isValid}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loginMutation.isPending ? (
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <> Login <ChevronRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vault Protected Environment</span>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Restricted Access Systems • Authorized Personnel Only
        </p>
      </div>
    </div>
  );
};

export default Login;
