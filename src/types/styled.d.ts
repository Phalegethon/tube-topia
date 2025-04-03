import 'styled-components';
import theme from '@/styles/theme'; // Restore import

// Restore type inference
type Theme = typeof theme;

// Remove explicit definition
/*
interface CustomTheme {
  colors: {
    primary: string;
    background: string;
    text: string;
    white: string;
    border: string;
    shadow: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: string;
}
*/

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends Theme {} // Use interface extension with inference and disable eslint rule
}