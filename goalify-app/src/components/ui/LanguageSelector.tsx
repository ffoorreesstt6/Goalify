import { useEffect, useState } from "react";

export function LanguageSelector({ className = "" }: { className?: string }) {
  const [lang, setLang] = useState(() => {
    // Try to get language from cookie
    if (typeof window !== "undefined") {
      const match = document.cookie.match(/(?:^|; )lang=([^;]*)/);
      return match ? decodeURIComponent(match[1]) : "en";
    }
    return "en";
  });

  useEffect(() => {
    // Set the language attribute on the HTML element
    document.documentElement.lang = lang;
    // Save to cookie
    document.cookie = `lang=${encodeURIComponent(lang)}; path=/; max-age=31536000`; // 1 year
  }, [lang]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value);
  };

  return (
    <select
      value={lang}
      onChange={handleChange}
      className={`flex h-10 w-14 items-center rounded-xl border border-white/10 bg-white/5 px-2 text-sm outline-none focus:border-accent-purple/60 ${className}`}
    >
      <option value="en">English</option>
      <option value="de">Deutsch</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
      <option value="sq">Shqip</option>
    </select>
  );
}
