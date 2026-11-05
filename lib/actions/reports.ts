"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface LocationItem {
  id: string;
  campus_name: string;
  building_name: string;
  floor: string | null;
  room_or_area: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description: string | null;
}

export interface ReportDetailData {
  id: string;
  title: string;
  description: string;
  current_status: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  location?: {
    campus_name: string;
    building_name: string;
    floor: string | null;
    room_or_area: string;
  } | null;
  category?: {
    name: string;
  } | null;
  reporter?: {
    name: string;
    identity_number: string | null;
    email: string;
  } | null;
  report_images: {
    id?: string;
    storage_path: string;
    mime_type?: string;
    file_size?: number;
  }[];
  report_status_logs: {
    id: string;
    previous_status: string | null;
    new_status: string;
    notes: string | null;
    created_at: string;
    changed_by_user?: {
      name: string;
      role: string;
    } | null;
  }[];
}

export async function getMasterData() {
  const supabase = createAdminClient();

  const [locationsRes, categoriesRes] = await Promise.all([
    supabase
      .from("locations")
      .select("id, campus_name, building_name, floor, room_or_area")
      .eq("is_active", true)
      .order("campus_name", { ascending: true })
      .order("building_name", { ascending: true }),
    supabase
      .from("facility_categories")
      .select("id, name, description")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  return {
    locations: (locationsRes.data || []) as LocationItem[],
    categories: (categoriesRes.data || []) as CategoryItem[],
  };
}

export async function submitPublicReport(formData: FormData) {
  try {
    const supabase = createAdminClient();

    const name = (formData.get("name") as string)?.trim();
    const nim = (formData.get("nim") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim() || null;
    const locationId = formData.get("locationId") as string;
    const categoryId = formData.get("categoryId") as string;
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const faculty = (formData.get("faculty") as string)?.trim();

    if (!name || !nim || !locationId || !categoryId || !title || !description) {
      return { success: false, error: "Semua kolom wajib diisi dengan lengkap." };
    }

    const finalDescription = faculty
      ? `[Fakultas Pelapor: ${faculty}]\n${description}`
      : description;

    // 1. Cek atau Buat User Mahasiswa di tabel `users`
    const studentEmail = `${nim}@student.unesa.ac.id`;
    let reporterId: string;

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .or(`identity_number.eq.${nim},email.eq.${studentEmail}`)
      .maybeSingle();

    if (existingUser) {
      reporterId = existingUser.id;
    } else {
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({
          name,
          email: studentEmail,
          identity_number: nim,
          role: "student",
          phone_number: phone,
        })
        .select("id")
        .single();

      if (userError || !newUser) {
        console.error("Gagal membuat user mahasiswa:", userError);
        return { success: false, error: "Gagal memverifikasi identitas pelapor." };
      }
      reporterId = newUser.id;
    }

    // 2. Insert Laporan ke tabel `reports`
    const { data: newReport, error: reportError } = await supabase
      .from("reports")
      .insert({
        reporter_id: reporterId,
        location_id: locationId,
        category_id: categoryId,
        title,
        description: finalDescription,
        current_status: "submitted",
      })
      .select("id, created_at")
      .single();

    if (reportError || !newReport) {
      console.error("Gagal menyimpan laporan:", reportError);
      return { success: false, error: "Gagal menyimpan laporan ke sistem." };
    }

    // 3. Upload File Bukti Gambar jika ada (Maksimal 5 foto)
    const rawImages = [
      ...formData.getAll("images"),
      ...formData.getAll("image"),
    ].filter((f): f is File => f instanceof File && f.size > 0);

    const imageFiles = rawImages.slice(0, 5);

    for (let i = 0; i < imageFiles.length; i++) {
      const img = imageFiles[i];
      const fileExt = img.name.split(".").pop() || "webp";
      const fileName = `${newReport.id}_${Date.now()}_${i}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const fileBuffer = await img.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from("report-attachments")
        .upload(filePath, fileBuffer, {
          contentType: img.type || "image/webp",
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("report-attachments")
          .getPublicUrl(filePath);

        await supabase.from("report_images").insert({
          report_id: newReport.id,
          storage_path: publicUrlData.publicUrl || filePath,
          file_size: img.size,
          mime_type: img.type || "image/webp",
        });
      } else {
        console.warn(`Gagal upload lampiran gambar ke-${i + 1}:`, uploadError);
      }
    }

    return {
      success: true,
      reportId: newReport.id,
      nim,
      name,
    };
  } catch (error: unknown) {
    console.error("Submit report error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan internal server.",
    };
  }
}

export async function searchReportsByNimOrId(keyword: string) {
  try {
    const supabase = createAdminClient();
    const query = keyword.trim();

    if (!query) {
      return { success: false, error: "Masukkan NIM, NIP, atau Kode Tiket Laporan." };
    }

    const cleanQuery = query.replace(/^SAFA-/i, "").replace(/-/g, "").toLowerCase();
    const isFullUuid = /^[0-9a-f]{32}$/i.test(cleanQuery);
    const isShortTicket = /^[0-9a-f]{8}$/i.test(cleanQuery);

    let dbQuery = supabase
      .from("reports")
      .select(`
        id,
        title,
        description,
        current_status,
        rejection_reason,
        created_at,
        updated_at,
        location:locations(campus_name, building_name, floor, room_or_area),
        category:facility_categories(name),
        reporter:users(name, identity_number),
        report_images(storage_path)
      `);

    if (isFullUuid) {
      const fullUuid = `${cleanQuery.slice(0, 8)}-${cleanQuery.slice(8, 12)}-${cleanQuery.slice(12, 16)}-${cleanQuery.slice(16, 20)}-${cleanQuery.slice(20)}`;
      dbQuery = dbQuery.eq("id", fullUuid);
    } else if (isShortTicket) {
      dbQuery = dbQuery
        .gte("id", `${cleanQuery}-0000-0000-0000-000000000000`)
        .lte("id", `${cleanQuery}-ffff-ffff-ffff-ffffffffffff`);
    } else {
      // Cari ID user dengan NIM atau NIP tersebut
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("identity_number", query)
        .maybeSingle();

      if (!user) {
        return { success: true, reports: [] };
      }

      dbQuery = dbQuery.eq("reporter_id", user.id).order("created_at", { ascending: false });
    }

    const { data: reports, error } = await dbQuery;

    if (error) {
      console.error("Error search reports:", error);
      return { success: false, error: "Gagal mengambil data laporan." };
    }

    const normalizedReports = (reports || []).map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: row.id as string,
        title: row.title as string,
        description: row.description as string,
        current_status: row.current_status as string,
        created_at: row.created_at as string,
        location: (Array.isArray(row.location) ? row.location[0] : row.location) as {
          campus_name: string;
          building_name: string;
          room_or_area: string;
        } | null,
        category: (Array.isArray(row.category) ? row.category[0] : row.category) as { name: string } | null,
        reporter: (Array.isArray(row.reporter) ? row.reporter[0] : row.reporter) as { name: string; identity_number: string | null } | null,
        report_images: (row.report_images || []) as { storage_path: string }[],
      };
    });

    return { success: true, reports: normalizedReports };
  } catch (error: unknown) {
    console.error("Search reports error:", error);
    return { success: false, error: "Terjadi kesalahan pencarian." };
  }
}

export async function getReportDetailWithLogs(reportId: string) {
  try {
    const supabase = createAdminClient();
    const cleanId = reportId.trim().replace(/^SAFA-/i, "").replace(/-/g, "").toLowerCase();
    const isFullUuid = /^[0-9a-f]{32}$/i.test(cleanId);
    const isShortTicket = /^[0-9a-f]{8}$/i.test(cleanId);

    let dbQuery = supabase
      .from("reports")
      .select(`
        id,
        title,
        description,
        current_status,
        rejection_reason,
        created_at,
        updated_at,
        location:locations(campus_name, building_name, floor, room_or_area),
        category:facility_categories(name),
        reporter:users(name, identity_number, email),
        report_images(id, storage_path, mime_type, file_size),
        report_status_logs(
          id,
          previous_status,
          new_status,
          notes,
          created_at,
          changed_by_user:users!report_status_logs_changed_by_fkey(name, role)
        )
      `);

    if (isFullUuid) {
      const fullUuid = `${cleanId.slice(0, 8)}-${cleanId.slice(8, 12)}-${cleanId.slice(12, 16)}-${cleanId.slice(16, 20)}-${cleanId.slice(20)}`;
      dbQuery = dbQuery.eq("id", fullUuid);
    } else if (isShortTicket) {
      dbQuery = dbQuery
        .gte("id", `${cleanId}-0000-0000-0000-000000000000`)
        .lte("id", `${cleanId}-ffff-ffff-ffff-ffffffffffff`);
    } else {
      dbQuery = dbQuery.eq("id", reportId);
    }

    const { data: report, error } = await dbQuery.maybeSingle();

    if (error || !report) {
      return { success: false, error: "Laporan tidak ditemukan." };
    }

    const raw = report as Record<string, unknown>;
    const rawLogs = (raw.report_status_logs || []) as Record<string, unknown>[];
    const normalized = {
      id: raw.id as string,
      title: raw.title as string,
      description: raw.description as string,
      current_status: raw.current_status as string,
      rejection_reason: raw.rejection_reason as string | null,
      created_at: raw.created_at as string,
      updated_at: raw.updated_at as string,
      location: Array.isArray(raw.location) ? raw.location[0] : raw.location,
      category: Array.isArray(raw.category) ? raw.category[0] : raw.category,
      reporter: Array.isArray(raw.reporter) ? raw.reporter[0] : raw.reporter,
      report_images: (raw.report_images || []) as { storage_path: string }[],
      report_status_logs: rawLogs.map((log) => ({
        id: log.id as string,
        previous_status: log.previous_status as string | null,
        new_status: log.new_status as string,
        notes: log.notes as string | null,
        created_at: log.created_at as string,
        changed_by_user: Array.isArray(log.changed_by_user) ? log.changed_by_user[0] : log.changed_by_user,
      })),
    };

    return { success: true as const, report: normalized as ReportDetailData };
  } catch (error: unknown) {
    console.error("Get report detail error:", error);
    return { success: false, error: "Terjadi kesalahan saat memuat detail laporan." };
  }
}
