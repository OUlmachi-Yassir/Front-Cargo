import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, Modal, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";  
import { fetchCarDetails } from "~/services/cars/carService"; 
import { Car } from "~/types/types";
import { replaceIp } from '../../services/helpers/helpers';
import { createReservation, getReservationsForCar } from "~/services/cars/reservationService";
import { Button } from "~/components/Button";
import CalendarPicker from 'react-native-calendar-picker';
import { authService } from "~/services/auth/authService";
import { jwtDecode } from "jwt-decode";

const CarDetails = () => {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservations, setReservations] = useState<{ startDate: string; endDate: string }[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); 
  
  const { id } = useLocalSearchParams<{ id: string }>();  

  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await authService.getToken();
        if (!token) throw new Error('No token found');
        const decodedToken: any = jwtDecode(token);
        const storedUserId = decodedToken.id;
        console.log("User ID from AsyncStorage: ", storedUserId);
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.log("No user ID found in AsyncStorage");
        }
      } catch (error) {
        console.error("Failed to load user ID from AsyncStorage", error);
      }
    };

    getUserId();
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return; 
      try {
        const carData = await fetchCarDetails(id);
        setCar(carData);
        const resData = await getReservationsForCar(id);
        setReservations(Array.isArray(resData) ? resData : []);
      } catch (err) {
        setError("Impossible de récupérer les détails de la voiture.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleReserve = async () => {
    if (!startDate || !endDate || !userId) {
      alert("Veuillez sélectionner une période valide et vous assurer que vous êtes connecté.");
      return;
    }
    try {
      await createReservation(id, userId, startDate, endDate);
      setModalVisible(false);
      alert("Réservation réussie !");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isReserved = (date: string) => {
    return reservations.some(res =>
      new Date(res.startDate) <= new Date(date) && new Date(date) <= new Date(res.endDate)
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text>{error}</Text>;

  return (
    <ScrollView className="p-4">
      <Text className="text-2xl font-bold">{car?.marque} {car?.modele}</Text>
      <Text className={`mt-2 ${car?.statut === "réservé" ? "text-red-500" : "text-green-500"}`}>{car?.statut}</Text>
      <ScrollView horizontal pagingEnabled style={{ marginVertical: 10 }}>
        {car?.images?.flat().map((imageUrl, index) => (
          <Image
            key={index}
            source={{ uri: replaceIp(imageUrl, process.env.EXPO_PUBLIC_URL) }}
            style={{ width: 300, height: 200, borderRadius: 10, marginRight: 10 }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      <Button title="Réserver" onPress={() => setModalVisible(true)} />
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text>Choisissez la période :</Text>
            <CalendarPicker
              onDateChange={(date, type) => {
                const formattedDate = date?.toISOString().split('T')[0];
                if (type === 'START_DATE' && formattedDate) setStartDate(formattedDate);
                else if (formattedDate) setEndDate(formattedDate);
              }}
              selectedStartDate={startDate ?? undefined}  
              selectedEndDate={endDate ?? undefined}      
              selectedDayColor="#4CAF50"
              selectedDayTextColor="#FFFFFF"
              customDatesStyles={(date) => {
                const dateStr = date?.toISOString().split('T')[0];
                return {
                  style: dateStr && isReserved(dateStr) ? { backgroundColor: 'red' } : {},
                  textStyle: dateStr && isReserved(dateStr) ? { color: 'white' } : {},
                };
              }}
              allowRangeSelection={true}
            />
            <Button className='bg-red-300' title="Confirmer" onPress={handleReserve} />
            <Button className='bg-red-300' title="Annuler" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Text className="mt-4">Périodes réservées :</Text>
      {reservations.map((res, index) => (
        <Text key={index} className="text-red-500">
          {new Date(res.startDate).toLocaleDateString()} - {new Date(res.endDate).toLocaleDateString()}
        </Text>
      ))}

      <Text className="mt-4">Détails supplémentaires...</Text>
    </ScrollView>
  );
};

export default CarDetails;
