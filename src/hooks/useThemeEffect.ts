import { useEffect } from "react";
import type { ThemeMode } from "../types/chat";

export function useThemeEffect(theme: ThemeMode): void {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
}
