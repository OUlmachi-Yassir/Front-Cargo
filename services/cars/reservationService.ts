import ErrorService from "../error/ErrorService";


export const createReservation = async (carId: string, userId: string, startDate: string, endDate: string) => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer your-token`,
      },
      body: JSON.stringify({ carId, userId, startDate, endDate }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la réservation');
    }

    return await response.json();
  } catch (error:unknown) {
    ErrorService.handleError(error);
    throw error;
  }
};

export const getReservationsForCar = async (carId: string) => {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/cars/${carId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer your-token`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération des réservations');
    }

    return await response.json();
  } catch (error:unknown) {
    ErrorService.handleError(error);
    throw error;
  }
};
