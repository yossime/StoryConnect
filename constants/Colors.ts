/**
 * StoryConnect Color Palette
 * Primary: #111 (Dark)
 * Secondary: #5865F2 (Discord Blue)
 * Action: #16A34A (Green)
 * Error: #DC2626 (Red)
 */

export const Colors = {
  light: {
    primary: '#111111',
    secondary: '#5865F2',
    action: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',
    success: '#10B981',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    card: '#FFFFFF',
    border: '#E5E7EB',
    text: '#111111',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    placeholder: '#D1D5DB',
    disabled: '#F3F4F6',
    shadow: '#000000',
  },
  dark: {
    primary: '#FFFFFF',
    secondary: '#5865F2',
    action: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',
    success: '#10B981',
    background: '#000000',
    surface: '#111111',
    card: '#1A1A1A',
    border: '#374151',
    text: '#FFFFFF',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    placeholder: '#6B7280',
    disabled: '#374151',
    shadow: '#000000',
  },
};

export const StoryColors = {
  gradient: {
    primary: ['#5865F2', '#8B5CF6'],
    secondary: ['#16A34A', '#10B981'],
    danger: ['#DC2626', '#EF4444'],
    warning: ['#F59E0B', '#FBBF24'],
  },
  whatsapp: '#25D366',
  instagram: ['#833AB4', '#FD1D1D', '#FCB045'],
  snapchat: '#FFFC00',
};

export type ColorScheme = 'light' | 'dark';

