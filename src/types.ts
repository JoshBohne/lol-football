export interface Champion {
  id: string;
  key: number;
  name: string;
  title: string;
  tags: string[];
  imageUrl: string;
  squareUrl: string;
}

export interface ChampionData {
  version: string;
  count: number;
  champions: Champion[];
}

export type Side = "offense" | "defense";

export interface Position {
  id: string;
  label: string;
  abbr: string;
  side: Side;
  /** Coordinates in 0–100 percentage space, anchored to the field bounding box. */
  x: number;
  y: number;
}

export type Lineup = Record<string, string | null>;
