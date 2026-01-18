/**
 * Design System Theme
 * Aligned with SWM Bäder Auslastung: https://www.swm.de/baeder/auslastung
 */

export const theme = {
  colors: {
    // Occupancy level colors (traffic light system)
    occupancy: {
      low: '#3E8326',      // Green: 0-50%
      medium: '#FFE306',   // Yellow: 50-70%
      busy: '#FD7700',     // Orange: 70-85%
      high: '#F44336',     // Red: 85-100%
    },

    // Brand colors
    brand: {
      primary: '#002D5B',   // SWM Blue - headers, primary buttons
      secondary: '#0065CC', // Links, interactive elements
      accent: '#0B9AC5',    // Cyan accent
    },

    // Text colors
    text: {
      primary: '#202020',   // Body text, headings
      secondary: '#4A5056', // Secondary text
      muted: '#595959',     // Captions, labels
    },

    // Background colors
    background: {
      page: '#FFFFFF',
      card: '#EFF7FE',
      light: '#F5F5F5',     // Progress bar empty state
    },

    // Border color
    border: '#CFCFCF',

    // Alert colors
    alert: {
      background: '#FDDDDD',
      text: '#AC1116',
    },
  },

  typography: {
    fontFamily: {
      primary: "'RobotoRegular', Arial, sans-serif",
      bold: "'RobotoBold', Arial, sans-serif",
    },
    fontSize: {
      headlineXL: '45px',
      headlineL: '30px',
      headlineM: '20px',
      body: '16px',
      bodySmall: '14px',
      caption: '12px',
    },
    lineHeight: {
      base: 1.33,
    },
  },

  spacing: {
    xs: '4px',
    s: '8px',
    m: '16px',
    l: '20px',
    xl: '24px',
    xxl: '32px',
  },

  borderRadius: {
    small: '3px',
    medium: '5px',
    large: '8px',
    xl: '10px',
    round: '50%',
    pill: '30px',
  },

  components: {
    progressBar: {
      height: '15px',
      borderRadius: '10px',
      backgroundEmpty: '#F5F5F5',
      containerWidth: '590px',
    },
    card: {
      borderRadius: '8px',
      padding: '20px',
      background: '#EFF7FE',
    },
    icon: {
      sizeSmall: '20px',
      sizeStandard: '24px',
      sizeLarge: '32px',
    },
  },

  layout: {
    contentMaxWidth: '1200px',
    contentPadding: '20px',
  },
} as const;

export type Theme = typeof theme;

/**
 * Get occupancy color based on percentage
 */
export function getOccupancyColor(percentage: number): string {
  if (percentage <= 50) return theme.colors.occupancy.low;
  if (percentage <= 70) return theme.colors.occupancy.medium;
  if (percentage <= 85) return theme.colors.occupancy.busy;
  return theme.colors.occupancy.high;
}

/**
 * Get occupancy level name based on percentage
 */
export function getOccupancyLevel(percentage: number): 'low' | 'medium' | 'busy' | 'high' {
  if (percentage <= 50) return 'low';
  if (percentage <= 70) return 'medium';
  if (percentage <= 85) return 'busy';
  return 'high';
}
