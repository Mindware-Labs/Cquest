// Compartido entre el form de quote y el de postulación: mismo formato en
// todo el sitio en vez de que cada uno invente el suyo.
export function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  let prefix = "";
  if (digits.length > 10 && digits.startsWith("1")) {
    prefix = "+1 ";
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 10);
  const groups = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean);
  return prefix + groups.join("-");
}
