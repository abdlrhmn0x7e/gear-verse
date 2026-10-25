import {
  pgTable,
  text,
  timestamp,
  boolean,
  bigint,
  integer,
  jsonb,
  foreignKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sessions, users } from "./users";

/**
 * The tables of better-auth's jwt and @better-auth/mcp (OAuth provider) plugins, which let admins connect ChatGPT or
 * Claude to the store's MCP endpoint. Fields follow `npx auth generate`; model names are mapped in `auth.ts`.
 */

export const jwks = pgTable("jwks", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at").notNull(),
  expiresAt: timestamp("expires_at"),
  alg: text("alg"),
  crv: text("crv"),
});

export const oauthClients = pgTable(
  "oauth_clients",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    clientId: text("client_id").notNull().unique(),
    clientSecret: text("client_secret"),
    clientDiscoveryId: text("client_discovery_id"),
    disabled: boolean("disabled").default(false),
    skipConsent: boolean("skip_consent"),
    enableEndSession: boolean("enable_end_session"),
    subjectType: text("subject_type"),
    scopes: text("scopes").array(),
    clientCredentialsScopes: text("client_credentials_scopes")
      .array()
      .default([]),
    userId: bigint("user_id", { mode: "number" }).references(() => users.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
    name: text("name"),
    uri: text("uri"),
    icon: text("icon"),
    contacts: text("contacts").array(),
    tos: text("tos"),
    policy: text("policy"),
    softwareId: text("software_id"),
    softwareVersion: text("software_version"),
    softwareStatement: text("software_statement"),
    redirectUris: text("redirect_uris").array().notNull(),
    postLogoutRedirectUris: text("post_logout_redirect_uris").array(),
    backchannelLogoutUri: text("backchannel_logout_uri"),
    backchannelLogoutSessionRequired: boolean(
      "backchannel_logout_session_required",
    ),
    tokenEndpointAuthMethod: text("token_endpoint_auth_method"),
    applicationType: text("application_type"),
    jwks: text("jwks"),
    jwksUri: text("jwks_uri"),
    grantTypes: text("grant_types").array(),
    responseTypes: text("response_types").array(),
    requirePKCE: boolean("require_pkce"),
    dpopBoundAccessTokens: boolean("dpop_bound_access_tokens").default(false),
    referenceId: text("reference_id"),
    metadata: jsonb("metadata"),
  },
  (table) => [index("oauth_clients_user_id_idx").on(table.userId)],
);

export const oauthResources = pgTable("oauth_resources", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  identifier: text("identifier").notNull().unique(),
  name: text("name").notNull(),
  accessTokenTtl: integer("access_token_ttl"),
  refreshTokenTtl: integer("refresh_token_ttl"),
  signingAlgorithm: text("signing_algorithm"),
  signingKeyId: text("signing_key_id"),
  allowedScopes: text("allowed_scopes").array(),
  customClaims: jsonb("custom_claims"),
  dpopBoundAccessTokensRequired: boolean(
    "dpop_bound_access_tokens_required",
  ).default(false),
  disabled: boolean("disabled").default(false),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
  policyVersion: integer("policy_version").default(1),
  metadata: jsonb("metadata"),
});

export const oauthClientResources = pgTable(
  "oauth_client_resources",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClients.clientId, { onDelete: "cascade" }),
    resourceId: text("resource_id").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at"),
  },
  (table) => [
    // named by hand: the generated name runs past Postgres's 63 characters
    foreignKey({
      name: "oauth_client_resources_resource_id_fk",
      columns: [table.resourceId],
      foreignColumns: [oauthResources.identifier],
    }).onDelete("cascade"),
    uniqueIndex("oauth_client_resources_client_id_resource_id_idx").on(
      table.clientId,
      table.resourceId,
    ),
    index("oauth_client_resources_resource_id_idx").on(table.resourceId),
  ],
);

export const oauthRefreshTokens = pgTable(
  "oauth_refresh_tokens",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    token: text("token").notNull().unique(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClients.clientId, { onDelete: "cascade" }),
    sessionId: bigint("session_id", { mode: "number" }).references(
      () => sessions.id,
      { onDelete: "set null" },
    ),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    authorizationCodeId: text("authorization_code_id"),
    resources: text("resources").array(),
    requestedUserInfoClaims: text("requested_user_info_claims").array(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
    revoked: timestamp("revoked"),
    rotatedAt: timestamp("rotated_at"),
    rotationReplayResponse: text("rotation_replay_response"),
    rotationReplayExpiresAt: timestamp("rotation_replay_expires_at"),
    authTime: timestamp("auth_time"),
    confirmation: jsonb("confirmation"),
    scopes: text("scopes").array().notNull(),
  },
  (table) => [
    index("oauth_refresh_tokens_client_id_idx").on(table.clientId),
    index("oauth_refresh_tokens_session_id_idx").on(table.sessionId),
    index("oauth_refresh_tokens_user_id_idx").on(table.userId),
    index("oauth_refresh_tokens_authorization_code_id_idx").on(
      table.authorizationCodeId,
    ),
  ],
);

export const oauthAccessTokens = pgTable(
  "oauth_access_tokens",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    token: text("token").notNull().unique(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClients.clientId, { onDelete: "cascade" }),
    sessionId: bigint("session_id", { mode: "number" }).references(
      () => sessions.id,
      { onDelete: "set null" },
    ),
    userId: bigint("user_id", { mode: "number" }).references(() => users.id, {
      onDelete: "cascade",
    }),
    referenceId: text("reference_id"),
    authorizationCodeId: text("authorization_code_id"),
    resources: text("resources").array(),
    requestedUserInfoClaims: text("requested_user_info_claims").array(),
    refreshId: bigint("refresh_id", { mode: "number" }).references(
      () => oauthRefreshTokens.id,
      { onDelete: "cascade" },
    ),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
    revoked: timestamp("revoked"),
    confirmation: jsonb("confirmation"),
    scopes: text("scopes").array().notNull(),
  },
  (table) => [
    index("oauth_access_tokens_client_id_idx").on(table.clientId),
    index("oauth_access_tokens_session_id_idx").on(table.sessionId),
    index("oauth_access_tokens_user_id_idx").on(table.userId),
    index("oauth_access_tokens_authorization_code_id_idx").on(
      table.authorizationCodeId,
    ),
    index("oauth_access_tokens_refresh_id_idx").on(table.refreshId),
  ],
);

export const oauthConsents = pgTable(
  "oauth_consents",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    clientId: text("client_id")
      .notNull()
      .references(() => oauthClients.clientId, { onDelete: "cascade" }),
    userId: bigint("user_id", { mode: "number" }).references(() => users.id, {
      onDelete: "cascade",
    }),
    referenceId: text("reference_id"),
    resources: text("resources").array(),
    requestedUserInfoClaims: text("requested_user_info_claims").array(),
    scopes: text("scopes").array().notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [
    index("oauth_consents_client_id_idx").on(table.clientId),
    index("oauth_consents_user_id_idx").on(table.userId),
  ],
);

/** Single-use `private_key_jwt` assertion ids: the provider writes a digest of the assertion's jti as the id, so it stays text. */
export const oauthClientAssertions = pgTable("oauth_client_assertions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
});
