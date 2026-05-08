/**
 * Pulls the latest champion list from Riot's Data Dragon CDN and writes
 * a slim JSON file at src/data/champions.json.
 *
 * Run: pnpm fetch-champions
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";

const VERSIONS_URL = "https://ddragon.leagueoflegends.com/api/versions.json";

interface DDragonChampion {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  image: { full: string };
}

interface DDragonResponse {
  data: Record<string, DDragonChampion>;
}

export interface Champion {
  id: string;
  key: number;
  name: string;
  title: string;
  tags: string[];
  imageUrl: string;
  squareUrl: string;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed for ${url}: ${res.status}`);
  return (await res.json()) as T;
}

async function main() {
  const versions = await getJson<string[]>(VERSIONS_URL);
  const version = versions[0];
  console.log(`Latest patch: ${version}`);

  const champData = await getJson<DDragonResponse>(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
  );

  const champions: Champion[] = Object.values(champData.data)
    .map((c) => ({
      id: c.id,
      key: Number(c.key),
      name: c.name,
      title: c.title,
      tags: c.tags,
      imageUrl: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`,
      squareUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/${c.id}_0.jpg`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const out = { version, count: champions.length, champions };
  const outPath = path.resolve("src/data/champions.json");
  await writeFile(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`Wrote ${champions.length} champions → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
