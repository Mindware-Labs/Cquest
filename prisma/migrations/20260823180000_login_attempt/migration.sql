-- Contador de intentos fallidos de login contra /admin/login.
-- Una fila por clave ("ip:..." o "email:..."), no una por intento: no interesa
-- la bitácora, sólo el contador vigente — y así la tabla no crece con el ataque.
CREATE TABLE "LoginAttempt" (
    "key" TEXT NOT NULL,
    "failures" INTEGER NOT NULL DEFAULT 0,
    "lastFailureAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" TIMESTAMP(3),

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("key")
);

-- Para la limpieza periódica de filas viejas.
CREATE INDEX "LoginAttempt_lastFailureAt_idx" ON "LoginAttempt"("lastFailureAt");
