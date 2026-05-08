import data from "@/data/champions.json";
import type { Champion, ChampionData } from "@/types";

const typed = data as ChampionData;

export const CHAMPIONS: readonly Champion[] = typed.champions;
export const PATCH_VERSION = typed.version;

const byId = new Map(CHAMPIONS.map((c) => [c.id, c]));

export function getChampion(id: string): Champion | undefined {
  return byId.get(id);
}

export function searchChampions(query: string): Champion[] {
  const q = query.trim().toLowerCase();
  if (!q) return CHAMPIONS.slice();
  return CHAMPIONS.filter(
    (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
  );
}
