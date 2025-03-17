import { useState } from "react";
import { Alert } from "react-native";
import { authService } from "~/services/auth/authService";
import { jwtDecode } from "jwt-decode";

export const useReservation = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReservation = async (carId: string) => {
    if (!startDate || !endDate) {
      Alert.alert("Erreur", "Veuillez sélectionner une date de début et de fin.");
      return;
    }

    try {
      setLoading(true);
      const token = await authService.getToken();
      if (!token) throw new Error("No token found");
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.id;

      const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/cars/${carId}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });
      console.log("im here for chiking response: ",response)

      if (!response.ok) {
        throw new Error("Erreur lors de la réservation");
      }

      Alert.alert("Succès", "Votre réservation a été envoyée avec succès.");
    } catch (error) {
      console.error("Erreur lors de la réservation :", error);
      Alert.alert("Erreur", "Une erreur s'est produite lors de la réservation.");
    } finally {
      setLoading(false);
    }
  };

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    handleReservation,
  };
};


export const fetchUserReservations = async () => {
  try {
    const token = await authService.getToken();
    if (!token) throw new Error("No token found");
    const decodedToken: any = jwtDecode(token);
    const userId = decodedToken.id;

    const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/cars/reservations/my`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseBody = await response.json();
    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}, ${responseBody.message || "Aucune réponse détaillée"}`);

    return responseBody;
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations :", error);
    Alert.alert("Erreur", error.message || "Une erreur inconnue est survenue");
    return [];  
  }
};
