export type StateUpdater<T> = (param: T | ((prev: T) => T)) => void;

export type CardObject = {
  id: string;
  name: string;
  image?: string;
  images?: { small: string; large: string };
  clicked: boolean;
};

export type PokemonData = { data: CardObject[] | undefined };

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
