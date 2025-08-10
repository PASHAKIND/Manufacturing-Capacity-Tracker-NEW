
import { FavoriteFacility } from '../types';

const FAVORITES_STORAGE_KEY = 'appFavorites';

interface StoredFavorites {
  [userId: string]: FavoriteFacility[];
}

const getAllStoredFavorites = (): StoredFavorites => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to parse favorites from localStorage", e);
    return {};
  }
};

const saveFavorites = (favorites: StoredFavorites) => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    // Optionally, dispatch an event if other components need to react live
    // window.dispatchEvent(new CustomEvent('favoritesUpdated'));
  } catch (e) {
    console.error("Failed to save favorites to localStorage", e);
  }
};

export const favoriteService = {
  addFavorite: (userId: string, facilityId: string, facilityName: string): FavoriteFacility | null => {
    if (!userId || !facilityId || !facilityName) return null;

    const allFavorites = getAllStoredFavorites();
    let userFavorites = allFavorites[userId] || [];

    if (userFavorites.some(fav => fav.facilityId === facilityId)) {
      return userFavorites.find(fav => fav.facilityId === facilityId) || null; // Already a favorite
    }

    const newFavorite: FavoriteFacility = {
      userId,
      facilityId,
      facilityName,
      addedAt: new Date(),
    };

    userFavorites.push(newFavorite);
    allFavorites[userId] = userFavorites;
    saveFavorites(allFavorites);
    return newFavorite;
  },

  removeFavorite: (userId: string, facilityId: string): boolean => {
    if (!userId || !facilityId) return false;

    const allFavorites = getAllStoredFavorites();
    let userFavorites = allFavorites[userId];

    if (!userFavorites) return false;

    const initialLength = userFavorites.length;
    userFavorites = userFavorites.filter(fav => fav.facilityId !== facilityId);

    if (userFavorites.length < initialLength) {
      allFavorites[userId] = userFavorites;
      if (userFavorites.length === 0) {
        delete allFavorites[userId]; // Clean up if no favorites left for user
      }
      saveFavorites(allFavorites);
      return true;
    }
    return false; // Not found or not removed
  },

  getFavorites: (userId: string): FavoriteFacility[] => {
    if (!userId) return [];
    const allFavorites = getAllStoredFavorites();
    return (allFavorites[userId] || []).map(fav => ({
        ...fav,
        addedAt: new Date(fav.addedAt) // Ensure date object
    })).sort((a,b) => b.addedAt.getTime() - a.addedAt.getTime());
  },

  isFavorite: (userId: string, facilityId: string): boolean => {
    if (!userId || !facilityId) return false;
    const userFavorites = favoriteService.getFavorites(userId);
    return userFavorites.some(fav => fav.facilityId === facilityId);
  },

  clearUserFavorites: (userId: string): void => { // For testing/dev
    if (!userId) return;
    const allFavorites = getAllStoredFavorites();
    delete allFavorites[userId];
    saveFavorites(allFavorites);
  }
};
