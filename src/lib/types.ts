/** NINA API envelope — matches Python engine / console. */
export type NinaError = {
  code: string;
  message: string;
};

export type NinaEnvelope<T> = {
  ok: boolean;
  data: T | null;
  error?: NinaError | null;
  errors?: string[];
  detail?: string;
};

export type Org = {
  id: string;
  name: string;
  dashboardToken?: string;
};

export type AgentContract = {
  actions?: unknown[];
  [key: string]: unknown;
};

export type ProductCatalogRow = {
  id?: string;
  name?: string;
  price?: number | string;
  url?: string;
  [key: string]: unknown;
};

export type Site = {
  id: string;
  name: string;
  baseUrl: string;
  orgId?: string;
  plan?: string;
  agentContract?: AgentContract | null;
  productCatalog?: ProductCatalogRow[];
  allowedOrigins?: string[];
  llmConfig?: unknown;
};

export type PublishableKey = {
  id: string;
  token: string;
  kind?: string;
  environment?: string;
};

export type ApiKeyRecord = {
  id: string;
  siteId: string;
  environment: string;
  kind: string;
  prefix: string;
  revoked: boolean;
  createdAt: number;
  token?: string;
};

export type WizardInitData = {
  org: Org;
  site: Site;
  publishableKey: PublishableKey;
};

export type WizardInitBody = {
  orgName: string;
  ownerEmail?: string | null;
  siteName: string;
  baseUrl: string;
  country?: string;
  currency?: string;
  languages?: string[];
};

export type OnboardingState = {
  org: Org;
  site: Site;
  keyToken: string;
  keyId: string;
  siteId: string;
};

export type WhoamiData = {
  org: Org;
  sites: Site[];
};

export type UsageData = {
  calls?: number;
  lastCallAt?: number;
  plan?: string;
};

export type SetupStatus = {
  hasContract: boolean;
  hasKeys: boolean;
  actionCount: number;
  isLive: boolean;
};
