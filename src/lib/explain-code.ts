import type { Language } from '@/types/playground';

const EXPLAIN_CODE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-code`;

interface ExplainResponse {
  explanation?: unknown;
  error?: unknown;
}

export async function explainCode(code: string, language: Language, signal?: AbortSignal): Promise<string> {
  let response: Response;
  try {
    response = await fetch(EXPLAIN_CODE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ code, language }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new Error('Network error. Check your connection and try again.');
  }

  const payload = (await response.json().catch(() => null)) as ExplainResponse | null;

  if (!response.ok) {
    const message = typeof payload?.error === 'string' ? payload.error : `Request failed (${response.status}).`;
    throw new Error(message);
  }

  if (typeof payload?.explanation !== 'string' || !payload.explanation.trim()) {
    throw new Error('The AI returned an unexpected response. Please try again.');
  }

  return payload.explanation;
}
