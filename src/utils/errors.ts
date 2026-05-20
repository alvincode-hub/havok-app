import { ApiConfigError, ApiRequestError } from "@/src/api/client";

export function getUserFacingErrorMessage(error: unknown) {
  if (error instanceof ApiConfigError) {
    return "La configuration de l application est incomplete.";
  }

  if (error instanceof ApiRequestError) {
    return getMappedRequestMessage(error.message, error.status);
  }

  if (error instanceof Error) {
    return getMappedRequestMessage(error.message);
  }

  return "Une erreur est survenue. Reessaie dans un instant.";
}

function getMappedRequestMessage(message: string, status?: number) {
  const normalizedMessage = message.toLowerCase();

  if (status === 404 || normalizedMessage.includes("introuvable")) {
    return "Le contenu demande est introuvable.";
  }

  if (
    status === 401 ||
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("session mobile")
  ) {
    return "La connexion securisee a expire. Reessaie dans un instant.";
  }

  if (
    normalizedMessage.includes("network request failed") ||
    normalizedMessage.includes("fetch") ||
    normalizedMessage.includes("failed to fetch")
  ) {
    return "Impossible de joindre le backend pour le moment.";
  }

  if (status === 429 || normalizedMessage.includes("too many requests")) {
    return "Le serveur recoit trop de demandes. Reessaie un peu plus tard.";
  }

  if (status && status >= 500) {
    return "Le serveur rencontre un probleme temporaire.";
  }

  return "Impossible de charger ce contenu pour le moment.";
}
