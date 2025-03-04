import { useEffect, useState } from "react";
import { View, Text, Image, FlatList, ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
import Swiper from "react-native-swiper";
import { getAllCars } from "~/services/cars/carService";
import { Car } from "~/types/types";
import { useRouter } from "expo-router"; 
import { replaceIp } from "~/services/helpers/helpers";

const { width } = Dimensions.get("window");

const ClientHome = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const router = useRouter(); 

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await getAllCars();
        setCars(data);
      } catch (err) {
        setError("Impossible de récupérer les voitures.");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text>{error}</Text>;

  

  return (
    <View className="p-4">
      <Text className="text-2xl font-bold mb-4 text-center">Liste des voitures</Text>

      <FlatList
        data={cars}
        keyExtractor={(car) => car._id}
        renderItem={({ item: car }) => (
          <TouchableOpacity onPress={() => router.push({ pathname: '/CarDetails', params: { id: car._id } })}>
            <View className="bg-white p-4 mb-4 rounded-lg shadow-lg">
              <Swiper
                style={{ height: 200 }}
                loop={false}
                showsPagination={true}
                dotColor="#999"
                activeDotColor="#000"
              >
                {car.images.flat().map((imageUrl, index) => (
                  <Image
                    key={index}
                    source={{ uri: replaceIp(imageUrl,process.env.EXPO_PUBLIC_URL) }}
                    style={{ width: width - 32, height: 200, borderRadius: 10 }}
                    resizeMode="cover"
                  />
                ))}
              </Swiper>

              <Text className="text-lg font-semibold mt-2">{car.marque} {car.modele}</Text>
              <Text className={`mt-1 ${car.statut === 'réservé' ? "text-red-500" : "text-green-500"}`}>
                {car.statut}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ClientHome;
