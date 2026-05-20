export type ThemePreference = "system" | "dark" | "light";

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  border: string;
  text: string;
  textMuted: string;
  placeholder: string;
  accent: string;
  accentMuted: string;
  accentSurface: string;
  brand: string;
  brandSurface: string;
  live: string;
  liveSurface: string;
  danger: string;
  dangerSurface: string;
  success: string;
  overlay: string;
  shadow: string;
  onAccent: string;
  onBrand: string;
}

export interface AppTheme {
  mode: "dark" | "light";
  colors: ThemeColors;
}

export const darkTheme: AppTheme = {
  mode: "dark",
  colors: {
    background: "#070707",
    surface: "#111111",
    surfaceSecondary: "#191919",
    surfaceTertiary: "#141414",
    border: "#2A2A2A",
    text: "#F3F0E8",
    textMuted: "#9A9A9A",
    placeholder: "#6C6C6C",
    accent: "#C8AD63",
    accentMuted: "#806A35",
    accentSurface: "#231D10",
    brand: "#681E2C",
    brandSurface: "#211014",
    live: "#C63434",
    liveSurface: "#2D1313",
    danger: "#C63434",
    dangerSurface: "#261313",
    success: "#C8AD63",
    overlay: "rgba(7, 7, 7, 0.92)",
    shadow: "#000000",
    onAccent: "#111111",
    onBrand: "#F3F0E8",
  },
};

export const lightTheme: AppTheme = {
  mode: "light",
  colors: {
    background: "#F4F1EA",
    surface: "#FFFFFF",
    surfaceSecondary: "#E9E4D8",
    surfaceTertiary: "#F7F4ED",
    border: "#D2CAB9",
    text: "#111111",
    textMuted: "#6E6A62",
    placeholder: "#8A857B",
    accent: "#A88C3D",
    accentMuted: "#6F5928",
    accentSurface: "#F0E8D2",
    brand: "#681E2C",
    brandSurface: "#F2E4E8",
    live: "#B73232",
    liveSurface: "#F6E4E4",
    danger: "#B73232",
    dangerSurface: "#F5E3E3",
    success: "#A88C3D",
    overlay: "rgba(244, 241, 234, 0.94)",
    shadow: "#111111",
    onAccent: "#111111",
    onBrand: "#F3F0E8",
  },
};
