import { KioskProject, KioskCategoryItem, KioskReview } from "@/types/kiosk";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003";

export async function fetchKioskCategories(): Promise<KioskCategoryItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/kiosk/categories`, {
      next: { revalidate: 30 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || [];
  } catch (err) {
    console.error("Error fetching kiosk categories:", err);
    return [];
  }
}

export async function fetchKioskProjects(params: {
  category?: string;
  search?: string;
  sort_by?: string;
  page?: number;
  page_size?: number;
  token?: string;
}): Promise<{
  projects: KioskProject[];
  total: number;
  totalPages: number;
}> {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'all') query.set('category', params.category);
  if (params.search) query.set('search', params.search);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.page) query.set('page', params.page.toString());
  if (params.page_size) query.set('page_size', params.page_size.toString());

  const headers: HeadersInit = {};
  if (params.token) {
    headers['Authorization'] = `Bearer ${params.token}`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/kiosk/projects?${query.toString()}`, {
      headers,
      cache: 'no-store'
    });
    if (!res.ok) throw new Error("Failed to fetch kiosk projects");
    const data = await res.json();
    return {
      projects: data.projects || [],
      total: data.total || 0,
      totalPages: data.total_pages || 0
    };
  } catch (err) {
    console.error("fetchKioskProjects error:", err);
    return { projects: [], total: 0, totalPages: 0 };
  }
}

export async function fetchTrendingProjects(token?: string): Promise<KioskProject[]> {
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}/api/v1/kiosk/projects/trending?limit=6`, {
      headers,
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.projects || [];
  } catch (err) {
    console.error("fetchTrendingProjects error:", err);
    return [];
  }
}

export async function fetchProjectDetails(id: string, token?: string): Promise<KioskProject | null> {
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}/api/v1/kiosk/projects/${id}`, {
      headers,
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.project || null;
  } catch (err) {
    console.error(`fetchProjectDetails (${id}) error:`, err);
    return null;
  }
}

export async function recordProjectClick(id: string): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/kiosk/projects/${id}/click`, {
      method: "POST"
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.clicks_count || 0;
  } catch (err) {
    return 0;
  }
}

export async function toggleProjectLike(id: string, token: string): Promise<{ is_liked: boolean; likes_count: number }> {
  const res = await fetch(`${API_BASE}/api/v1/kiosk/projects/${id}/like`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("فشل تحديث الإعجاب");
  return res.json();
}

export async function submitProjectReview(
  id: string,
  payload: { rating: number; comment: string },
  token: string
): Promise<{ review: KioskReview; project_stats: any; message?: string; status?: string }> {
  const res = await fetch(`${API_BASE}/api/v1/kiosk/projects/${id}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "فشل إرسال التقييم");
  }
  return res.json();
}

export async function uploadKioskImage(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/v1/kiosk/upload-image`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "فشل رفع الصورة");
  }
  const data = await res.json();
  // Return relative URL so it is domain and environment independent
  return data.url;
}

export function formatWhatsAppUrl(rawPhone: string, message?: string): string {
  let phone = rawPhone.replace(/\D/g, "");
  if (phone.startsWith("00")) {
    phone = phone.substring(2);
  }
  // Palestinian / Jordanian prefix normalization
  if (phone.startsWith("059") || phone.startsWith("056")) {
    phone = "970" + phone.substring(1);
  } else if (phone.startsWith("079") || phone.startsWith("078") || phone.startsWith("077")) {
    phone = "962" + phone.substring(1);
  }
  const textParam = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${phone}${textParam}`;
}

export async function submitKioskProject(
  payload: {
    title: string;
    category: string;
    description: string;
    price_range?: string;
    whatsapp_number: string;
    campus_locations: string[];
    images: string[];
    owner_faculty?: string;
  },
  token: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/kiosk/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "فشل تسجيل المشروع");
  }
  return res.json();
}

export async function fetchMyKioskProjects(token: string): Promise<KioskProject[]> {
  const res = await fetch(`${API_BASE}/api/v1/kiosk/my-projects`, {
    headers: {
      "Authorization": `Bearer ${token}`
    },
    cache: "no-store"
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.projects || [];
}

// Admin APIs
export async function adminFetchKioskProjects(status: string = "all", token: string): Promise<KioskProject[]> {
  const query = status && status !== "all" ? `?status=${status}` : "";
  const res = await fetch(`${API_BASE}/api/v1/kiosk/admin/projects${query}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    },
    cache: "no-store"
  });
  if (!res.ok) throw new Error("فشل جلب المشاريع للإدارة");
  const data = await res.json();
  return data.projects || [];
}

export async function adminUpdateKioskProjectStatus(
  id: string,
  status: "approved" | "rejected" | "archived",
  rejectionReason: string,
  token: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/v1/kiosk/admin/projects/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      status,
      rejection_reason: rejectionReason
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "فشل تحديث حالة المشروع");
  }
  return res.json();
}
