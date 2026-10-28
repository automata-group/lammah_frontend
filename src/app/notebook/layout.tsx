import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "محرر الدفاتر الأكاديمية | لمّاح",
  description: "محرر وتوليد دفاتر التلخيص الجمالية الملونة",
};

export default function NotebookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* 16 typography fonts isolated strictly to notebook / canvas pages */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&family=Amiri:wght@400;700&family=Aref+Ruqaa:wght@400;700&family=Baloo+Bhaijaan+2:wght@400;700&family=Cairo:wght@400;700&family=Caveat:wght@400;700&family=Changa:wght@400;700&family=El+Messiri:wght@400;700&family=Katibeh&family=Lalezar&family=Lateef:wght@400;700&family=Marhey:wght@400;700&family=Noto+Kufi+Arabic:wght@400;700&family=Playfair+Display:wght@400;700&family=Poppins:wght@400;600&family=Reem+Kufi:wght@400;700&family=Tajawal:wght@400;700&display=swap"
      />
      {children}
    </>
  );
}
