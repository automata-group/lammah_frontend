"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { UploadedAudio, QuotaCostBreakdown } from "./types";
import { getApiBaseUrl } from "@/lib/apiConfig";

interface UseSummarizeQuotaProps {
  session: any;
  audioDuration: number;
  multiAudioFiles: UploadedAudio[];
  pdfFile: File | null;
  pdfTempId: string | null;
  startPage: string;
  endPage: string;
  pdfDetectedPages: number | null;
}

export function useSummarizeQuota({
  session,
  audioDuration,
  multiAudioFiles,
  pdfFile,
  pdfTempId,
  startPage,
  endPage,
  pdfDetectedPages,
}: UseSummarizeQuotaProps) {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [quota, setQuota] = useState<number | null>(null);
  const [planName, setPlanName] = useState<string>("");
  const [isQuotaChecking, setIsQuotaChecking] = useState<boolean>(true);

  // Load from localStorage only after initial mount to prevent SSR hydration mismatch (React error #418)
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const cachedQuota = localStorage.getItem("cached_user_quota");
      if (cachedQuota !== null && !isNaN(Number(cachedQuota))) {
        setQuota(Number(cachedQuota));
        setIsQuotaChecking(false);
      }
      const cachedPlan = localStorage.getItem("cached_user_plan");
      if (cachedPlan) {
        setPlanName(cachedPlan);
      }
    }
  }, []);

  // Calculate live transparent quota deduction cost
  const quotaCostBreakdown: QuotaCostBreakdown = useMemo(() => {
    const hasSingleAudio = audioDuration > 0;
    const hasMultiAudio = multiAudioFiles.length > 0;
    const hasAudio = hasSingleAudio || hasMultiAudio;
    const hasPdf = Boolean(pdfFile || pdfTempId);

    // 1. Audio Cost
    let audioCostMinutes = 0;
    if (hasMultiAudio) {
      audioCostMinutes = multiAudioFiles.reduce((acc, f) => {
        const secs = f.duration || 0;
        return acc + Math.max(5, Math.ceil(secs / 60));
      }, 0);
    } else if (hasSingleAudio) {
      audioCostMinutes = Math.max(5, Math.ceil(audioDuration / 60));
    }

    // 2. Selected pages calculation
    let selectedPages = 10;
    if (pdfDetectedPages && pdfDetectedPages > 0) {
      const s = parseInt(startPage, 10);
      const e = parseInt(endPage, 10);
      const validStart = !isNaN(s) && s >= 1 ? s : 1;
      const validEnd = !isNaN(e) && e >= validStart ? Math.min(e, pdfDetectedPages) : pdfDetectedPages;
      selectedPages = Math.max(1, validEnd - validStart + 1);
    } else if (startPage && endPage) {
      const s = parseInt(startPage, 10);
      const e = parseInt(endPage, 10);
      if (!isNaN(s) && !isNaN(e) && e >= s) {
        selectedPages = Math.max(1, e - s + 1);
      }
    }

    // 3. Document-only mode: 1 minute per 2 slides, minimum 3 minutes. Free if audio is attached!
    const docCostMinutes = hasPdf && !hasAudio ? Math.max(3, Math.ceil(selectedPages / 2)) : 0;
    const totalCost = hasAudio ? audioCostMinutes : docCostMinutes;

    const currentQuota = quota ?? 0;
    const remainingAfter = Math.max(0, currentQuota - totalCost);
    const isSufficient = currentQuota >= totalCost;
    const missingMinutes = isSufficient ? 0 : totalCost - currentQuota;

    return {
      audioCostMinutes,
      selectedPages,
      docCostMinutes,
      totalCost,
      currentQuota,
      remainingAfter,
      isSufficient,
      missingMinutes,
    };
  }, [audioDuration, multiAudioFiles, pdfFile, pdfTempId, startPage, endPage, pdfDetectedPages, quota]);

  // Determine active paid plan status
  const hasPaidPlan = Boolean(
    (quota !== null && quota > 0) ||
    (planName &&
      planName !== "free" &&
      planName !== "مجاني" &&
      !planName.includes("مجاني") &&
      !planName.toLowerCase().includes("free"))
  );

  // Fetch Quota with Backend + Direct Supabase Fallback
  const fetchQuota = useCallback(async () => {
    if (!session?.access_token) return;
    let resolved = false;

    // 1. Try Backend API
    try {
      const fp = typeof window !== "undefined" ? localStorage.getItem("device_id_v3") || "" : "";
      const r = await fetch(`${getApiBaseUrl()}/api/v1/subscription/quota`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "X-Fingerprint": String(fp),
        },
      });

      if (r.ok) {
        const data = await r.json();
        if (data.quota_remaining !== undefined) {
          const qVal = Number(data.quota_remaining);
          const pName = data.plan_name || "";
          setQuota(qVal);
          setPlanName(pName);
          setIsQuotaChecking(false);
          resolved = true;
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("cached_user_quota", String(qVal));
              localStorage.setItem("cached_user_plan", pName);
            } catch {}
          }
          return;
        }
      }
    } catch (e) {
      console.warn("Backend quota check fallback to Supabase:", e);
    }

    // 2. Direct Supabase Fallback
    if (!resolved && session?.user?.id) {
      try {
        const supabase = createClient();
        const { data: subData } = await supabase
          .from("user_subscriptions")
          .select("*, subscription_plans(*)")
          .eq("user_id", session.user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (subData?.subscription_plans) {
          const spName = subData.subscription_plans.name || "باقة نشطة";
          const remaining = Math.max(0, (subData.subscription_plans.lecture_quota || 0) - (subData.lectures_used || 0));
          setQuota(remaining);
          setPlanName(spName);
          setIsQuotaChecking(false);
          resolved = true;
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("cached_user_quota", String(remaining));
              localStorage.setItem("cached_user_plan", spName);
            } catch {}
          }
          return;
        }

        // Profile quota check (safeguarded against RLS recursion)
        try {
          const { data: prof, error: profErr } = await supabase
            .from("profiles")
            .select("quota_remaining, current_plan_id")
            .eq("id", session.user.id)
            .maybeSingle();

          if (!profErr && prof) {
            const pQuota = prof.quota_remaining ?? 0;
            setQuota(pQuota);
            if (pQuota > 0) setPlanName("باقة نشطة");
            setIsQuotaChecking(false);
            resolved = true;
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("cached_user_quota", String(pQuota));
                if (pQuota > 0) localStorage.setItem("cached_user_plan", "باقة نشطة");
              } catch {}
            }
            return;
          }
        } catch (profErr) {
          console.warn("Supabase profile check skipped:", profErr);
        }
      } catch (sbErr) {
        console.warn("Direct Supabase fallback error:", sbErr);
      }
    }

    setIsQuotaChecking(false);
  }, [session]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  return {
    quota,
    setQuota,
    planName,
    isQuotaChecking,
    hasPaidPlan,
    isMounted,
    quotaCostBreakdown,
    fetchQuota,
  };
}
