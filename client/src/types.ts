
export enum UserRole {
  CSO = 'CSO',
  BUH = 'BUH',
  BDM = 'BDM',
  PRACTICE_HEAD = 'Practice Head',
  GEO_HEAD = 'Geo Head',
  ADMIN = 'Admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type FinancialRecord = {
  forecast: number;
  actual: number;
  budget: number;
  variance: number;
};

export type Deal = {
  id: string;
  projectName: string;
  customer: string;
  region: string;
  location: string;
  buHead: string;
  projectType: string;
  dealType: string;
  practiceHead: string;
  bdm: string;
  businessType: string;
  changeCount: number;
  note: string;
  status: 'Lead' | 'In Progress' | 'Closed Won' | 'Closed Lost' | 'On Hold';
  fyForecast: number;
  fyBudget: number;
  fyActual: number;
  variance: number;
};
