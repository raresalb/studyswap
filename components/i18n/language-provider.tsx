"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { LangCode, languages } from "@/lib/i18n/translations";

interface LangContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const stored = localStorage.getItem("studyswap-lang") as LangCode | null;
    if (stored && languages.find((l) => l.code === stored)) {
      setLangState(stored);
    } else {
      // Auto-detect from browser
      const browserLang = navigator.language.split("-")[0] as LangCode;
      const supported = languages.find((l) => l.code === browserLang);
      if (supported) setLangState(browserLang);
    }
  }, []);

  const setLang = (newLang: LangCode) => {
    setLangState(newLang);
    localStorage.setItem("studyswap-lang", newLang);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
