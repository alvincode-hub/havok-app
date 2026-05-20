import { appConfig } from "@/src/api/apiConfig";
import { logApiDebug, logApiError } from "@/src/utils/debug";

export interface CreateAttestationInput {
  appVersion: string;
  challenge: string;
  installationId: string;
  platform: string;
}

export interface AttestationPayload {
  payload: Record<string, unknown>;
  provider: string;
}

export interface AttestationProvider {
  createAttestation: (
    input: CreateAttestationInput,
  ) => Promise<AttestationPayload>;
}

const developmentAttestationProvider: AttestationProvider = {
  async createAttestation(input) {
    logApiDebug("attestation.development", {
      appVersion: input.appVersion,
      platform: input.platform,
    });

    return {
      provider: "development",
      payload: {
        appVersion: input.appVersion,
        challenge: input.challenge,
        installationId: input.installationId,
        platform: input.platform,
      },
    };
  },
};

function getAttestationProvider(): AttestationProvider {
  if (appConfig.attestationMode === "development") {
    return developmentAttestationProvider;
  }

  return {
    async createAttestation() {
      const error = new Error(
        `Le mode d attestation "${appConfig.attestationMode}" n est pas encore disponible dans le client.`,
      );
      logApiError("attestation.unsupported_mode", error, {
        attestationMode: appConfig.attestationMode,
      });
      throw error;
    },
  };
}

export async function createAppAttestation(input: CreateAttestationInput) {
  return getAttestationProvider().createAttestation(input);
}
