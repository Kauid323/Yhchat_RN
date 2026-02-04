import { Text, useTheme, type TextProps } from 'react-native-paper';

export type ThemedTextProps = TextProps<never> & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  const variant = type === 'title' ? 'headlineLarge' : 
                  type === 'subtitle' ? 'titleLarge' :
                  type === 'defaultSemiBold' ? 'titleMedium' :
                  'bodyLarge';

  return (
    <Text
      variant={variant}
      style={[
        type === 'link' ? { color: theme.colors.primary } : { color: theme.colors.onSurface },
        style,
      ]}
      {...rest}
    />
  );
}
