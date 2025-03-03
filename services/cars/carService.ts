import { Car } from "~/types/types";


export const getAllCars = async (): Promise<Car[]> => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/cars`);
    if (!response.ok) {
      throw new Error("Erreur lors du chargement des voitures.");
    }
    return response.json();
  } catch (error) {
    console.error("Erreur API :", error);
    throw error;
  }
};

export const fetchCarDetails = async (carId: string): Promise<Car> => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/cars/${carId}`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des détails de la voiture.");
      }
      return response.json();
    } catch (error) {
      console.error("Erreur API :", error);
      throw error;
    }
  };