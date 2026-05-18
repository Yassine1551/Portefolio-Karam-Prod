'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';

export type Language = 'ar' | 'en' | 'fr';

interface SettingsContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations['ar']) => string;
}

const translations = {
  ar: {
    gallery: 'المعرض',
    about_contact: 'عني / تواصل معي',
    images: 'الصور',
    videos: 'الفيديوهات',
    workshops: 'الورشات التكوينية',
    add_item: 'إضافة عمل جديد',
    all: 'الكل',
    hero_title: 'اسمي سعيد، أعمل كمصمم ومونتير فيديو. تصفح أحدث مشاريعي الإبداعية.',
    hero_scroll: 'قم بالتمرير للأسفل لرؤية أعمالي!',
    gallery_desc: 'نظرة على أحدث الأعمال والمشاريع. يتم عرض الفيديوهات عبر روابط خارجية لضمان سرعة تصفح الموقع، بينما تم تحسين الصور للعرض الأمثل.',
    contact_title: 'لنتحدث عن مشروعك القادم.',
    contact_desc: 'سواء كنت تبحث عن تصميم جديد، أو ترغب في إنتاج فيديو احترافي، أنا هنا لتحويل أفكارك إلى واقع.',
    name: 'الاسم',
    name_placeholder: 'اسمك الكريم',
    email: 'البريد الإلكتروني',
    message: 'رسالتك',
    message_placeholder: 'كيف يمكنني مساعدتك؟',
    send: 'إرسال',
    sending: 'جاري الإرسال...',
    success: 'تم الإرسال بنجاح!',
    success_desc: 'شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.',
    send_another: 'إرسال رسالة أخرى',
    edit_mode: 'وضع التحكم',
    exit_edit: 'إنهاء التعديل',
    item_type: 'نوع العمل',
    image: 'صورة',
    video_link: 'رابط فيديو',
    link: 'الرابط',
    title: 'العنوان',
    short_desc: 'وصف قصير',
    add: 'إضافة',
    download_cv: 'تحميل السيرة الذاتية'
  },
  en: {
    gallery: 'Gallery',
    about_contact: 'About / Contact',
    images: 'Images',
    videos: 'Videos',
    workshops: 'Workshops',
    add_item: 'Add New Item',
    all: 'All',
    hero_title: 'My name is Said, I work as a Designer and Video Editor. Browse my latest creative projects.',
    hero_scroll: 'Scroll down to see my work!',
    gallery_desc: 'A look at recent work and projects. Videos are linked externally for performance, while images are optimized for the best viewing experience.',
    contact_title: "Let's talk about your next project.",
    contact_desc: "Whether you're looking for a new design or professional video production, I'm here to turn your ideas into reality.",
    name: 'Name',
    name_placeholder: 'Your Name',
    email: 'Email',
    message: 'Message',
    message_placeholder: 'How can I help you?',
    send: 'Send',
    sending: 'Sending...',
    success: 'Sent Successfully!',
    success_desc: 'Thank you for reaching out. We will get back to you as soon as possible.',
    send_another: 'Send Another Message',
    edit_mode: 'Edit Mode',
    exit_edit: 'Exit Edit Mode',
    item_type: 'Item Type',
    image: 'Image',
    video_link: 'Video Link',
    link: 'Link',
    title: 'Title',
    short_desc: 'Short Description',
    add: 'Add',
    download_cv: 'Download CV'
  },
  fr: {
    gallery: 'Galerie',
    about_contact: 'À propos / Contact',
    images: 'Images',
    videos: 'Vidéos',
    workshops: 'Ateliers',
    add_item: 'Ajouter un projet',
    all: 'Tout',
    hero_title: 'Je m\'appelle Said, je suis Designer et Monteur vidéo. Découvrez mes récents projets créatifs.',
    hero_scroll: 'Faites défiler pour voir mon travail !',
    gallery_desc: 'Un aperçu des travaux récents. Les vidéos sont liées en externe pour des performances optimales.',
    contact_title: 'Parlons de votre prochain projet.',
    contact_desc: 'Que vous recherchiez un nouveau design ou une production vidéo professionnelle, je suis là pour concrétiser vos idées.',
    name: 'Nom',
    name_placeholder: 'Votre nom',
    email: 'E-mail',
    message: 'Message',
    message_placeholder: 'Comment puis-je vous aider ?',
    send: 'Envoyer',
    sending: 'Envoi en cours...',
    success: 'Envoyé avec succès !',
    success_desc: 'Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.',
    send_another: 'Envoyer un autre message',
    edit_mode: 'Mode Édition',
    exit_edit: 'Quitter',
    item_type: 'Type de projet',
    image: 'Image',
    video_link: 'Lien Vidéo',
    link: 'Lien',
    title: 'Titre',
    short_desc: 'Description courte',
    add: 'Ajouter',
    download_cv: 'Télécharger CV'
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * Internal state abstraction orchestrating translation dictionaries, localized routing, 
 * and persistent storage of layout preference values across render boundary trees.
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Synchronize localized contextual settings automatically
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const savedLang = localStorage.getItem('port_lang') as Language;
    if (savedLang && ['ar', 'en', 'fr'].includes(savedLang)) {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('port_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }, [lang, mounted]);

  const t = (key: keyof typeof translations['ar']) => {
    return translations[lang][key] || translations['ar'][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ lang, setLang, t }}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
