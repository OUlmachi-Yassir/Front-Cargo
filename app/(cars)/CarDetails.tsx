import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";  
import { fetchCarDetails } from "~/services/cars/carService"; 
import { Car } from "~/types/types";
import { replaceIp } from '../../helpers/helpers';
import { createReservation, getReservationsForCar } from "~/services/cars/reservationService";
import { Button } from "~/components/Button";
import  DateTimePicker  from '@react-native-community/datetimepicker';

const CarDetails = () => {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservations, setReservations] = useState<{ startDate: string; endDate: string }[]>([]);
  const [endDate, setEndDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);

  
  const { id } = useLocalSearchParams<{ id: string }>();  

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return; 
      try {
        const carData = await fetchCarDetails(id);
        console.log(carData)
        setCar(carData);
        const resData = await getReservationsForCar(id);
        console.log("Reservations data:", resData);
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
    try {
      await createReservation(id, "userId", startDate.toISOString(), endDate.toISOString());
      setModalVisible(false);
      alert("Réservation réussie !");
    } catch (err:any) {
      alert(err.message);
    }
  };

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
            source={{ uri: replaceIp(imageUrl,'192.168.8.81') }}
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
            <DateTimePicker value={startDate} mode="datetime" onChange={(event, date) =>{if (date) setStartDate(date);} }  />
            <DateTimePicker value={endDate} mode="datetime" onChange={(event, date) => {if (date) setEndDate(date)}} />
            <Button title="Confirmer" onPress={handleReserve} />
            <Button title="Annuler" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Text className="mt-4">Périodes réservées :</Text>
      {reservations.map((res, index) => (
        <Text key={index} className="text-red-500">
          {new Date(res.startDate).toLocaleString()} - {new Date(res.endDate).toLocaleString()}
        </Text>
      ))}

      <Text className="mt-4">Détails supplémentaires...</Text>
    </ScrollView>
  );
};

export default CarDetails;
