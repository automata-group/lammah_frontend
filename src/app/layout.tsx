import type { Metadata } from "next";
import { Alexandria } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Footer from "@/components/Footer";
import GlobalAnnouncementBanner from "@/components/GlobalAnnouncementBanner";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import NavigationProgressBar from "@/components/NavigationProgressBar";

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: '--font-alexandria',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://lammah.site"),
  title: "منصة لمّاح | تخطيط السلايدات وكتابة كل ملاحظات الدكتور",
  description: "ارفع فويس المحاضرة والسلايدات؛ لمّاح يكتب لك كل كلمة وملاحظة حكاها الدكتور، يظلل السلايدات المهمة، ويصيد أسئلة الامتحان المتوقعة بملف PDF جاهز للطباعة فوراً!",
  keywords: [
    "تخطيط السلايدات",
    "تفريغ المحاضرات",
    "ملاحظات الدكتور",
    "تظليل السلايدات",
    "ملخصات جامعية",
    "أسئلة الامتحان المتوقعة",
    "دفاتر دراسية",
    "لمّاح",
    "Lammah"
  ],
  creator: "Automata",
  publisher: "Automata Group",
  authors: [
    { name: "Automata", url: "https://lammah.site" }
  ],
  openGraph: {
    title: "منصة لمّاح | تخطيط السلايدات وكتابة كل ملاحظات الدكتور",
    description: "ارفع فويس المحاضرة والسلايدات؛ لمّاح يكتب لك كل كلمة وملاحظة حكاها الدكتور، يظلل السلايدات المهمة، ويصيد أسئلة الامتحان المتوقعة بملف PDF جاهز للطباعة فوراً!",
    siteName: "منصة لمّاح | Lammah",
    url: "https://lammah.site",
    images: [
      {
        url: "https://lammah.site/og-image.png",
        secureUrl: "https://lammah.site/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "منصة لمّاح الذكية",
      },
      {
        url: "https://lammah.site/lammah-logo.png",
        secureUrl: "https://lammah.site/lammah-logo.png",
        width: 502,
        height: 497,
        type: "image/png",
        alt: "شعار لمّاح",
      }
    ],
    locale: "ar_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "منصة لمّاح | تخطيط السلايدات وكتابة كل ملاحظات الدكتور",
    description: "ارفع فويس المحاضرة والسلايدات؛ لمّاح يكتب لك كل كلمة وملاحظة حكاها الدكتور، يظلل السلايدات المهمة، ويصيد أسئلة الامتحان المتوقعة بملف PDF جاهز للطباعة فوراً!",
    images: ["https://lammah.site/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="image_src" href="https://lammah.site/og-image.png" />
        <meta property="og:image" content="https://lammah.site/og-image.png" />
        <meta property="og:image:secure_url" content="https://lammah.site/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="منصة لمّاح | تخطيط السلايدات وكتابة كل ملاحظات الدكتور" />
        {/* Structured Data (Schema.org) documenting Automata ownership to Google & search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "منصة لمّاح | تخطيط السلايدات وكتابة كل ملاحظات الدكتور",
              "alternateName": "Lammah",
              "description": "ارفع فويس المحاضرة والسلايدات؛ لمّاح يكتب لك كل كلمة وملاحظة حكاها الدكتور، يظلل السلايدات المهمة، ويصيد أسئلة الامتحان المتوقعة بملف PDF جاهز للطباعة فوراً!", 
              "url": "https://lammah.site",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "All",
              "creator": {
                "@type": "Organization",
                "name": "Automata",
                "alternateName": "Automata Group",
                "url": "https://lammah.site"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Automata",
                "alternateName": "Automata Group",
                "url": "https://lammah.site"
              }
            }),
          }}
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

              // Auto-recover from ChunkLoadError caused by new deployments
              window.addEventListener('error', function(e) {
                var msg = (e && e.message) ? e.message : '';
                if (msg.indexOf('ChunkLoadError') !== -1 || msg.indexOf('Failed to load chunk') !== -1 || msg.indexOf('Loading chunk') !== -1) {
                  var key = 'last_chunk_reload';
                  var last = sessionStorage.getItem(key);
                  var now = Date.now();
                  if (!last || now - Number(last) > 10000) {
                    sessionStorage.setItem(key, String(now));
                    window.location.reload();
                  }
                }
              });
            `,
          }}
        />
      </head>
      <body className={`${alexandria.variable} font-sans antialiased bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col min-h-screen`}>
        <NavigationProgressBar />
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
