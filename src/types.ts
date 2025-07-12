// Type definitions for the SD XC Rankings app

export interface Runner {
  id: number;
  Name: string;  // Capital N to match your JSON
  School: string; // Capital S to match your JSON
  time_min: number; // underscore format to match your JSON
  points: number;
  school_class: 'A' | 'AA' | 'B'; // underscore format to match your JSON
  rnk_blnd: number; // underscore format to match your JSON
}

export interface WeekData {
  [key: string]: Runner[]; // week1, week2, etc.
}

export interface YearData {
  [year: string]: WeekData; // 2023, 2024, etc.
}

export interface GenderData {
  boys: YearData;
  girls: YearData;
}

export type ClassFilter = 'A' | 'AA' | 'B' | 'classall';
export type GenderFilter = 'M' | 'F';
export type WeekFilter = 'week1' | 'week2' | 'week3' | 'week4' | 'week5' | 'week6' | 'week7';
export type YearFilter = '2023' | '2024';
export type TabType = 'rankings' | 'teams';