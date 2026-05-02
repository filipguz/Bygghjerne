import { createClient } from "@/utils/supabase/client";

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return fetch(`/api/backend${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function apiErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) return "Ugyldig forespørsel.";
    return "Noe gikk galt.";
  } catch {
    if (res.status === 401) return "Du er ikke logget inn.";
    if (res.status === 403) return "Du har ikke tilgang.";
    if (res.status === 502 || res.status === 503) return "Tjenesten er ikke tilgjengelig. Prøv igjen om litt.";
    return `Noe gikk galt (feil ${res.status}).`;
  }
}
