import { supabase } from "@/integrations/supabase/client";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

/**
 * Sube la foto de perfil al bucket "avatars" bajo la carpeta del usuario
 * y devuelve el path guardable en profiles.avatar_url.
 * Limpia versiones anteriores con otra extensión para no dejar huérfanos.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = EXT_BY_TYPE[file.type] ?? "jpg";
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;

  const stale = Object.values(EXT_BY_TYPE)
    .filter((e) => e !== ext)
    .map((e) => `${userId}/avatar.${e}`);
  await supabase.storage.from("avatars").remove(stale).catch(() => {});

  return path;
}
