// Siembra el primer admin. Uso: npm run seed:admin -- "Nombre" correo@cquest.do
import { auth } from "../src/lib/auth";
import { withOtpPurpose } from "../src/lib/emails/otp-context";

const [name, email] = process.argv.slice(2);

if (!name || !email) {
  console.error('Uso: npm run seed:admin -- "Nombre Apellido" correo@cquest.do');
  process.exit(1);
}

const password = crypto.randomUUID() + crypto.randomUUID();

try {
  // Sin headers: el endpoint solo exige sesión cuando la petición llega por HTTP.
  await auth.api.createUser({
    body: { name, email: email.toLowerCase(), password, role: "admin" },
  });
  console.log(`Usuario creado: ${email}`);

  await withOtpPurpose("welcome", () =>
    auth.api.sendVerificationOTP({ body: { email: email.toLowerCase(), type: "forget-password" } }),
  );
  console.log("Correo de bienvenida enviado con el código de seis dígitos.");
  process.exit(0);
} catch (error) {
  console.error("Falló el seed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
