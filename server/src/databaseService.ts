import prisma from "./prismaClient.js";

type SetDataType = {
  id: string;
  completedLevels: number;
  levels: number;
  highScore: number;
  completed: boolean;
};

export default class DatabaseService {
  // Service class for interacting with the database

  /**
   * Fetch a user from the database by their ID.
   * @param userId - The ID of the user to fetch.
   * @returns A promise that resolves to the user or null if not found.
   */
  static async getUserByEmail(email: string) {
    try {
      let user = await prisma.user.findUnique({
        where: { email },
      });
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  // Game Data Methods

  /**
   * Fetch all game data for a specific user from the database.
   * @param userId - The ID of the user.
   * @returns A promise that resolves to an array of game data.
   */
  static async getAllGameData(userId: string): Promise<SetDataType[]> {
    const data = await prisma.levelData.findMany({
      where: { userId },
    });
    return data.map((item) => ({
      id: item.setId,
      completedLevels: item.completedLevels,
      levels: item.levels,
      highScore: item.highScore,
      completed: item.completed,
    }));
  }

  /**
   * Fetch game data for a specific set by its ID and user ID.
   * @param userId - The ID of the user.
   * @param setId - The ID of the set to fetch.
   * @returns A promise that resolves to the game data or null if not found.
   */
  static async getGameDataBySet(
    userId: string,
    setId: string
  ): Promise<SetDataType | null> {
    const data = await prisma.levelData.findUnique({
      where: { userId, setId }, // Composite unique key
    });
    if (!data) return null;
    return {
      id: data.setId,
      completedLevels: data.completedLevels,
      levels: data.levels,
      highScore: data.highScore,
      completed: data.completed,
    };
  }

  /**
   * Insert or update game data for the current user in the database.
   * @param userId - The ID of the user.
   * @param gameData - The game data to upsert.
   */
  static async upsertLevelData(
    userId: string,
    gameData: SetDataType
  ): Promise<void> {
    await prisma.levelData.upsert({
      where: { userId, setId: gameData.id }, // Composite unique key
      update: {
        completedLevels: gameData.completedLevels,
        highScore: gameData.highScore,
        completed: gameData.completed,
      },
      create: {
        userId, // Associate the game data with the current user
        setId: gameData.id,
        completedLevels: gameData.completedLevels,
        levels: gameData.levels,
        highScore: gameData.highScore,
        completed: gameData.completed,
      },
    });
  }

  /**
   * Initialize game data for multiple sets.
   * Skips duplicates if the data already exists.
   * @param sets - An array of game data to initialize.
   */
  // static async initializeGameData(sets: SetDataType[]): Promise<void> {
  //   await prisma.levelData.createMany({
  //     data: sets.map((set) => ({
  //       setId: set.id,
  //       completedLevels: set.completedLevels,
  //       levels: set.levels,
  //       highScore: set.highScore,
  //       completed: set.completed,
  //     })),
  //     skipDuplicates: true,
  //   });
  // }

  // Settings Methods

  /**
   * Fetch the settings from the database.
   * If no settings exist, create default settings.
   * @returns A promise that resolves to the settings.
   */
  static async getOrCreateSettings(userId: string) {
    let settings = await prisma.settings.findFirst({
      where: { userId },
    });
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          musicVolume: 0.5,
          sfxVolume: 0.5,
          userId,
        },
      });
    }
    return settings;
  }

  /**
   * Update the settings in the database for a specific user.
   * If no settings exist, create new settings with the provided values.
   * @param userId - The ID of the user.
   * @param musicVolume - The volume level for music.
   * @param sfxVolume - The volume level for sound effects.
   */
  static async updateSettings(
    userId: string,
    musicVolume: number,
    sfxVolume: number
  ) {
    const existing = await prisma.settings.findFirst({
      where: { userId },
    });
    if (existing) {
      return await prisma.settings.update({
        where: { id: existing.id },
        data: { musicVolume, sfxVolume },
      });
    }
    return await prisma.settings.create({
      data: { userId, musicVolume, sfxVolume },
    });
  }
}
