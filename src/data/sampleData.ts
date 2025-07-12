import type { GenderData, Runner } from '../types';

// Sample data structure based on your R Shiny app
export const sampleRunners: GenderData = {
  boys: {
    2023: {
      week7: [
        { id: 1, name: "LUKE RUPERT", school: "Hill City", timeMin: 980.9, points: 31932.11, schoolClass: "A", blendedRank: 1 },
        { id: 2, name: "JARED LUTMER", school: "Pierre T.F. Riggs", timeMin: 919.90, points: 37267.67, schoolClass: "AA", blendedRank: 2 },
        { id: 3, name: "JOE CROSS", school: "Dakota Valley", timeMin: 933.51, points: 44395, schoolClass: "A", blendedRank: 3 },
        { id: 4, name: "MIKAH PETERS", school: "Brandon Valley", timeMin: 929.30, points: 31506.38, schoolClass: "AA", blendedRank: 4 },
        { id: 5, name: "GRADY LOOS", school: "Rapid City Stevens", timeMin: 936.90, points: 20719.77, schoolClass: "AA", blendedRank: 5 },
        { id: 6, name: "MILES LECHTENBERG", school: "Sioux Falls Lincoln", timeMin: 935.00, points: 20062.39, schoolClass: "AA", blendedRank: 6 },
        { id: 7, name: "PAYTON BROWN", school: "Milbank", timeMin: 946.25, points: 21537.15, schoolClass: "A", blendedRank: 7 },
        { id: 8, name: "PEYTON CAST", school: "Douglas", timeMin: 947.97, points: 23870.85, schoolClass: "AA", blendedRank: 8 },
        { id: 9, name: "ALEX SCHUMACHER", school: "Miller", timeMin: 953.20, points: 29840.69, schoolClass: "A", blendedRank: 9 },
        { id: 10, name: "COLE REILLY", school: "SF Washington", timeMin: 943.80, points: 15205.8, schoolClass: "AA", blendedRank: 10 },
        { id: 11, name: "CARTER JOHNSON", school: "Yankton", timeMin: 955.45, points: 18932.22, schoolClass: "AA", blendedRank: 11 },
        { id: 12, name: "JACOB MERXBAUER", school: "O'Gorman", timeMin: 958.12, points: 21045.67, schoolClass: "AA", blendedRank: 12 },
        { id: 13, name: "NOAH ANDERSON", school: "Spearfish", timeMin: 960.33, points: 19876.44, schoolClass: "A", blendedRank: 13 },
        { id: 14, name: "ETHAN WILLIAMS", school: "Brookings", timeMin: 962.78, points: 22134.56, schoolClass: "AA", blendedRank: 14 },
        { id: 15, name: "MASON THOMPSON", school: "Huron", timeMin: 965.21, points: 24567.89, schoolClass: "A", blendedRank: 15 }
      ]
    },
    2024: {
      week7: [
        { id: 1, name: "LUKE RUPERT", school: "Hill City", timeMin: 975.2, points: 32100.45, schoolClass: "A", blendedRank: 1 },
        { id: 2, name: "JARED LUTMER", school: "Pierre T.F. Riggs", timeMin: 915.80, points: 37500.22, schoolClass: "AA", blendedRank: 2 },
        { id: 3, name: "JOE CROSS", school: "Dakota Valley", timeMin: 930.15, points: 44600.78, schoolClass: "A", blendedRank: 3 }
      ]
    }
  },
  girls: {
    2023: {
      week7: [
        { id: 1, name: "SARAH JOHNSON", school: "SF Roosevelt", timeMin: 1055.30, points: 28765.44, schoolClass: "AA", blendedRank: 1 },
        { id: 2, name: "EMMA PETERSON", school: "Rapid City Central", timeMin: 1062.15, points: 30234.67, schoolClass: "AA", blendedRank: 2 },
        { id: 3, name: "MADISON SMITH", school: "Yankton", timeMin: 1068.45, points: 31456.89, schoolClass: "AA", blendedRank: 3 },
        { id: 4, name: "OLIVIA BROWN", school: "Brookings", timeMin: 1074.20, points: 32678.12, schoolClass: "AA", blendedRank: 4 },
        { id: 5, name: "GRACE DAVIS", school: "Mitchell", timeMin: 1079.88, points: 33890.35, schoolClass: "A", blendedRank: 5 },
        { id: 6, name: "LILY WILSON", school: "Aberdeen Central", timeMin: 1085.67, points: 35102.58, schoolClass: "AA", blendedRank: 6 },
        { id: 7, name: "SOPHIA MILLER", school: "Watertown", timeMin: 1091.22, points: 36314.81, schoolClass: "AA", blendedRank: 7 },
        { id: 8, name: "ISABELLA GARCIA", school: "Spearfish", timeMin: 1096.99, points: 37527.04, schoolClass: "A", blendedRank: 8 },
        { id: 9, name: "CHARLOTTE JONES", school: "Pierre", timeMin: 1102.45, points: 38739.27, schoolClass: "AA", blendedRank: 9 },
        { id: 10, name: "AMELIA TAYLOR", school: "Huron", timeMin: 1108.12, points: 39951.50, schoolClass: "A", blendedRank: 10 }
      ]
    },
    2024: {
      week7: [
        { id: 1, name: "SARAH JOHNSON", school: "SF Roosevelt", timeMin: 1050.45, points: 29000.22, schoolClass: "AA", blendedRank: 1 },
        { id: 2, name: "EMMA PETERSON", school: "Rapid City Central", timeMin: 1058.67, points: 30456.78, schoolClass: "AA", blendedRank: 2 }
      ]
    }
  }
};

export const schools: string[] = [
  "Hill City", "Pierre T.F. Riggs", "Dakota Valley", "Brandon Valley", "Rapid City Stevens",
  "Sioux Falls Lincoln", "Milbank", "Douglas", "Miller", "SF Washington", "Yankton",
  "O'Gorman", "Spearfish", "Brookings", "Huron", "SF Roosevelt", "Rapid City Central",
  "Mitchell", "Aberdeen Central", "Watertown", "Pierre"
];

// Helper function to convert seconds to MM:SS.SS format
export const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const secondsWhole = Math.floor(seconds);
  const hundredths = Math.round((seconds - secondsWhole) * 100);
  
  return `${minutes}:${secondsWhole.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
};