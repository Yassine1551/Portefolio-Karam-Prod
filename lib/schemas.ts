import { z } from 'zod';

export const portfolioItemSchema = z.object({
  type: z.enum(['image', 'youtube', 'workshop', 'video']),
  category: z.enum(['video', 'photo', 'design', 'workshop']).default('photo'),
  url: z.string().url('يجب أن يكون الرابط صحيحاً'),
  title: z.string().min(3, 'العنوان قصير جداً').max(100, 'العنوان طويل جداً'),
  description: z.string().max(500, 'الوصف طويل جداً').optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون أكثر من حرفين').max(50, 'الاسم طويل جداً'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  message: z.string().min(10, 'الرسالة يجب أن تحتوي على 10 أحرف على الأقل').max(1000, 'الرسالة طويلة جداً'),
});
