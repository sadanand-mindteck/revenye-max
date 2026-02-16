
/// <reference types="vite/client" />

import React from 'react';
import { LayoutDashboard, Briefcase, FilePlus, Settings, Users, BarChart3, Globe, Database } from 'lucide-react';
import { UserRole } from './types';

export const HOST = import.meta.env.VITE_API_HOST || 'http://localhost:5000/api';

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'deals', label: 'Portfolio Management', icon: <Briefcase size={20} /> },
  { id: 'entry', label: 'Revenue Entry', icon: <FilePlus size={20} /> },
  { id: 'analytics', label: 'Financial Analytics', icon: <BarChart3 size={20} /> },
  { id: 'regions', label: 'Regional View', icon: <Globe size={20} /> },
  { id: 'upload', label: 'Data Ingestion', icon: <Database size={20} /> },
  { id: 'settings', label: 'System Settings', icon: <Settings size={20} /> },
];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['dashboard', 'deals', 'entry', 'analytics', 'regions', 'upload', 'settings', 'profile'],
  [UserRole.CSO]: ['dashboard', 'deals', 'analytics', 'regions', 'profile'],
  [UserRole.BUH]: ['dashboard', 'deals', 'analytics', 'regions', 'profile'],
  [UserRole.BDM]: ['dashboard', 'deals', 'entry', 'profile'],
  [UserRole.PRACTICE_HEAD]: ['dashboard', 'deals', 'entry', 'analytics', 'profile'],
  [UserRole.GEO_HEAD]: ['dashboard', 'deals', 'analytics', 'regions', 'profile'],
};

export const FISCAL_YEARS = ['FY 2023-24', 'FY 2024-25', 'FY 2025-26'];
