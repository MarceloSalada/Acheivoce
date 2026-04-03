export function maskMiddle(value: string, visible = 2) {
  if (!value) return "";

  const start = value.slice(0, visible);
  const end = value.slice(-visible);

  return `${start}${"█".repeat(Math.max(4, value.length - visible * 2))}${end}`;
}

export function maskEmail(email: string) {
  if (!email.includes("@")) return maskMiddle(email);

  const [name, domain] = email.split("@");

  return `${maskMiddle(name, 2)}@${domain}`;
}

export function maskIP(ip: string) {
  const parts = ip.split(".");
  if (parts.length !== 4) return maskMiddle(ip);

  return `${parts[0]}.${parts[1]}.██.██`;
}
