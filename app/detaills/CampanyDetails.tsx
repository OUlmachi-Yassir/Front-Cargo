"use client"

import { useEffect, useState } from "react"
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, StatusBar } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import tw from "twrnc"
import { authService } from "~/services/auth/authService"
import { jwtDecode } from "jwt-decode"
import { getAllCars } from "~/services/cars/carService"
import type { Car } from "~/types/types"
import { replaceIp } from "~/services/helpers/helpers"
import { Ionicons } from "@expo/vector-icons"

const CompanyDetails = () => {
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const router = useRouter()
  const { id, name, image } = useLocalSearchParams<{
    id: string
    name: string
    image: string
  }>()

  const startChat = async () => {
    try {
      const token = await authService.getToken()
      if (!token) throw new Error("No token found")

      const decodedToken: any = jwtDecode(token)
      const loggedUser = decodedToken.id
      console.log(decodedToken)

      if (!loggedUser) return

      router.push({ pathname: "/chats/CampanyChat", params: { id } })
    } catch (error) {
      console.error("Erreur lors du démarrage du chat", error)
    }
  }

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await getAllCars()
        setCars(data)
        const filtered = data.filter((car: Car) => car.entrepriseId === id)
        console.log(filtered)
        setFilteredCars(filtered)
      } catch (err) {
        setError("Impossible de récupérer les voitures.")
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [id])

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={tw`mt-4 text-gray-500`}>Chargement...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center p-4 bg-white`}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={tw`mt-4 text-center text-red-500 font-medium`}>{error}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <StatusBar barStyle="light-content" />

      <View style={tw`relative`}>
        <Image
          source={image ? { uri: image } : require("~/assets/images/blank-profile-picture-973460_1280.png")}
          style={tw`w-full h-72`}
          resizeMode="cover"
        />

        <View style={tw`absolute inset-0 bg-black/30`} />

        <TouchableOpacity
          style={tw`absolute top-12 left-4 z-10 bg-black/30 p-2 rounded-full`}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={tw`absolute bottom-0 left-0 right-0 p-5`}>
          <Text style={tw`text-3xl font-bold text-white mb-1`}>{name}</Text>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="business-outline" size={16} color="#F97316" />
            <Text style={tw`text-white ml-1`}>Entreprise de location</Text>
          </View>
        </View>
      </View>

      <View style={tw`flex-1 px-5 pt-6 -mt-5 rounded-t-3xl bg-white`}>
        <Text style={tw`text-gray-700 mb-5 leading-5`}>
          Détails supplémentaires sur l'entreprise peuvent être ajoutés ici.
        </Text>

        <TouchableOpacity style={tw`bg-orange-500 py-3.5 rounded-xl items-center mb-6 shadow-sm`} onPress={startChat}>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" />
            <Text style={tw`text-white font-bold ml-2`}>Contacter l'entreprise</Text>
          </View>
        </TouchableOpacity>

        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-xl font-bold text-gray-800`}>Voitures disponibles</Text>
          <Text style={tw`text-orange-500 font-medium`}>{filteredCars.length} véhicules</Text>
        </View>

        {filteredCars.length > 0 ? (
          <FlatList
            data={filteredCars}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tw`pb-6`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={tw`bg-white rounded-xl border border-gray-100 shadow-sm mb-4 overflow-hidden`}
                onPress={() => router.push({ pathname: "/CarDetails", params: { id: item._id } })}
              >
                <View style={tw`flex-row`}>
                  <Image
                    source={{
                      uri: replaceIp(item.images[0], process.env.EXPO_PUBLIC_URL),
                    }}
                    style={tw`h-24 w-24 rounded-l-xl`}
                    resizeMode="cover"
                  />
                  <View style={tw`flex-1 p-4 justify-center`}>
                    <View style={tw`flex-row justify-between items-start`}>
                      <View>
                        <Text style={tw`text-lg font-bold text-gray-800`}>
                          {item.marque} {item.modele}
                        </Text>
                        <Text style={tw`text-gray-500 text-sm`}>{item.annee || "Année non spécifiée"}</Text>
                      </View>
                      <View style={tw`bg-orange-100 px-2 py-1 rounded-lg`}>
                        <Text style={tw`text-orange-600 font-bold`}>{item.price}€/j</Text>
                      </View>
                    </View>

                    <View style={tw`flex-row mt-2 pt-2 border-t border-gray-100`}>
                      {item.statut && (
                        <View style={tw`flex-row items-center`}>
                          <View
                            style={tw`w-2 h-2 rounded-full ${item.statut === "bon état" ? "bg-green-500" : "bg-red-500"}`}
                          />
                          <Text style={tw`text-gray-500 text-xs ml-1`}>{item.statut}</Text>
                        </View>
                      )}
                      {item.kilometrage && (
                        <View style={tw`flex-row items-center ml-4`}>
                          <Ionicons name="speedometer-outline" size={12} color="#9CA3AF" />
                          <Text style={tw`text-gray-500 text-xs ml-1`}>{item.kilometrage} km</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={tw`flex-1 justify-center items-center p-8 bg-gray-50 rounded-xl mt-4`}>
            <Ionicons name="car-outline" size={48} color="#D1D5DB" />
            <Text style={tw`text-gray-500 mt-4 text-center`}>Aucune voiture disponible pour cette entreprise.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default CompanyDetails

