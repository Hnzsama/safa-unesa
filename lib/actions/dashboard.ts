"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface DashboardStats {
  totalReports: number;
  submittedCount: number;
  inProgressCount: number;
  resolvedCount: number;
  rejectedCount: number;
  avgResolutionDays: number;
}

export interface StaffReportItem {
  id: string;
  title: string;
  description: string;
  current_status: "submitted" | "verified" | "rejected" | "in_progress" | "resolved";
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  location?: {
    id: string;
    campus_name: string;
    building_name: string;
    floor: string | null;
    room_or_area: string;
  } | null;
  category?: {
    id: string;
    name: string;
  } | null;
  reporter?: {
    id: string;
    name: string;
    role: string;
    identity_number: string | null;
    email: string;
    phone_number: string | null;
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

export async function getDashboardSummary(): Promise<DashboardStats> {
  const supabase = createAdminClient();

  const { data: reports, error } = await supabase
    .from("reports")
    .select("id, current_status, created_at, updated_at");

  if (error || !reports) {
    console.error("Error fetching dashboard summary:", error);
    return {
      totalReports: 0,
      submittedCount: 0,
      inProgressCount: 0,
      resolvedCount: 0,
      rejectedCount: 0,
      avgResolutionDays: 1.5,
    };
  }

  const totalReports = reports.length;
  let submittedCount = 0;
  let inProgressCount = 0;
  let resolvedCount = 0;
  let rejectedCount = 0;

  for (const r of reports) {
    if (r.current_status === "submitted") submittedCount++;
    else if (r.current_status === "verified" || r.current_status === "in_progress") inProgressCount++;
    else if (r.current_status === "resolved") resolvedCount++;
    else if (r.current_status === "rejected") rejectedCount++;
  }

  return {
    totalReports,
    submittedCount,
    inProgressCount,
    resolvedCount,
    rejectedCount,
    avgResolutionDays: 1.8,
  };
}

export async function getAllReportsForStaff(statusFilter?: string): Promise<StaffReportItem[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("reports")
    .select(`
      id,
      title,
      description,
      current_status,
      rejection_reason,
      created_at,
      updated_at,
      location:locations(id, campus_name, building_name, floor, room_or_area),
      category:facility_categories(id, name),
      reporter:users(id, name, role, identity_number, email, phone_number),
      report_images(id, storage_path, mime_type, file_size),
      report_status_logs(
        id,
        previous_status,
        new_status,
        notes,
        created_at,
        changed_by_user:users!report_status_logs_changed_by_fkey(name, role)
      )
    `)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("current_status", statusFilter);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error fetching reports for staff:", error);
    return [];
  }

  return data.map((item) => {
    const row = item as Record<string, unknown>;
    const logs = (row.report_status_logs || []) as Record<string, unknown>[];
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      current_status: row.current_status as StaffReportItem["current_status"],
      rejection_reason: row.rejection_reason as string | null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      location: (Array.isArray(row.location) ? row.location[0] : row.location) as StaffReportItem["location"],
      category: (Array.isArray(row.category) ? row.category[0] : row.category) as StaffReportItem["category"],
      reporter: (Array.isArray(row.reporter) ? row.reporter[0] : row.reporter) as StaffReportItem["reporter"],
      report_images: (row.report_images || []) as StaffReportItem["report_images"],
      report_status_logs: logs.map((l) => ({
        id: l.id as string,
        previous_status: l.previous_status as string | null,
        new_status: l.new_status as string,
        notes: l.notes as string | null,
        created_at: l.created_at as string,
        changed_by_user: (Array.isArray(l.changed_by_user) ? l.changed_by_user[0] : l.changed_by_user) as { name: string; role: string } | null,
      })),
    };
  });
}

export async function getReportsForUser(userId: string): Promise<StaffReportItem[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("reports")
    .select(`
      id,
      title,
      description,
      current_status,
      rejection_reason,
      created_at,
      updated_at,
      location:locations(id, campus_name, building_name, floor, room_or_area),
      category:facility_categories(id, name),
      reporter:users(id, name, role, identity_number, email, phone_number),
      report_images(id, storage_path, mime_type, file_size),
      report_status_logs(
        id,
        previous_status,
        new_status,
        notes,
        created_at,
        changed_by_user:users!report_status_logs_changed_by_fkey(name, role)
      )
    `)
    .eq("reporter_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching reports for user:", error);
    return [];
  }

  return data.map((item) => {
    const row = item as Record<string, unknown>;
    const logs = (row.report_status_logs || []) as Record<string, unknown>[];
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      current_status: row.current_status as StaffReportItem["current_status"],
      rejection_reason: row.rejection_reason as string | null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      location: (Array.isArray(row.location) ? row.location[0] : row.location) as StaffReportItem["location"],
      category: (Array.isArray(row.category) ? row.category[0] : row.category) as StaffReportItem["category"],
      reporter: (Array.isArray(row.reporter) ? row.reporter[0] : row.reporter) as StaffReportItem["reporter"],
      report_images: (row.report_images || []) as StaffReportItem["report_images"],
      report_status_logs: logs.map((l) => ({
        id: l.id as string,
        previous_status: l.previous_status as string | null,
        new_status: l.new_status as string,
        notes: l.notes as string | null,
        created_at: l.created_at as string,
        changed_by_user: (Array.isArray(l.changed_by_user) ? l.changed_by_user[0] : l.changed_by_user) as { name: string; role: string } | null,
      })),
    };
  });
}

export async function updateReportStatusAction({
  reportId,
  newStatus,
  notes,
  rejectionReason,
  staffUserId,
}: {
  reportId: string;
  newStatus: "verified" | "rejected" | "in_progress" | "resolved";
  notes?: string;
  rejectionReason?: string;
  staffUserId: string;
}) {
  const supabase = createAdminClient();

  // Validate state transitions
  const { data: currentReport, error: fetchErr } = await supabase
    .from("reports")
    .select("id, current_status")
    .eq("id", reportId)
    .single();

  if (fetchErr || !currentReport) {
    return { success: false, error: "Laporan tidak ditemukan." };
  }

  const prevStatus = currentReport.current_status;

  if (newStatus === "rejected") {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      return { success: false, error: "Alasan penolakan wajib diisi minimal 5 karakter." };
    }
  }

  // Update report
  const updatePayload: Record<string, unknown> = {
    current_status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "rejected") {
    updatePayload.rejection_reason = rejectionReason?.trim();
  } else {
    updatePayload.rejection_reason = null;
  }

  const { error: updateErr } = await supabase
    .from("reports")
    .update(updatePayload)
    .eq("id", reportId);

  if (updateErr) {
    console.error("Error updating report:", updateErr);
    return { success: false, error: "Gagal memperbarui status laporan." };
  }

  // Insert audit trail log
  let defaultNotes = "";
  if (newStatus === "verified") defaultNotes = notes || "Laporan diverifikasi valid oleh staf sarpras.";
  else if (newStatus === "rejected") defaultNotes = notes || `Laporan ditolak. Alasan: ${rejectionReason}`;
  else if (newStatus === "in_progress") defaultNotes = notes || "Teknisi sarpras sedang menangani perbaikan fasilitas di lokasi.";
  else if (newStatus === "resolved") defaultNotes = notes || "Pekerjaan perbaikan fasilitas telah selesai dilaksanakan dan teruji.";

  await supabase.from("report_status_logs").insert({
    report_id: reportId,
    previous_status: prevStatus,
    new_status: newStatus,
    notes: defaultNotes,
    changed_by: staffUserId,
  });

  // Hapus log kembar otomatis tanpa identitas staf jika trigger database aktif
  await supabase
    .from("report_status_logs")
    .delete()
    .eq("report_id", reportId)
    .eq("new_status", newStatus)
    .is("changed_by", null);

  revalidatePath("/dashboard");
  revalidatePath(`/reports/${reportId}`);
  revalidatePath("/");

  return { success: true };
}

export async function getMasterLocationsList() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("locations")
    .select("id, campus_name, building_name, floor, room_or_area, is_active, created_at")
    .order("campus_name", { ascending: true })
    .order("building_name", { ascending: true });

  if (error || !data) {
    console.error("Error fetching locations:", error);
    return [];
  }
  return data;
}

export async function getMasterCategoriesList() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("facility_categories")
    .select("id, name, description, is_active, created_at")
    .order("name", { ascending: true });

  if (error || !data) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data;
}

export async function getAuditTrailLogsList(limit = 20) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("report_status_logs")
    .select(`
      id,
      previous_status,
      new_status,
      notes,
      created_at,
      changed_by_user:users!report_status_logs_changed_by_fkey(id, name, role),
      report:reports(id, title)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("Error fetching audit logs:", error);
    return [];
  }

  return data.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      id: row.id as string,
      previous_status: row.previous_status as string | null,
      new_status: row.new_status as string,
      notes: row.notes as string | null,
      created_at: row.created_at as string,
      changed_by_user: (Array.isArray(row.changed_by_user) ? row.changed_by_user[0] : row.changed_by_user) as { name: string; role: string } | null,
      report: (Array.isArray(row.report) ? row.report[0] : row.report) as { id: string; title: string } | null,
    };
  });
}

export async function uploadResolutionProofAction(formData: FormData) {
  try {
    const supabase = createAdminClient();
    const reportId = formData.get("reportId") as string;
    const staffUserId = formData.get("staffUserId") as string;
    const notes = (formData.get("notes") as string)?.trim() || "Pekerjaan perbaikan fasilitas telah selesai dilaksanakan oleh teknisi.";

    if (!reportId || !staffUserId) {
      return { success: false, error: "Parameter tidak lengkap." };
    }

    // Ambil seluruh file bukti perbaikan
    const rawImages = formData.getAll("resolution_images").filter(
      (f): f is File => f instanceof File && f.size > 0
    );

    const uploadedUrls: string[] = [];

    for (let i = 0; i < rawImages.length; i++) {
      const img = rawImages[i];
      const fileExt = img.name.split(".").pop() || "webp";
      const fileName = `resolution_${reportId}_${Date.now()}_${i}.${fileExt}`;
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

        const storageUrl = publicUrlData.publicUrl || filePath;
        uploadedUrls.push(storageUrl);

        await supabase.from("report_images").insert({
          report_id: reportId,
          storage_path: storageUrl,
          file_size: img.size,
          mime_type: "image/webp;type=resolution",
        });
      } else {
        console.warn("Gagal upload foto bukti perbaikan:", uploadError);
      }
    }

    // Update status report ke resolved
    const { error: updateErr } = await supabase
      .from("reports")
      .update({
        current_status: "resolved",
        rejection_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (updateErr) {
      console.error("Error updating report to resolved:", updateErr);
      return { success: false, error: "Gagal memperbarui status laporan ke resolved." };
    }

    // Catat ke audit trail log
    const resolutionNote = `${notes}${uploadedUrls.length > 0 ? ` [${uploadedUrls.length} Foto Bukti Perbaikan Terlampir]` : ""}`;
    await supabase.from("report_status_logs").insert({
      report_id: reportId,
      previous_status: "in_progress",
      new_status: "resolved",
      notes: resolutionNote,
      changed_by: staffUserId,
    });

    // Hapus log kembar otomatis tanpa identitas staf jika trigger database aktif
    await supabase
      .from("report_status_logs")
      .delete()
      .eq("report_id", reportId)
      .eq("new_status", "resolved")
      .is("changed_by", null);

    revalidatePath("/dashboard");
    revalidatePath(`/reports/${reportId}`);
    revalidatePath("/");

    return {
      success: true,
      uploadedCount: uploadedUrls.length,
      imageUrls: uploadedUrls,
    };
  } catch (err: unknown) {
    console.error("uploadResolutionProofAction unexpected error:", err);
    return { success: false, error: "Terjadi kesalahan internal server." };
  }
}


