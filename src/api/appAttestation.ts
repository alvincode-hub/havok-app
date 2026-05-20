import { appConfig } from "@/src/config/env";

interface CreateAttestationInput {
  challenge: string;
  installationId: string;
  platform: string;
  appVersion: string;
}

export async function createAppAttestation(
  input: CreateAttestationInput
) {
  if (appConfig.attestationMode !== "development") {
    throw new Error(
      `Le mode d'attestation "${appConfig.attestationMode}" n'est pas encore implemente dans le client.`
    );
  }

  return {
    provider: "development",
    payload: {
      challenge: input.challenge,
      installationId: input.installationId,
      platform: input.platform,
      appVersion: input.appVersion,
      issuedAt: new Date().toISOString(),
    },
  };
}
