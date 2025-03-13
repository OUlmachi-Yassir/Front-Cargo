import { useEffect, useState } from "react";
import { View, Text, Image, FlatList, ActivityIndicator, Dimensions, TouchableOpacity, StyleSheet } from "react-native";
import Swiper from "react-native-swiper";
import { getAllCars } from "~/services/cars/carService";
import { Car } from "~/types/types";
import { useRouter } from "expo-router";
import { replaceIp } from "~/services/helpers/helpers";
import { getAllUsers } from "~/services/user/profileService";
import tw from 'twrnc';
import { authService } from "~/services/auth/authService";
import { jwtDecode } from "jwt-decode";

const { width } = Dimensions.get("window");

interface Company {
  _id: string;
  name: string;
  image: string;
}

const ClientHome = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
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

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const users = await getAllUsers();
        const filteredCompanies = users.filter(user => user.role === 'company');
        setCompanies(filteredCompanies);
      } catch (err) {
        setError("Impossible de récupérer les utilisateurs.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const startChat = async (receiverId: string) => {
    try {
      const token = await authService.getToken();
      if (!token) throw new Error('No token found');
  
      const decodedToken: any = jwtDecode(token);
      const loggedUser = decodedToken.id;
      console.log(loggedUser)
  
      if (!loggedUser) return;
      console.log(receiverId)
  
      router.push({ pathname: '/chats/CampanyChat', params: { id: receiverId } });
    } catch (error) {
      console.error('Erreur lors du démarrage du chat', error);
    }
  };
  

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text>{error}</Text>;

  return (
    <View className="p-4">
      <FlatList
        data={companies}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.companyItem}
            onPress={() => startChat(item._id)}
          >
            <Text style={styles.companyName}>{item.name}</Text>
            <Image
              source={item.image ? { uri: replaceIp(item.image, process.env.EXPO_PUBLIC_URL) } : require('~/assets/images/blank-profile-picture-973460_1280.png')}
              style={tw`w-full h-50 relative top-5`}
            />
          </TouchableOpacity>
        )}
      />
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
                    source={{ uri: replaceIp(imageUrl, process.env.EXPO_PUBLIC_URL) }}
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

const styles = StyleSheet.create({
  companyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  companyName: {
    fontSize: 18,
  },
});

export default ClientHome;
