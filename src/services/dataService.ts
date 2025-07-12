import type { Runner } from '../types';

// Configuration - Update these with your GitHub details
const GITHUB_USERNAME = 'dan-burk';
const REPO_NAME = 'sdxc';
const BRANCH = 'main'; // or 'master' depending on your default branch

export const loadData = async (
  gender: 'boys' | 'girls', 
  year: string, 
  week: string
): Promise<Runner[]> => {
  const url = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/${BRANCH}/data/${gender}_${year}_${week}.json`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

export const loadSchools = async (): Promise<string[]> => {
  const url = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/${BRANCH}/data/schools.json`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch schools: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading schools:', error);
    // Fallback to the existing schools list if GitHub fetch fails
    return [
      "Hill City", "Pierre T.F. Riggs", "Dakota Valley", "Brandon Valley", "Rapid City Stevens",
      "Sioux Falls Lincoln", "Milbank", "Douglas", "Miller", "SF Washington", "Yankton",
      "O'Gorman", "Spearfish", "Brookings", "Huron", "SF Roosevelt", "Rapid City Central",
      "Mitchell", "Aberdeen Central", "Watertown", "Pierre"
    ];
  }
};