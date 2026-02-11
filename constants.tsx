
import React from 'react';
import { LayoutDashboard, Briefcase, FilePlus, Settings, Users, BarChart3, Globe, Database } from 'lucide-react';
import { Deal, UserRole } from './types';

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
  [UserRole.ADMIN]: ['dashboard', 'deals', 'entry', 'analytics', 'regions', 'upload', 'settings'],
  [UserRole.CSO]: ['dashboard', 'deals', 'analytics', 'regions'],
  [UserRole.BUH]: ['dashboard', 'deals', 'analytics', 'regions'],
  [UserRole.BDM]: ['dashboard', 'deals', 'entry'],
  [UserRole.PRACTICE_HEAD]: ['dashboard', 'deals', 'entry', 'analytics'],
  [UserRole.MARKETING]: ['dashboard', 'deals', 'analytics'],
};

export const MOCK_DEALS: Deal[] = [
  {
    id: '1',
    projectName: 'Cloud Migration Phase 2',
    customer: 'Alpha Corp',
    region: 'North America',
    location: 'New York, NY',
    buHead: 'Sarah Miller',
    projectType: 'Managed Services',
    dealType: 'Fixed Bid',
    practiceHead: 'Li Wei',
    bdm: 'John Doe',
    businessType: 'Existing Customer',
    changeCount: 2,
    note: 'Initial forecast based on signed MSA.',
    status: 'In Progress',
    fyForecast: 450000,
    fyBudget: 400000,
    fyActual: 385000,
    variance: 50000,
  },
  {
    id: '2',
    projectName: 'AI Security Audit',
    customer: 'CyberDyne',
    region: 'Europe',
    location: 'London, UK',
    buHead: 'Marcus Brandt',
    projectType: 'Consulting',
    dealType: 'Time & Materials',
    practiceHead: 'Sarah Smith',
    bdm: 'Sarah Smith',
    businessType: 'New Customer',
    changeCount: 1,
    note: 'Audit completed. Final report pending.',
    status: 'Closed Won',
    fyForecast: 280000,
    fyBudget: 300000,
    fyActual: 295000,
    variance: -20000,
  },
  {
    id: '3',
    projectName: 'E-commerce Overhaul',
    customer: 'RetailGiant',
    region: 'APAC',
    location: 'Singapore',
    buHead: 'Li Wei',
    projectType: 'Development',
    dealType: 'Fixed Bid',
    practiceHead: 'Michael Chen',
    bdm: 'Michael Chen',
    businessType: 'Existing Customer',
    changeCount: 4,
    note: 'Major overhaul of the main store platform.',
    status: 'In Progress',
    fyForecast: 1200000,
    fyBudget: 1000000,
    fyActual: 1050000,
    variance: 200000,
  }
];

export const FISCAL_YEARS = ['FY 2023-24', 'FY 2024-25', 'FY 2025-26'];
