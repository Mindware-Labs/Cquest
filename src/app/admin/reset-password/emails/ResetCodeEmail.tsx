import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import { BRAND, EMAIL_FONT, EMAIL_MONO_FONT } from "./brand";

/* El código de "olvidé mi contraseña", armado con React Email. Mismo
   cromo de marca que ya usa src/app/[lang]/quote/emails/shared.ts (barra de
   tinta, acento celeste, pie con la línea de marca) pero como componentes de
   @react-email/components en vez de strings de HTML a mano — es el único
   correo del proyecto construido así, a propósito: ver el porqué en el plan
   de este feature.

   Se renderiza con @react-email/render (no con el prop `react:` de Resend —
   ver actions.ts) para producir html Y texto plano, la misma forma que ya
   manda submitQuote.ts. */

export type ResetCodeEmailProps = {
  code: string;
  expiresInMinutes: number;
};

export default function ResetCodeEmail({ code, expiresInMinutes }: ResetCodeEmailProps) {
  return (
    <Html lang="es" dir="ltr">
      <Head />
      <Preview>Tu código para restablecer la contraseña: {code}</Preview>
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

            <Section style={{ height: "3px", lineHeight: "3px", fontSize: 0, background: BRAND.celeste }}>
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
                Restablece tu contraseña
              </Heading>
              <Text style={{ margin: "0 0 24px", fontSize: "14px", lineHeight: "1.6", color: BRAND.body }}>
                Usa este código en el panel de Center Quest para elegir una contraseña nueva.
              </Text>

              <Section
                style={{
                  background: BRAND.panel,
                  border: `1px solid ${BRAND.line}`,
                  borderRadius: "2px",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <Text
                  style={{
                    margin: 0,
                    fontFamily: EMAIL_MONO_FONT,
                    fontSize: "32px",
                    fontWeight: 700,
                    letterSpacing: "0.3em",
                    color: BRAND.ink,
                  }}
                >
                  {code}
                </Text>
              </Section>

              <Text style={{ margin: "16px 0 0", fontSize: "12.5px", color: BRAND.muted }}>
                Vence en {expiresInMinutes} minutos. Si expira, puedes pedir uno nuevo desde el panel.
              </Text>

              <Hr style={{ margin: "28px 0", borderColor: BRAND.line }} />

              <Text style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.6", color: BRAND.faint }}>
                Si no fuiste tú quien lo pidió, ignora este correo — tu contraseña no va a cambiar.
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
