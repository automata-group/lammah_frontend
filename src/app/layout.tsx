import type { Metadata } from "next";
import { Alexandria } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Footer from "@/components/Footer";
import GlobalAnnouncementBanner from "@/components/GlobalAnnouncementBanner";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: '--font-alexandria',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://lammah.site"),
  title: "منصة لمّاح | Lammah",
  description: "لمّاح - منصتك الأكاديمية لتفريغ المحاضرات، وتوليد الدفاتر الجمالية، وبنوك الأسئلة المتوقعة",
  openGraph: {
    title: "منصة لمّاح | Lammah",
    description: "لمّاح - منصتك الأكاديمية لتفريغ المحاضرات، وتوليد الدفاتر الجمالية، وبنوك الأسئلة المتوقعة",
    images: [{ url: "/lammah-logo.png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;600;700;800;900&family=Almarai:wght@300;400;700;800&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&family=Baloo+Bhaijaan+2:wght@400;600;700;800&family=Cairo:wght@300;400;600;700;900&family=Caveat:wght@400;600;700&family=Changa:wght@400;600;700;800&family=El+Messiri:wght@400;600;700&family=Katibeh&family=Lalezar&family=Lateef:wght@400;600;700&family=Marhey:wght@400;600;700&family=Noto+Kufi+Arabic:wght@400;600;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Poppins:wght@300;400;600;700&family=Reem+Kufi:wght@400;600;700&family=Tajawal:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('lammah_theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${alexandria.variable} font-sans antialiased bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col min-h-screen`}>
        <ThemeProvider>
          <AuthProvider>
            <AnalyticsTracker />
            <GlobalAnnouncementBanner />
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
