"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Search, 
  Star, 
  Sparkles, 
  ArrowLeft, 
  BookOpen, 
  MapPin, 
  Loader2,
  Calendar,
  CheckCircle2,
  BookUser
} from "lucide-react";
import Header from "@/components/landing/Header";
import { useAuth } from "@/context/AuthContext";

const UNIVERSITIES = [
  { id: "all", name: "الكل" },
  { id: "جامعة النجاح الوطنية", name: "النجاح" },
  { id: "جامعة بيرزيت", name: "بيرزيت" },
  { id: "جامعة القدس (أبو ديس)", name: "القدس" },
  { id: "جامعة بوليتكنك فلسطين", name: "بوليتكنك" },
  { id: "الجامعة العربية الأمريكية", name: "العربية الأمريكية" },
  { id: "جامعة فلسطين التقنية (خضوري)", name: "خضوري" }
];

export default function TutorsDirectoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/tutoring/tutors`);
      const data = await res.json();
      setTutors(data.tutors || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTutors = tutors.filter((t) => {
    const nameMatch = (t.profiles?.full_name || "").toLowerCase().includes(search.toLowerCase());
    const majorMatch = (t.major || "").toLowerCase().includes(search.toLowerCase());
    const headlineMatch = (t.headline || "").toLowerCase().includes(search.toLowerCase());
    const uniMatch = selectedUniversity === "all" || t.university === selectedUniversity;

    return (nameMatch || majorMatch || headlineMatch) && uniMatch;
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white" dir="rtl">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Global Header */}
      <div className="pt-5 mb-4">
        <Header />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
        
        {/* Premium Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold mb-5 shadow-sm border border-slate-200 dark:border-white/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            دليل المعلمين والحصص الخاصة • قريباً
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight text-slate-900 dark:text-white leading-normal"
          >
            شبكة المعلمين المتفوقين <span className="text-slate-400 font-normal text-2xl md:text-4xl">(قريباً)</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed mb-4"
          >
            نعمل على تدقيق واعتماد نخبة من أوائل الأقسام لتقديم حصص مراجعة وشروحات خاصة لموادك الجامعية. الخدمة قيد الإعداد والإطلاق قريباً في لمّاح.
          </motion.p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100/90 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-semibold">
            <span>حجز الحصص والدروس الخصوصية سيكون متاحاً قريباً مع انطلاق التحديث الرسمي</span>
          </div>
        </div>

        {/* Premium Search & Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-slate-800 rounded-[2rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl">
            <div className="relative mb-4">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم المساق (خوارزميات، تفاضل...)، أو اسم المعلم..."
                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 rounded-[1.5rem] pr-16 pl-6 py-5 text-base md:text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>

            {/* Pill Tabs for Universities */}
            <div className="flex flex-wrap gap-2 px-2">
              {UNIVERSITIES.map((uni) => (
                <button
                  key={uni.id}
                  onClick={() => setSelectedUniversity(uni.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                    selectedUniversity === uni.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {uni.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tutors Grid */}
        {filteredTutors.length === 0 && !loading ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 text-center shadow-[0_20px_50px_rgba(8,112,184,0.04)] dark:shadow-2xl relative overflow-hidden group"
          >
            {/* Empty state bg elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-indigo-100 dark:border-slate-700">
                <BookUser className="w-12 h-12 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">لا يوجد معلمين مطابقين لبحثك</h3>
              <p className="text-slate-600 dark:text-slate-400 text-base max-w-md mx-auto mb-10 leading-relaxed">
                هذه فرصتك الذهبية! كن أول من يدرّس هذه المواد في جامعتك، وشارك علمك مع زملائك واكسب دخلاً إضافياً (50% من كل جلسة).
              </p>
              <button
                onClick={() => router.push("/teach")}
                className="relative overflow-hidden px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 group/btn"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative flex items-center justify-center gap-2">
                  ابدأ رحلتك كمعلم الآن 🚀
                </span>
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTutors.map((tutor, idx) => (
              <motion.div
                key={tutor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(99,102,241,0.08)] dark:shadow-xl relative overflow-hidden"
              >
                {/* Shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent pointer-events-none z-0"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                        {tutor.profiles?.full_name?.charAt(0) || "م"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {tutor.profiles?.full_name || "معلم متميز"}
                          </h3>
                          <span title="معلم موثق">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {tutor.major || "تخصص غير محدد"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1.5 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-black shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400" />
                      <span>{tutor.rating_avg || "5.0"}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-5 leading-relaxed font-medium">
                    {tutor.headline}
                  </p>

                  <div className="flex flex-col gap-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span className="font-semibold">{tutor.university}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                      <GraduationCap className="w-4 h-4 text-indigo-400 dark:text-indigo-500" />
                      <span className="font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-500/20">
                        {tutor.academic_level === "student" ? "طالب متفوق" : "خريج معتمد"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const target = `/tutors/${tutor.id}?book=true`;
                    if (!user) {
                      router.push(`/auth?next=${encodeURIComponent(target)}`);
                    } else {
                      router.push(target);
                    }
                  }}
                  className="relative z-10 w-full py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-indigo-600 text-indigo-700 dark:text-slate-200 hover:text-white border border-slate-200 dark:border-slate-800 hover:border-indigo-600 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-indigo-500/25 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>حجز موعد حصة</span>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
