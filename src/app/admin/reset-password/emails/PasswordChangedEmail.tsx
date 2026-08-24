import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import { BRAND, EMAIL_FONT } from "./brand";

/* Aviso de cortesía después de un reset exitoso — no es parte del flujo
   (nadie lo espera para avanzar), es la notificación estándar de "esto
   cambió" que ya mandan GitHub/Google tras un reset: si alguien ve este
   correo sin haberlo pedido, es la primera señal de que su cuenta se vio
   comprometida. Mismo cromo que ResetCodeEmail.tsx, archivo aparte porque es
   un mensaje con un propósito distinto (informar, no pedir una acción). */

export type PasswordChangedEmailProps = {
  changedAt: string;
};

export default function PasswordChangedEmail({ changedAt }: PasswordChangedEmailProps) {
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Tu contraseña del panel de Center Quest se actualizó</Preview>
      <Body style={{ margin: 0, padding: 0, background: BRAND.surface, fontFamily: EMAIL_FONT }}>
        <Container
          style={{
            width: "100%",
            maxWidth: "480px",
            margin: "0 auto",
            padding: "32px 16px",
          }}
        >
          <Section
            style={{
              background: "#ffffff",
              borderRadius: "2px",
              overflow: "hidden",
              boxShadow: "0 14px 44px -24px rgba(10,17,22,0.5)",
            }}
          >
            <Section style={{ background: BRAND.ink, padding: "24px 32px" }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  color: "#ffffff",
                  textTransform: "uppercase",
                }}
              >
                Center&nbsp;Quest
              </Text>
              <Text
                style={{
                  margin: "6px 0 0",
                  fontSize: "10.5px",
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  color: BRAND.celeste,
                  textTransform: "uppercase",
                }}
              >
                Panel administrativo
              </Text>
            </Section>

            <Section style={{ height: "3px", lineHeight: "3px", fontSize: 0, background: BRAND.petroleo }}>
              &nbsp;
            </Section>

            <Section style={{ padding: "32px" }}>
              <Heading
                as="h1"
                style={{
                  margin: "0 0 12px",
                  fontSize: "20px",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: BRAND.ink,
                }}
              >
                Tu contraseña se actualizó
              </Heading>
              <Text style={{ margin: "0 0 8px", fontSize: "14px", lineHeight: "1.6", color: BRAND.body }}>
                La contraseña de tu cuenta del panel de Center Quest cambió el {changedAt}.
              </Text>
              <Text style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: BRAND.body }}>
                Si fuiste tú, no hace falta que hagas nada más.
              </Text>

              <Hr style={{ margin: "28px 0", borderColor: BRAND.line }} />

              <Text style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.6", color: BRAND.danger }}>
                Si no fuiste tú, alguien más puede tener acceso a tu cuenta — contacta a otro
                administrador del panel lo antes posible.
              </Text>
            </Section>

            <Section
              style={{
                background: BRAND.panel,
                borderTop: `1px solid ${BRAND.line}`,
                padding: "22px 32px",
              }}
            >
              <Text
                style={{
                  margin: 0,
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.24em",
                  color: BRAND.muted,
                  textTransform: "uppercase",
                }}
              >
                Center Quest
              </Text>
              <Text style={{ margin: "6px 0 0", fontSize: "12px", color: BRAND.faint, letterSpacing: "0.02em" }}>
                Call Center &middot; Operaciones &middot; Desarrollo de Sistemas
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
