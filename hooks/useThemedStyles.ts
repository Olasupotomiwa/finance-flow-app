// hooks/useThemedStyles.ts
import { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';

export const useThemedStyles = () => {
  const { colors, effectiveTheme } = useTheme();

  const isDark = effectiveTheme === 'dark';

  return useMemo(
    () => ({
      colors,
      isDark,
      container: {
        backgroundColor: colors.background,
      },
      card: {
        backgroundColor: colors.card,
        borderColor: colors.border,
      },
      text: {
        color: colors.text,
      },
      textSecondary: {
        color: colors.textSecondary,
      },
      input: {
        backgroundColor: colors.input,
        borderColor: colors.inputBorder,
        color: colors.text,
      },
    }),
    [colors, isDark]
  );
};