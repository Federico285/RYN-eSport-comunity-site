import type { ApplicationFormValues } from "../schemas/applicationSchema";

export type SubmitResult =
  { success: true } | { success: false; error: string };

const API_TIMEOUT_MS = 10000;

export async function submitApplication(
  values: ApplicationFormValues,
): Promise<SubmitResult> {
  const baseUrl = import.meta.env.VITE_APPLICATION_API_URL || "";
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      signal: controller.signal,
    });

    const data = (await response
      .json()
      .catch(() => null)) as SubmitResult | null;

    if (!response.ok || !data?.success) {
      return {
        success: false,
        error:
          data?.success === false
            ? data.error
            : "Invio non riuscito. Riprova piu tardi.",
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Servizio temporaneamente non disponibile. Riprova tra poco.",
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
