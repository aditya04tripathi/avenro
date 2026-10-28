CREATE TABLE "oidc_logins" (
    "state" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "nonce" TEXT,
    "codeVerifier" TEXT NOT NULL,
    "redirectTo" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
    "expiresAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
    CONSTRAINT "oidc_logins_pkey" PRIMARY KEY ("state")
);

CREATE INDEX "oidc_logins_expiresAt_idx" ON "oidc_logins"("expiresAt");

CREATE TABLE "provider_accounts" (
    "provider" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "provider_accounts_pkey" PRIMARY KEY ("provider", "subject"),
    CONSTRAINT "provider_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "provider_accounts_userId_idx" ON "provider_accounts"("userId");
