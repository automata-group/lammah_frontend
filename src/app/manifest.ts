import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'منصة لمّاح - Automata',
    short_name: 'لمّاح',
    description: 'تخطيط السلايدات وكتابة ملاحظات الدكتور وتوليد الدفاتر الذكية لطلاب الجامعات',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#4f46e5',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/lammah-logo.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
