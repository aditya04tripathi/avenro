CREATE TABLE "authentication_rate_limits" (
    "keyHash" CHAR(64) NOT NULL,
    "windowStart" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
    "attemptCount" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
    CONSTRAINT "authentication_rate_limits_pkey" PRIMARY KEY ("keyHash"),
    CONSTRAINT "authentication_rate_limits_attemptCount_check" CHECK ("attemptCount" > 0)
);

CREATE INDEX "authentication_rate_limits_expiresAt_idx"
ON "authentication_rate_limits"("expiresAt");
