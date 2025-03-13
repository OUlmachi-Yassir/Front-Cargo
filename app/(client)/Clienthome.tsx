import { useEffect, useState } from "react"
import { View, Text, Image, ActivityIndicator, Dimensions, TouchableOpacity, ScrollView } from "react-native"
import { getAllCars } from "~/services/cars/carService"
import type { Car } from "~/types/types"
import { useRouter } from "expo-router"
import { replaceIp } from "~/services/helpers/helpers"
import { getAllUsers } from "~/services/user/profileService"
import tw from "twrnc"
import { authService } from "~/services/auth/authService"
import { jwtDecode } from "jwt-decode"

const { width } = Dimensions.get("window")

interface Company {
  _id: string
  name: string
  image: string
}

const ClientHome = () => {
  const [cars, setCars] = useState<Car[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentImageIndexes, setCurrentImageIndexes] = useState<Record<string, number>>({})

  const router = useRouter()

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await getAllCars()
        setCars(data)
        const initialIndexes: Record<string, number> = {}
        data.forEach((car) => {
          initialIndexes[car._id] = 0
        })
        setCurrentImageIndexes(initialIndexes)
      } catch (err) {
        setError("Impossible de récupérer les voitures.")
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [])

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const users = await getAllUsers()
        const filteredCompanies = users.filter((user) => user.role === "company")
        setCompanies(filteredCompanies)
      } catch (err) {
        setError("Impossible de récupérer les utilisateurs.")
      } finally {
        setLoading(false)
      }
    }
    fetchCompanies()
  }, [])

  const startChat = async (receiverId: string) => {
    try {
      const token = await authService.getToken()
      if (!token) throw new Error("No token found")

      const decodedToken: any = jwtDecode(token)
      const loggedUser = decodedToken.id

      if (!loggedUser) return

      router.push({ pathname: "/chats/CampanyChat", params: { id: receiverId } })
    } catch (error) {
      console.error("Erreur lors du démarrage du chat", error)
    }
  }

  const nextImage = (carId: string, imagesLength: number) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [carId]: (prev[carId] + 1) % imagesLength,
    }))
  }

  const prevImage = (carId: string, imagesLength: number) => {
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [carId]: (prev[carId] - 1 + imagesLength) % imagesLength,
    }))
  }

  if (loading)
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )

  if (error)
    return (
      <View style={tw`flex-1 justify-center items-center p-4`}>
        <Text style={tw`text-red-500 text-lg`}>{error}</Text>
      </View>
    )

  return (
    <ScrollView style={tw`flex-1 bg-gray-50`}>
      <View style={tw`p-4`}>
        <Text style={tw`text-2xl font-bold mb-4 text-center text-gray-800`}>Entreprises</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-6`}>
          {companies.map((company) => (
            <TouchableOpacity
              key={company._id}
              style={tw`mr-4 bg-white rounded-xl shadow-md overflow-hidden w-40`}
              onPress={() => startChat(company._id)}
            >
              <Image
                source={
                  company.image
                    ? { uri: replaceIp(company.image, process.env.EXPO_PUBLIC_URL) }
                    : require("~/assets/images/blank-profile-picture-973460_1280.png")
                }
                style={tw`w-40 h-40`}
              />
              <View style={tw`p-3`}>
                <Text style={tw`font-semibold text-gray-800 text-center`}>{company.name}</Text>
                <Text style={tw`text-blue-500 text-center text-xs mt-1`}>Contacter</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={tw`text-2xl font-bold mb-4 text-center text-gray-800`}>Voitures disponibles</Text>

        {cars.map((car) => (
          <TouchableOpacity
            key={car._id}
            style={tw`bg-white rounded-xl shadow-md mb-6 overflow-hidden`}
            onPress={() => router.push({ pathname: "/CarDetails", params: { id: car._id } })}
          >
            <View style={tw`relative`}>
              {car.images.flat().length > 0 && (
                <Image
                  source={{
                    uri: replaceIp(car.images.flat()[currentImageIndexes[car._id]], process.env.EXPO_PUBLIC_URL),
                  }}
                  style={tw`w-full h-56 rounded-t-xl`}
                  resizeMode="cover"
                />
              )}

              {car.images.flat().length > 1 && (
                <View style={tw`absolute inset-x-0 top-0 bottom-0 flex-row justify-between items-center`}>
                  <TouchableOpacity
                    style={tw`h-full px-2 justify-center`}
                    onPress={() => prevImage(car._id, car.images.flat().length)}
                  >
                    <View style={tw`bg-black bg-opacity-30 rounded-full p-2`}>
                      <Text style={tw`text-white text-xl font-bold`}>{"<"}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`h-full px-2 justify-center`}
                    onPress={() => nextImage(car._id, car.images.flat().length)}
                  >
                    <View style={tw`bg-black bg-opacity-30 rounded-full p-2`}>
                      <Text style={tw`text-white text-xl font-bold`}>{">"}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {car.images.flat().length > 1 && (
                <View style={tw`absolute bottom-2 inset-x-0 flex-row justify-center`}>
                  {car.images.flat().map((_, index) => (
                    <View
                      key={index}
                      style={tw`h-2 w-2 rounded-full mx-1 ${
                        index === currentImageIndexes[car._id] ? "bg-white" : "bg-gray-400 bg-opacity-60"
                      }`}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={tw`p-4`}>
              <Text style={tw`text-xl font-bold text-gray-800`}>
                {car.marque} {car.modele}
              </Text>

              <View style={tw`flex-row justify-between items-center mt-2`}>
                <Text style={tw`${car.statut === "réservé" ? "text-red-500" : "text-green-500"} font-semibold`}>
                  {car.statut}
                </Text>
                <View style={tw`bg-blue-500 px-3 py-1 rounded-full`}>
                  <Text style={tw`text-white font-medium`}>Voir détails</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

export default ClientHome

