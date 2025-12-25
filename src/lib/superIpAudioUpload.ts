export type SupabaseUploadResponse = {
  success?: boolean;
  url?: string;
  error?: string;
};

const MAX_AUDIO_BYTES = 20 * 1024 * 1024;
const ALLOWED_EXT = ["mp3", "wav", "m4a"];

export const isAllowedAudioFile = (file: File) => {
  const name = (file.name || "").toLowerCase();
  const ext = name.split(".").pop() || "";
  return ALLOWED_EXT.includes(ext);
};

/**
 * Upload audio to Supabase via backend proxy.
 * Mirrors the existing image upload pattern in App.tsx.
 */
export const uploadSuperIpAudio = async (
  file: File,
  apiPost: (url: string, body: any) => Promise<any>,
): Promise<{ url: string } | { error: string }> => {
  if (!file) return { error: "请选择文件" };
  if (!isAllowedAudioFile(file)) return { error: "仅支持 mp3 / wav / m4a" };
  if (file.size > MAX_AUDIO_BYTES) return { error: "文件不能超过 20MB" };

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "audio");

  const res: SupabaseUploadResponse = await apiPost("/api/supabase/upload", formData);
  if (!res || res.success === false) return { error: res?.error || "上传失败" };
  if (!res.url) return { error: "上传失败：未返回 url" };
  return { url: res.url };
};
