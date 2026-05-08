import { CHAMPIONS } from "@/lib/champions";
import { POSITIONS } from "@/data/positions";
import type { Lineup } from "@/types";

const ID_TO_INDEX = new Map(CHAMPIONS.map((c, i) => [c.id, i]));
const INDEX_TO_ID = CHAMPIONS.map((c) => c.id);

/**
 * Encode a 22-slot lineup as a base64url string of 2-byte champion indices.
 * Empty slots use 0xFFFF. Positions iterate in canonical POSITIONS order.
 */
export function encodeLineup(lineup: Lineup): string {
  const buf = new Uint8Array(POSITIONS.length * 2);
  POSITIONS.forEach((pos, i) => {
    const champId = lineup[pos.id];
    const idx = champId ? ID_TO_INDEX.get(champId) ?? 0xffff : 0xffff;
    buf[i * 2] = (idx >> 8) & 0xff;
    buf[i * 2 + 1] = idx & 0xff;
  });
  return toBase64Url(buf);
}

export function decodeLineup(encoded: string): Lineup | null {
  try {
    const buf = fromBase64Url(encoded);
    if (buf.length !== POSITIONS.length * 2) return null;
    const lineup: Lineup = {};
    POSITIONS.forEach((pos, i) => {
      const idx = (buf[i * 2] << 8) | buf[i * 2 + 1];
      lineup[pos.id] = idx === 0xffff ? null : INDEX_TO_ID[idx] ?? null;
    });
    return lineup;
  } catch {
    return null;
  }
}

function toBase64Url(buf: Uint8Array): string {
  let binary = "";
  for (const b of buf) binary += String.fromCharCode(b);
  const base64 = typeof btoa !== "undefined" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const base64 = s.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((s.length + 2) % 4);
  const binary = typeof atob !== "undefined" ? atob(base64) : Buffer.from(base64, "base64").toString("binary");
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}
