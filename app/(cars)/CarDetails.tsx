import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";  
import { fetchCarDetails } from "~/services/cars/carService"; 
import { Car } from "~/types/types";

const CarDetails = () => {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { id } = useLocalSearchParams<{ id: string }>();  

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return; 
      try {
        const carData = await fetchCarDetails(id);
        console.log(carData)
        setCar(carData);
      } catch (err) {
        setError("Impossible de récupérer les détails de la voiture.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text>{error}</Text>;

  return (
    <ScrollView className="p-4">
      <Text className="text-2xl font-bold">{car?.marque} {car?.modele}</Text>
      <Text className={`mt-2 ${car?.statut === "réservé" ? "text-red-500" : "text-green-500"}`}>
        {car?.statut}
      </Text>
      <ScrollView horizontal pagingEnabled style={{ marginVertical: 10 }}>
        {car?.images?.flat().map((imageUrl, index) => (
          <Image
            key={index}
            source={{ uri: imageUrl }}
            style={{ width: 300, height: 200, borderRadius: 10, marginRight: 10 }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <Text className="mt-4">Détails supplémentaires...</Text>
    </ScrollView>
  );
};

export default CarDetails;
