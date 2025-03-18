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




  export const createCar = async (token: string, carData: any, imageUris: string[]) => {
    try {
      const formData = new FormData();
  
      Object.keys(carData).forEach((key) => {
        formData.append(key, carData[key]);
      });
  
      
      imageUris.forEach((uri, index) => {
        const fileName = uri.split('/').pop(); 
        const fileType = fileName?.split('.').pop(); 
  
        formData.append('images', {
          uri,
          name: `image_${index}.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      });
  
      const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/cars`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorResponse = await response.text(); 
        throw new Error(`Erreur lors de la création de la voiture: ${errorResponse}`);      }
  
      return await response.json();
    } catch (error) {
      console.error('Erreur dans createCar:', error);
      throw error;
    }
  };
  
