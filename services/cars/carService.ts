import { Car } from "~/types/types";

const API_URL = `${process.env.EXPO_PUBLIC_APP_API_URL}/cars`; 

export const getAllCars = async (): Promise<Car[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Erreur lors du chargement des voitures.");
    }
    return response.json();
  } catch (error) {
    console.error("Erreur API :", error);
    throw error;
  }
};