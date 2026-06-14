import { THEME_STORAGE_KEY } from "@/lib/theme";

export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="night"){document.documentElement.classList.add("dark");}}catch(e){}})();`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
