import { useEffect, useState } from "react"
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { fetchCarDetails } from "~/services/cars/carService"
import type { Car } from "~/types/types"
import { replaceIp } from "../../services/helpers/helpers"
import CalendarPicker from "react-native-calendar-picker"
import { authService } from "~/services/auth/authService"
import { jwtDecode } from "jwt-decode"
import { fetchUserReservations, useReservation } from "~/services/cars/reservationService"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

const mapReservationStatus = (status: string) => {
  switch (status) {
    case "en attente":
      return "pending"
    case "réservé":
      return "approved"
    case "rejeté":
      return "rejected"
    default:
      return "pending"
  }
}

const CarDetails = () => {
  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [reservations, setReservations] = useState<any[]>([])

  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

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
      if (!userId || !id) return

      try {
        const data = await fetchUserReservations(userId, id)
        console.log("Réservations chargées:", data)

        if (Array.isArray(data)) {
          const allReservations = data
            .filter((item: any) => item._id === id)
            .flatMap((item: any) => item.reservations || [])

          const userReservations = allReservations.filter((reservation: any) => reservation.userId === userId)

          console.log("Filtered Reservations:", userReservations)
          setReservations(userReservations)
        } else {
          console.error("Unexpected data structure:", data)
        }
      } catch (error) {
        console.error("Error fetching reservations:", error)
      }
    }

    fetchReservations()
  }, [userId, id])

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

  const isCarReservedForPeriod = (startDate: Date, endDate: Date) => {
    return reservations.some((reservation) => {
      const reservationStartDate = new Date(reservation.startDate)
      const reservationEndDate = new Date(reservation.endDate)
      return (
        (startDate >= reservationStartDate && startDate <= reservationEndDate) ||
        (endDate >= reservationStartDate && endDate <= reservationEndDate) ||
        (startDate <= reservationStartDate && endDate >= reservationEndDate)
      )
    })
  }

  const handleReserve = async () => {
    if (!id || !startDate || !endDate) return

    if (isCarReservedForPeriod(startDate, endDate)) {
      Alert.alert("Erreur", "Cette voiture est déjà réservée pour cette période.")
      return
    }

    await handleReservation(id)
    setIsModalVisible(false)
  }

  const renderStatusBadge = () => {
    if (!car?.statut) return null

    const isAvailable = car.statut === "bon état"
    return (
      <View className={`px-4 py-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-rose-500"}`}>
        <Text className="font-medium text-white text-xs">{car.statut}</Text>
      </View>
    )
  }

  const renderReservationStatus = () => {
    if (!reservationStatus) return null

    const displayStatus = mapReservationStatus(reservationStatus)

    let statusColor = ""
    let statusBg = ""
    let statusText = ""
    let statusIcon = ""

    switch (displayStatus) {
      case "pending":
        statusColor = "text-amber-600"
        statusBg = "bg-amber-50"
        statusText = "En attente de confirmation du propriétaire"
        statusIcon = "time-outline"
        break
      case "approved":
        statusColor = "text-emerald-600"
        statusBg = "bg-emerald-50"
        statusText = "Réservation confirmée"
        statusIcon = "checkmark-circle-outline"
        break
      case "rejected":
        statusColor = "text-rose-600"
        statusBg = "bg-rose-50"
        statusText = "Réservation refusée"
        statusIcon = "close-circle-outline"
        break
      default:
        return null
    }

    return (
      <View className={`mt-4 p-4 rounded-2xl ${statusBg} border border-${statusColor.replace("text-", "")}/20`}>
        <View className="flex-row items-center">
          <Ionicons
            name={statusIcon}
            size={24}
            color={displayStatus === "pending" ? "#D97706" : displayStatus === "approved" ? "#059669" : "#E11D48"}
          />
          <Text className={`ml-2 font-semibold ${statusColor}`}>{statusText}</Text>
        </View>
      </View>
    )
  }

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    )

  if (error)
    return (
      <View className="flex-1 justify-center items-center p-4 bg-slate-50">
        <Text className="text-rose-500 text-center font-medium">{error}</Text>
      </View>
    )

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1">
        <View className="relative">
        <TouchableOpacity
          className= 'absolute top-12 left-4 z-10 bg-black/20 p-2 rounded-full'
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
          <View className="relative h-80 bg-slate-200">
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
                  className="w-screen h-80"
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {car?.images && car.images.flat().length > 1 && (
              <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
                {car.images.flat().map((_, index) => (
                  <View
                    key={index}
                    className={`h-1.5 w-8 rounded-full mx-1 ${
                      index === activeImageIndex ? "bg-indigo-500" : "bg-white/50"
                    }`}
                  />
                ))}
              </View>
            )}

            <View className="absolute top-4 right-4">{renderStatusBadge()}</View>
          </View>

          <View className="px-5 pt-6 pb-20">
            <View className="bg-white rounded-3xl p-6 shadow-sm -mt-10 mb-6">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-slate-800">
                    {car?.marque} {car?.modele}
                  </Text>
                  <Text className="text-lg font-medium text-orange-500 mt-1">{car?.annee}</Text>
                </View>
                {car?.price && (
                  <View className="bg-indigo-100 px-3 py-1 rounded-lg">
                    <Text className="font-semibold text-indigo-700">{car.price} €/jour</Text>
                  </View>
                )}
              </View>

              {renderReservationStatus()}

              <View className="mt-6 pt-6 border-t border-slate-100">
                <Text className="text-lg font-semibold mb-4 text-slate-800">Caractéristiques</Text>

                <View className="flex-row flex-wrap">
                  <View className="w-1/2 mb-4 flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-2">
                      <Ionicons name="color-palette-outline" size={16} color="#FFA500" />
                    </View>
                    <View>
                      <Text className="text-xs text-slate-500">Couleur</Text>
                      <Text className="font-medium text-slate-800">{car?.couleur || "N/A"}</Text>
                    </View>
                  </View>

                  <View className="w-1/2 mb-4 flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-2">
                      <Ionicons name="speedometer-outline" size={16} color="#FFA500" />
                    </View>
                    <View>
                      <Text className="text-xs text-slate-500">Kilométrage</Text>
                      <Text className="font-medium text-slate-800">{car?.kilometrage || "N/A"} km</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>


            <View className="bg-white rounded-3xl p-6 shadow-sm mb-6">
              <Text className="text-lg font-semibold mb-4 text-slate-800">Vos réservations</Text>

              {reservations.length > 0 ? (
                reservations.map((reservation, index) => {
                  const startDate = new Date(reservation.startDate).toLocaleDateString("fr-FR")
                  const endDate = new Date(reservation.endDate).toLocaleDateString("fr-FR")

                  const status = reservation.statut || "en attente"
                  const isApproved = status === "réservé"
                  const isRejected = status === "rejeté"

                  let bgColor = "bg-amber-50"
                  let textColor = "text-amber-600"
                  let iconName = "time-outline"
                  let iconColor = "#D97706"
                  let statusText = "En attente"

                  if (isApproved) {
                    bgColor = "bg-emerald-50"
                    textColor = "text-emerald-600"
                    iconName = "checkmark-circle"
                    iconColor = "#059669"
                    statusText = "Confirmée"
                  } else if (isRejected) {
                    bgColor = "bg-rose-50"
                    textColor = "text-rose-600"
                    iconName = "close-circle"
                    iconColor = "#E11D48"
                    statusText = "Rejetée"
                  }

                  return (
                    <View key={index} className={`mb-4 p-4 rounded-xl ${bgColor}`}>
                      <View className="flex-row items-center mb-2">
                        <Ionicons name={iconName} size={20} color={iconColor} />
                        <Text className={`ml-2 font-semibold ${textColor}`}>{statusText}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                        <Text className="ml-2 text-slate-600">
                          Du {startDate} au {endDate}
                        </Text>
                      </View>
                    </View>
                  )
                })
              ) : (
                <View className="bg-slate-50 p-4 rounded-xl">
                  <Text className="text-slate-500 text-center">Aucune réservation pour le moment.</Text>
                </View>
              )}
            </View>

            {!reservationStatus && (
              <TouchableOpacity
                className="bg-orange-500 py-4 px-6 rounded-2xl shadow-md"
                onPress={() => setIsModalVisible(true)}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="calendar" size={20} color="white" />
                  <Text className="text-white text-center font-bold text-lg ml-2">Réserver cette voiture</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 h-4/5">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-800">Sélectionnez les dates</Text>
              <TouchableOpacity
                className="h-10 w-10 rounded-full bg-slate-100 items-center justify-center"
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <View className="bg-slate-50 rounded-2xl p-4 mb-6">
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
                selectedDayColor="#FFA500"
                selectedDayTextColor="#FFFFFF"
                todayBackgroundColor="#EEF2FF"
                todayTextStyle={{ color: "#4F46E5" }}
                textStyle={{ color: "#1F2937" }}
                width={width - 60}
              />
            </View>

            <View className="mt-auto">
              <View className="flex-row justify-between items-center mb-6 p-4 bg-orange-50 rounded-xl">
                <View>
                  <Text className="text-slate-500 text-sm">Dates sélectionnées</Text>
                  <Text className="font-medium text-slate-800 text-base">
                    {startDate ? startDate.toLocaleDateString() : "---"}
                    {endDate ? ` → ${endDate.toLocaleDateString()}` : ""}
                  </Text>
                </View>
                <Ionicons name="calendar" size={24} color="#6366F1" />
              </View>

              <TouchableOpacity
                className={`py-4 rounded-xl flex-row items-center justify-center ${
                  reservationLoading || !startDate || !endDate ? "bg-orange-500" : "bg-orange-600"
                }`}
                onPress={handleReserve}
                disabled={reservationLoading || !startDate || !endDate}
              >
                {reservationLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text className="text-white text-center font-bold text-lg ml-2">Confirmer la réservation</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default CarDetails

