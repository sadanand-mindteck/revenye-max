import { create } from 'zustand';

type SessionYearState = {
  sessionYears: string[];
  sessionYear: string;
  setSessionYear: (year: string) => void;
  refreshSessionYears: () => void;
};

const computeSessionYears = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const baseYear = now.getMonth() < 3 ? currentYear - 1 : currentYear;
  return [
    `${baseYear - 2}-${(baseYear - 1).toString().slice(-2)}`,
    `${baseYear - 1}-${baseYear.toString().slice(-2)}`,
    `${baseYear}-${(baseYear + 1).toString().slice(-2)}`,
    `${baseYear + 1}-${(baseYear + 2).toString().slice(-2)}`,
  ];
};

export const useSessionYearStore = create<SessionYearState>((set) => {
  const sessionYears = computeSessionYears();
  return {
    sessionYears,
    sessionYear: sessionYears[2] ?? sessionYears[0] ?? '',
    setSessionYear: (year) => set({ sessionYear: year }),
    refreshSessionYears: () => {
      const updated = computeSessionYears();
      set((state) => ({
        sessionYears: updated,
        sessionYear: updated.includes(state.sessionYear) ? state.sessionYear : updated[2] ?? updated[0] ?? '',
      }));
    },
  };
});
