"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Helper functions to get and set cookies
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + value + ';expires=' + expires + ';path=/';
}

export function LanguageSelector() {
  const [lang, setLang] = useState(() => {
    // Try to get language from cookie, default to 'en'
    const cookieLang = getCookie('lang');
    return cookieLang || 'en';
  });
  const router = useRouter();

  useEffect(() => {
    // Set the lang attribute on the html element
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setCookie('lang', newLang, 365); // Store for 1 year
    setLang(newLang);
    // Reload the page to apply the new language on the server side
    router.refresh();
  };

  return (
    <div className="relative">
      <select
        value={lang}
        onChange={handleChange}
        className="block w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="de">Deutsch</option>
        <option value="fr">Français</option>
        <option value="sq">Shqip</option>
      </select>
    </div>
  );
}
