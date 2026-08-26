import React from "react";

export type PokemonCard = {
  id: string;
  name: string;
  supertype?: string;
  subtypes?: string[];
  types?: string[];
  set?: {
    id: string;
    name: string;
    series?: string;
    total?: number;
    images?: { symbol: string; logo: string };
  };
  images?: { small: string; large: string };
  cardmarket?: {
    url?: string;
    updatedAt?: string;
    prices?: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
      [key: string]: number | undefined;
    };
  };
  [key: string]: unknown;
};

export type PokemonSet = {
  id: string;
  name: string;
  series?: string;
  total: number;
  releaseDate?: string;
  images: { symbol: string; logo: string };
  [key: string]: unknown;
};

export type PokemonParameter = {
  q?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  select?: string;
  [key: string]: unknown;
};

export type CardData = {
  id: string;
  name: string;
  image?: string;
  images?: { small: string; large: string };
  clicked: boolean;
};

export type SetDataType = {
  id: string;
  completedLevels: number;
  levels: number;
  highScore: number;
  completed: boolean;
};

export type UserType = {
  id: string;
  email: string;
  name: string;
  image?: string;
};

export type ContextType = {
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  showHowTo: boolean;
  setShowHowTo: React.Dispatch<React.SetStateAction<boolean>>;
  musicVolume: number;
  setMusicVolume: React.Dispatch<React.SetStateAction<number>>;
  sfxVolume: number;
  setSfxVolume: React.Dispatch<React.SetStateAction<number>>;
};

export type QueryOptions = {
  queryKey: [string] | [string, string];
  type: "card" | "set";
  params: PokemonParameter;
};

export type ISignInWithPasswordFormData = {
  email: string;
  password: string;
};
