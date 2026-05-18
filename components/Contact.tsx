/**
 * Provides a contact form interface with client-side validation, anti-spam mechanisms,
 * and rate-limiting. Submits payloads to an external email gateway.
 */
'use client';
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { contactSchema } from '@/lib/schemas';
import DOMPurify from 'dompurify';
import { useSettings } from './SettingsProvider';

export function Contact() {
  const { t, lang } = useSettings();
  const [formData, setFormData] = useState({ name: '', email: '', message: '', bot_field: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'rate_limited'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Dispatches the sanitized contact payload to the external email gateway.
   * Includes anti-spam honeypot verification and execution rate limiting.
   *
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Anti-spam honeypot verification: abort request if bot_field is populated
    if (formData.bot_field) return;
    
    // Client-side rate limiting (5-minute threshold)
    const lastSentStr = localStorage.getItem('last_message_sent');
    if (lastSentStr) {
      const lastSentTime = parseInt(lastSentStr, 10);
      const currentTime = new Date().getTime();
      const fiveMins = 5 * 60 * 1000;
      
      if (currentTime - lastSentTime < fiveMins) {
        setStatus('rate_limited');
        setErrorMessage('لقد أرسلت رسالة مؤخراً، يرجى المحاولة بعد بضع دقائق');
        return;
      }
    }

    // Apply RFC 5322 compatible email regular expression boundary check
    if (!emailRegex.test(formData.email)) {
       setValidationErrors({ email: 'يرجى إدخال بريد إلكتروني صحيح' });
       return;
    }

    setStatus('loading');
    setValidationErrors({});
    setErrorMessage('');

    // Sanitize input payloads to mitigate XSS vulnerabilities
    const stripTags = (str: string) => str.replace(/<\/?[^>]+(>|$)/g, "");
    
    const sanitizedData = {
      name: DOMPurify.sanitize(stripTags(formData.name)),
      email: DOMPurify.sanitize(stripTags(formData.email)),
      message: DOMPurify.sanitize(stripTags(formData.message)),
    };

    // Validate sanitized payload against structural schema boundaries
    const result = contactSchema.safeParse(sanitizedData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[issue.path[0] as string] = issue.message;
      });
      setValidationErrors(errors);
      setStatus('idle');
      return;
    }

    try {
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          name: sanitizedData.name,
          email: sanitizedData.email,
          message: sanitizedData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'حدث خطأ ما');
      }

      // Persist latest dispatch timestamp for rate limiting constraints
      localStorage.setItem('last_message_sent', new Date().getTime().toString());

      setStatus('success');
      setFormData({ name: '', email: '', message: '', bot_field: '' });
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  return (
    <section id="contact" className="py-24 px-6 md:px-20 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-tajawal tracking-tight text-zinc-900 dark:text-zinc-50">{t('contact_title')}</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-12 max-w-md">
            {t('contact_desc')}
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <Mail size={20} className="text-zinc-900 dark:text-zinc-100" />
              </div>
              <span className="font-mono text-sm tracking-widest">Saidbouguarne@gmail.com</span>
            </div>
            <a href="tel:+212678021978" className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer w-fit">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <Phone size={20} className="text-zinc-900 dark:text-zinc-100" />
              </div>
              <span dir="ltr" className="font-mono text-sm tracking-widest inline-block text-left">+212 678 021 978</span>
            </a>
            <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <MapPin size={20} className="text-zinc-900 dark:text-zinc-100" />
              </div>
              <span className="tracking-wide">
                {lang === 'fr' ? 'Rabat, Maroc' : lang === 'en' ? 'Rabat, Morocco' : 'الرباط، المغرب'}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <form 
            className={`space-y-6 bg-white dark:bg-zinc-950 p-8 md:p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-opacity ${status === 'success' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
            onSubmit={handleSubmit}
          >
            <input 
               type="text" 
               name="bot_field" 
               className="hidden" 
               style={{ display: 'none' }} 
               value={formData.bot_field}
               onChange={(e) => setFormData({ ...formData, bot_field: e.target.value })} 
            />
            <div className="space-y-2">
              <label className="text-sm uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block">{t('name')}</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full bg-transparent border-b ${validationErrors.name ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} pb-2 focus:border-zinc-900 dark:focus:border-white text-zinc-900 dark:text-zinc-50 outline-none transition-colors`}
                placeholder={t('name_placeholder')}
                required
              />
              {validationErrors.name && <span className="text-red-500 text-xs">{validationErrors.name}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block">{t('email')}</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full bg-transparent border-b ${validationErrors.email ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} pb-2 focus:border-zinc-900 dark:focus:border-white text-zinc-900 dark:text-zinc-50 outline-none transition-colors text-left`}
                placeholder="email@example.com"
                dir="ltr"
                required
              />
              {validationErrors.email && <span className="text-red-500 text-xs">{validationErrors.email}</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm uppercase tracking-widest text-zinc-400 dark:text-zinc-500 block">{t('message')}</label>
              <textarea 
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={`w-full bg-transparent border-b ${validationErrors.message ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'} pb-2 focus:border-zinc-900 dark:focus:border-white text-zinc-900 dark:text-zinc-50 outline-none transition-colors resize-none`}
                placeholder={t('message_placeholder')}
                required
              ></textarea>
              {validationErrors.message && <span className="text-red-500 text-xs">{validationErrors.message}</span>}
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-100 dark:border-red-500/20">
                <AlertCircle size={18} />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold py-4 rounded-xl mt-8 flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t('sending')}
                </>
              ) : (
                <>
                  {t('send')}
                  <Send size={18} className="rtl:rotate-180" />
                </>
              )}
            </button>
          </form>

          {status === 'success' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-emerald-500/20 shadow-sm">
              <CheckCircle2 size={64} className="text-emerald-500 mb-6" />
              <h3 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">{t('success')}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8">{t('success_desc')}</p>
              <button 
                onClick={() => setStatus('idle')}
                className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-6 py-2 rounded-full text-sm transition-colors font-medium"
              >
                {t('send_another')}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
