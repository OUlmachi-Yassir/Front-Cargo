import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Image } from "react-native";
import { getAllCars } from "~/services/cars/carService";
import { Car } from "~/types/types";

const ClientHome = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await getAllCars();
        console.log("Données récupérées :", data); // Debug ici
        setCars(data);
      } catch (err) {
        setError("Impossible de récupérer les voitures.");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  if (loading) return <ActivityIndicator size="large" className="flex-1 justify-center items-center" />;
  if (error) return <Text className="text-red-500 text-lg text-center">{error}</Text>;

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-4 text-gray-800">Liste des voitures</Text>
      <FlatList
        data={cars}
        keyExtractor={(car) => car._id}
        renderItem={({ item: car }) => (
          <View className="bg-gray-100 p-4 rounded-lg shadow-lg mb-4">
            <Image
              source={{
                uri: car.images?.[0]?.[0] ,
              }}
              className="w-full h-40 rounded-lg"
            />

            <Text className="text-lg font-semibold mt-2 text-gray-900">

              {car.marque} {car.modele}
            </Text>
            <Text className={`mt-1 font-bold ${car.statut === "réservé" ? "text-red-500" : "text-green-500"}`}>
              {car.statut}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default ClientHome;
