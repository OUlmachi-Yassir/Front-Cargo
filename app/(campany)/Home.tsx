import { useEffect, useState } from "react"
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView } from "react-native"
import { authService } from "~/services/auth/authService"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import tw from "twrnc"



type Car = {
  _id: string;
  marque: string;
  modele: string;
  reservations?: Reservation[];
};

type Reservation = {
  _id: string;
  userId: string;
  startDate: string;
  endDate: string;
  statut: "en attente" | "approuvé" | "rejeté";
};



const HomeScreen = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [statistics, setStatistics] = useState({
    totalCars: 0,
    totalReservations: 0,
    pendingReservations: 0,
    approvedReservations: 0,
    rejectedReservations: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    const token = await authService.getToken()
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/cars/statistics/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des statistiques: ${response.status}`)
      }

      const text = await response.text()
      const data = text ? JSON.parse(text) : null
      setStatistics(
        data || {
          totalCars: 0,
          totalReservations: 0,
          pendingReservations: 0,
          approvedReservations: 0,
          rejectedReservations: 0,
        },
      )
    } catch (error) {
      console.error("Error fetching statistics:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }

  const fetchCars = async () => {
    const token = await authService.getToken()
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/cars/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des voitures")
      }

      const data = await response.json()
      setCars(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveReservation = async (carId: string, reservationId: string) => {
    const token = await authService.getToken()
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_APP_API_URL}/cars/${carId}/reservations/${reservationId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Erreur lors de l'approbation de la réservation")
      }

      fetchCars()
      fetchStatistics()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleRejectReservation = async (carId: string, reservationId: string) => {
    const token = await authService.getToken()
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_APP_API_URL}/cars/${carId}/reservations/${reservationId}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Erreur lors du rejet de la réservation")
      }

      fetchCars()
      fetchStatistics()
    } catch (error: any) {
      setError(error.message)
    }
  }

  useEffect(() => {
    fetchStatistics()
    fetchCars()
  }, [])

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center p-4 bg-white`}>
        <Ionicons name="alert-circle" size={48} color="#FF8C00" />
        <Text style={tw`text-red-500 text-lg mt-4 text-center`}>Erreur : {error}</Text>
      </View>
    )
  }

  const renderCarItem = ({ item }: { item: Car }) => (
    <View style={tw`mb-6 bg-white rounded-xl shadow-md overflow-hidden`}>
      <View style={tw`bg-orange-500 px-4 py-3`}>
        <Text style={tw`text-white font-bold text-lg`}>
          {item.marque} {item.modele}
        </Text>
      </View>

      {item.reservations && item.reservations.length > 0 ? (
        item.reservations.map((reservation) => (
          <View key={reservation._id} style={tw`p-4 border-b border-gray-100`}>
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <Text style={tw`font-medium text-gray-800`}>Réservation</Text>
              <View
                style={tw`
                px-2 py-1 rounded-full
                ${
                  reservation.statut === "en attente"
                    ? "bg-yellow-100"
                    : reservation.statut === "approuvé"
                      ? "bg-green-100"
                      : "bg-red-100"
                }
              `}
              >
                <Text
                  style={tw`
                  text-xs font-medium
                  ${
                    reservation.statut === "en attente"
                      ? "text-yellow-700"
                      : reservation.statut === "approuvé"
                        ? "text-green-700"
                        : "text-red-700"
                  }
                `}
                >
                  {reservation.statut.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={tw`flex-row items-center mb-1`}>
              <Ionicons name="person-outline" size={16} style={tw`text-gray-500 mr-2`} />
              <Text style={tw`text-gray-700`}>ID: {reservation.userId}</Text>
            </View>

            <View style={tw`flex-row items-center mb-1`}>
              <Ionicons name="calendar-outline" size={16} style={tw`text-gray-500 mr-2`} />
              <Text style={tw`text-gray-700`}>
                Du {new Date(reservation.startDate).toLocaleDateString()} au{" "}
                {new Date(reservation.endDate).toLocaleDateString()}
              </Text>
            </View>

            {reservation.statut === "en attente" && (
              <View style={tw`flex-row justify-end mt-3`}>
                <TouchableOpacity
                  style={tw`bg-red-500 px-4 py-2 rounded-lg mr-2`}
                  onPress={() => handleRejectReservation(item._id, reservation._id)}
                >
                  <Text style={tw`text-white font-medium`}>Refuser</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`bg-green-500 px-4 py-2 rounded-lg`}
                  onPress={() => handleApproveReservation(item._id, reservation._id)}
                >
                  <Text style={tw`text-white font-medium`}>Approuver</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      ) : (
        <View style={tw`p-4 items-center`}>
          <Text style={tw`text-gray-500 italic`}>Aucune réservation</Text>
        </View>
      )}
    </View>
  )

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <ScrollView>
        <View style={tw`p-4`}>
          <View style={tw`flex-row items-center mb-6`}>
            <View style={tw`w-1 h-8 bg-orange-500 mr-3 rounded-full`}></View>
            <Text style={tw`text-2xl font-bold text-gray-800`}>Tableau de bord</Text>
          </View>

          {/* Statistics Cards */}
          <View style={tw`flex-row flex-wrap justify-between mb-6`}>
            <View style={tw`bg-white rounded-xl shadow-sm p-4 mb-4 w-[48%]`}>
              <View style={tw`w-10 h-10 rounded-full bg-orange-100 items-center justify-center mb-2`}>
                <Ionicons name="car" size={20} color="#FF8C00" />
              </View>
              <Text style={tw`text-gray-500 text-sm`}>Mes voitures</Text>
              <Text style={tw`text-2xl font-bold text-gray-800`}>{statistics.totalCars}</Text>
            </View>

            <View style={tw`bg-white rounded-xl shadow-sm p-4 mb-4 w-[48%]`}>
              <View style={tw`w-10 h-10 rounded-full bg-orange-100 items-center justify-center mb-2`}>
                <Ionicons name="calendar" size={20} color="#FF8C00" />
              </View>
              <Text style={tw`text-gray-500 text-sm`}>Réservations totales</Text>
              <Text style={tw`text-2xl font-bold text-gray-800`}>{statistics.totalReservations}</Text>
            </View>

            <View style={tw`bg-white rounded-xl shadow-sm p-4 mb-4 w-[31%]`}>
              <View style={tw`w-8 h-8 rounded-full bg-yellow-100 items-center justify-center mb-2`}>
                <Ionicons name="time-outline" size={16} color="#EAB308" />
              </View>
              <Text style={tw`text-gray-500 text-xs`}>En attente</Text>
              <Text style={tw`text-xl font-bold text-gray-800`}>{statistics.pendingReservations}</Text>
            </View>

            <View style={tw`bg-white rounded-xl shadow-sm p-4 mb-4 w-[31%]`}>
              <View style={tw`w-8 h-8 rounded-full bg-green-100 items-center justify-center mb-2`}>
                <Ionicons name="checkmark-outline" size={16} color="#16A34A" />
              </View>
              <Text style={tw`text-gray-500 text-xs`}>Approuvées</Text>
              <Text style={tw`text-xl font-bold text-gray-800`}>{statistics.approvedReservations}</Text>
            </View>

            <View style={tw`bg-white rounded-xl shadow-sm p-4 mb-4 w-[31%]`}>
              <View style={tw`w-8 h-8 rounded-full bg-red-100 items-center justify-center mb-2`}>
                <Ionicons name="close-outline" size={16} color="#DC2626" />
              </View>
              <Text style={tw`text-gray-500 text-xs`}>Refusées</Text>
              <Text style={tw`text-xl font-bold text-gray-800`}>{statistics.rejectedReservations}</Text>
            </View>
          </View>

          <View style={tw`mb-4`}>
            <View style={tw`flex-row items-center mb-4`}>
              <MaterialCommunityIcons name="car-multiple" size={20} color="#FF8C00" style={tw`mr-2`} />
              <Text style={tw`text-lg font-bold text-gray-800`}>Mes voitures et réservations</Text>
            </View>

            {cars.length > 0 ? (
              <FlatList
                data={cars}
                keyExtractor={(item) => item._id}
                renderItem={renderCarItem}
                scrollEnabled={false}
              />
            ) : (
              <View style={tw`bg-white p-6 rounded-xl items-center justify-center`}>
                <Ionicons name="car-outline" size={48} color="#D1D5DB" />
                <Text style={tw`text-gray-400 mt-2 text-center`}>Vous n'avez pas encore ajouté de voitures</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen

