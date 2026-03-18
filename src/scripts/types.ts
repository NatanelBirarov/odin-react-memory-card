import { PokemonTCG } from "@devdrc/pokemon-tcg-sdk-ts";

export type StateUpdater<T> = (param?: T | ((prev: T) => T)) => void;

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

type UserType = {
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
  params: PokemonTCG.IParameter;
};

export type ISignInWithPasswordFormData = {
  email: string;
  password: string;
};
