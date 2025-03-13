import { useEffect, useState } from "react"
import { View, Text, Image, ScrollView, ActivityIndicator, Modal, TouchableOpacity, SafeAreaView } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { fetchCarDetails } from "~/services/cars/carService"
import type { Car } from "~/types/types"
import { replaceIp } from "../../services/helpers/helpers"
import CalendarPicker from 'react-native-calendar-picker';
import { authService } from "~/services/auth/authService"
import { jwtDecode } from "jwt-decode"
import { fetchUserReservations, useReservation } from "~/services/cars/reservationService"
import { Ionicons } from "@expo/vector-icons"

const CarDetails = () => {
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [reservations, setReservations] = useState<any[]>([])

  const { id } = useLocalSearchParams<{ id: string }>()

  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading: reservationLoading,
    handleReservation,
    reservationStatus,
  } = useReservation()

  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await authService.getToken()
        if (!token) throw new Error("No token found")
        const decodedToken: any = jwtDecode(token)
        const storedUserId = decodedToken.id
        if (storedUserId) {
          setUserId(storedUserId)
        }
      } catch (error) {
        console.error("Failed to load user ID from token", error)
      }
    }

    getUserId()
  }, [])

  useEffect(() => {
    const fetchReservations = async () => {
      if (!userId) return
      const data = await fetchUserReservations(userId)
      console.log("Réservations chargées:", data[0]?.reservations) // Accéder aux réservations dans l'objet
      setReservations(data[0]?.reservations || []) 

    }
    fetchReservations()
  }, [userId])

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return
      try {
        const carData = await fetchCarDetails(id)
        setCar(carData)
      } catch (err) {
        setError("Impossible de récupérer les détails de la voiture.")
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [id])

  const handleReserve = async () => {
    if (!id) return
    await handleReservation(id)
    setIsModalVisible(false)
  }

  const renderStatusBadge = () => {
    if (!car?.statut) return null

    const isAvailable = car.statut !== "réservé"
    return (
      <View className={`px-3 py-1 rounded-full ${isAvailable ? "bg-green-100" : "bg-red-100"}`}>
        <Text className={`font-medium ${isAvailable ? "text-green-700" : "text-red-700"}`}>{car.statut}</Text>
      </View>
    )
  }

  const renderReservationStatus = () => {
    if (!reservationStatus) return null

    let statusColor = ""
    let statusText = ""
    let statusIcon = ""

    switch (reservationStatus) {
      case "pending":
        statusColor = "bg-yellow-100"
        statusText = "En attente de confirmation du propriétaire"
        statusIcon = "time-outline"
        break
      case "approved":
        statusColor = "bg-green-100"
        statusText = "Réservation confirmée"
        statusIcon = "checkmark-circle-outline"
        break
      case "rejected":
        statusColor = "bg-red-100"
        statusText = "Réservation refusée"
        statusIcon = "close-circle-outline"
        break
      default:
        return null
    }

    return (
      <View className={`mt-4 p-4 rounded-lg ${statusColor}`}>
        <View className="flex-row items-center">
          <Ionicons
            name={statusIcon}
            size={24}
            color={
              reservationStatus === "pending" ? "#EAB308" : reservationStatus === "approved" ? "#16A34A" : "#DC2626"
            }
          />
          <Text className="ml-2 font-semibold">{statusText}</Text>
        </View>
      </View>
    )
  }

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    )

  if (error)
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <Text className="text-red-500 text-center font-medium">{error}</Text>
      </View>
    )

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Image Gallery */}
        <View className="relative h-72">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const contentOffset = e.nativeEvent.contentOffset
              const viewSize = e.nativeEvent.layoutMeasurement
              const pageNum = Math.floor(contentOffset.x / viewSize.width)
              setActiveImageIndex(pageNum)
            }}
          >
            {car?.images?.flat().map((imageUrl, index) => (
              <Image
                key={index}
                source={{ uri: replaceIp(imageUrl, process.env.EXPO_PUBLIC_URL) }}
                className="w-screen h-72"
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Image Pagination Dots */}
          {car?.images && car.images.flat().length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
              {car.images.flat().map((_, index) => (
                <View
                  key={index}
                  className={`h-2 w-2 rounded-full mx-1 ${index === activeImageIndex ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content Container */}
        <View className="p-5">
          {/* Header Section */}
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {car?.marque} {car?.modele}
              </Text>
              <Text className="text-lg font-semibold text-gray-700 mt-1">{car?.annee}</Text>
            </View>
            {renderStatusBadge()}
          </View>

          {/* Reservation Status */}
          {renderReservationStatus()}

          {/* Car Details Section */}
          <View className="mt-6 bg-gray-50 rounded-xl p-4">
            <Text className="text-lg font-semibold mb-3 text-gray-800">Caractéristiques</Text>

            <View className="flex-row flex-wrap">
              <View className="w-1/2 mb-4">
                <Text className="text-gray-500">Couleur</Text>
                <Text className="font-medium text-gray-800">{car?.couleur || "N/A"}</Text>
              </View>

              <View className="w-1/2 mb-4">
                <Text className="text-gray-500">Kilométrage</Text>
                <Text className="font-medium text-gray-800">{car?.kilometrage || "N/A"} km</Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          {car?.description && (
            <View className="mt-6">
              <Text className="text-lg font-semibold mb-2 text-gray-800">Description</Text>
              <Text className="text-gray-600 leading-relaxed">{car.description}</Text>
            </View>
          )}

          {/* Reservation Button */}
          {!reservationStatus && (
            <TouchableOpacity
              className="mt-8 bg-blue-600 py-4 rounded-xl shadow-sm"
              onPress={() => setIsModalVisible(true)}
            >
              <Text className="text-white text-center font-bold text-lg">Réserver cette voiture</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View className="mt-6 bg-gray-50 rounded-xl p-4">
          <Text className="text-lg font-semibold mb-3 text-gray-800">Your Reservation For This Car</Text>
          {reservations.length > 0 ? (
              reservations.map((reservation, index) => {
                const startDate = new Date(reservation.startDate).toLocaleDateString('fr-FR');
                const endDate = new Date(reservation.endDate).toLocaleDateString('fr-FR');

                return (
                  <View key={index} className="border-b border-gray-300 pb-3 mb-3">
                    <Text className="text-gray-800 font-semibold">
                    </Text>
                    <Text className="text-gray-500">
                      Du {startDate} au {endDate}
                    </Text>
                    <Text
                      className={`font-medium ${reservation.status === "approved" ? "text-green-600" : "text-yellow-600"}`}
                    >
                      {reservation.status === "approved" ? "Confirmée" : "En attente"}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text className="text-gray-500">Aucune réservation pour le moment.</Text>
            )}
        </View>


      {/* Reservation Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-5 h-4/5">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">Sélectionnez les dates</Text>
              <TouchableOpacity
                className="h-10 w-10 rounded-full bg-gray-100 items-center justify-center"
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <CalendarPicker
              onDateChange={(date, type) => {
                if (type === "START_DATE") {
                  setStartDate(date)
                } else {
                  setEndDate(date)
                }
              }}
              selectedStartDate={startDate || undefined}
              selectedEndDate={endDate || undefined}
              allowRangeSelection={true}
              minDate={new Date()}
              selectedDayColor="#3B82F6"
              selectedDayTextColor="#FFFFFF"
              todayBackgroundColor="#E5E7EB"
              todayTextStyle={{ color: "#1F2937" }}
              width={350}
            />

            <View className="mt-auto">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-500">Dates sélectionnées:</Text>
                <Text className="font-medium">
                  {startDate ? startDate.toLocaleDateString() : "---"}
                  {endDate ? ` → ${endDate.toLocaleDateString()}` : ""}
                </Text>
              </View>

              <TouchableOpacity
                className={`py-4 rounded-xl ${reservationLoading || !startDate || !endDate ? "bg-blue-300" : "bg-blue-600"}`}
                onPress={handleReserve}
                disabled={reservationLoading || !startDate || !endDate}
              >
                <Text className="text-white text-center font-bold text-lg">
                  {reservationLoading ? "Traitement en cours..." : "Confirmer la réservation"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default CarDetails

