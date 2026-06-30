import type { ApiKeyRecord, Site, SetupStatus } from "@/lib/types";

export function deriveSetupStatus(site: Site | null, keys: ApiKeyRecord[]): SetupStatus {
  const actionCount =
    site?.agentContract && Array.isArray(site.agentContract.actions)
      ? site.agentContract.actions.length
      : 0;
  const hasContract = actionCount > 0;
  const activeKeys = keys.filter((k) => !k.revoked && k.kind === "pk");
  const hasKeys = activeKeys.length > 0;

  return {
    hasContract,
    hasKeys,
    actionCount,
    isLive: hasContract && hasKeys,
  };
}
