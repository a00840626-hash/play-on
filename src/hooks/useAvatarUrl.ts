import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAvatarUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }
    let cancelled = false;
    supabase.storage
      .from("avatars")
      .createSignedUrl(path, 60 * 60 * 24)
      .then(({ data, error }) => {
        if (!cancelled) {
          if (error || !data?.signedUrl) setUrl(null);
          else setUrl(data.signedUrl);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return url;
}
