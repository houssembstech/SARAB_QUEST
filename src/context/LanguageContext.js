'use client';

import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('fr');

  const t = (key) => {
    // Basic translations or just return key if not found
    const translations = {
      fr: {
        back: 'Retour',
        sarabQuestSubtitle: 'Jeu Phygital / Chasse au Trésor',
        accessCode: 'Code d\'accès',
        startMissionBtn: 'Commencer la mission',
        syncingBtn: 'Synchronisation...',
        adminDashboardBtn: 'Tableau de bord Admin'
      }
    };
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
