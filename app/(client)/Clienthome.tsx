import { useEffect, useState } from "react"
import { View, Text, Image, ActivityIndicator, Dimensions, TouchableOpacity, ScrollView, TextInput} from "react-native"
import { getAllCars } from "~/services/cars/carService"
import type { Car } from "~/types/types"
import { useRouter } from "expo-router"
import { replaceIp } from "~/services/helpers/helpers"
import { getAllUsers } from "~/services/user/profileService"
import tw from "twrnc"
import { authService } from "~/services/auth/authService"
import { jwtDecode } from "jwt-decode"
import { fetchBrands, fetchColors, fetchModels } from "~/services/cars/api"


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
  const [brands, setBrands] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [selectedBrand, setSelectedBrand] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null)

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

  useEffect(() => {
    const loadFilters = async () => {
      const brands = await fetchBrands()
      setBrands(brands)
      const colors = await fetchColors()
      setColors(colors)
    }
    loadFilters()
  }, [])

  useEffect(() => {
    const loadModels = async () => {
      if (selectedBrand) {
        const models = await fetchModels(selectedBrand)
        setModels(models)
      }
    }
    loadModels()
  }, [selectedBrand])

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
  
  const toggleFilter = (filterName: string) => {
    if (expandedFilter === filterName) {
      setExpandedFilter(null)
    } else {
      setExpandedFilter(filterName)
    }
  }

  const filteredCars = cars.filter((car) => {
    return (
      (selectedBrand ? car.marque === selectedBrand : true) &&
      (selectedModel ? car.modele === selectedModel : true) &&
      (selectedColor ? car.couleur === selectedColor : true) &&
      (searchQuery ? car.marque.toLowerCase().includes(searchQuery.toLowerCase()) || car.modele.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    )
  })

  if (loading)
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    )

  if (error)
    return (
      <View style={tw`flex-1 justify-center items-center p-4 bg-white`}>
        <Text style={tw`text-orange-500 text-lg`}>{error}</Text>
      </View>
    )

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      <View style={tw`p-4`}>
        <Text style={tw`text-2xl font-bold mb-4 text-center text-orange-600`}>Entreprises</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-6`}>
          {companies.map((company) => (
            <TouchableOpacity
              key={company._id}
              style={tw`mr-4 bg-white rounded-xl shadow-md overflow-hidden w-40 border border-orange-200`}
              onPress={() => router.push({ pathname: "/detaills/CampanyDetails", params: { id: company._id, name: company.name, image: replaceIp(company.image, process.env.EXPO_PUBLIC_URL) } })}
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
                <Text style={tw`text-orange-500 text-center text-xs mt-1`}>Contacter</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={tw`text-2xl font-bold mb-4 text-center text-orange-600`}>Voitures disponibles</Text>

        <View style={tw`mb-4`}>
          <TextInput
            style={tw`border border-orange-300 rounded-lg p-2 mb-4 bg-white`}
            placeholder="Rechercher par marque ou modèle..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <View style={tw`flex-row flex-wrap justify-between mb-2`}>
            <TouchableOpacity 
              style={tw`bg-white border-2 ${selectedBrand ? 'border-orange-500' : 'border-orange-300'} rounded-lg py-2 px-4 mb-2 w-[48%]`}
              onPress={() => toggleFilter('brands')}
            >
              <Text style={tw`text-center text-orange-700 font-medium`}>
                {selectedBrand || 'Marques'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={tw`bg-white border-2 ${selectedModel ? 'border-orange-500' : 'border-orange-300'} rounded-lg py-2 px-4 mb-2 w-[48%]`}
              onPress={() => toggleFilter('models')}
              disabled={!selectedBrand}
            >
              <Text style={tw`text-center ${!selectedBrand ? 'text-gray-400' : 'text-orange-700'} font-medium`}>
                {selectedModel || 'Modèles'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={tw`bg-white border-2 ${selectedColor ? 'border-orange-500' : 'border-orange-300'} rounded-lg py-2 px-4 mb-2 w-full`}
              onPress={() => toggleFilter('colors')}
            >
              <Text style={tw`text-center text-orange-700 font-medium`}>
                {selectedColor || 'Couleurs'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {expandedFilter === 'brands' && (
            <View style={tw`bg-white border border-orange-200 rounded-lg p-2 mb-4 shadow-sm`}>
              <ScrollView style={tw`max-h-40`}>
                <View style={tw`flex-row flex-wrap`}>
                  <TouchableOpacity 
                    style={tw`m-1 px-3 py-1.5 rounded-full ${selectedBrand === '' ? 'bg-orange-500' : 'bg-orange-100'}`}
                    onPress={() => {
                      setSelectedBrand('')
                      setSelectedModel('')
                      setExpandedFilter(null)
                    }}
                  >
                    <Text style={tw`${selectedBrand === '' ? 'text-white' : 'text-orange-700'}`}>Toutes</Text>
                  </TouchableOpacity>
                  {brands.map(brand => (
                    <TouchableOpacity 
                      key={brand}
                      style={tw`m-1 px-3 py-1.5 rounded-full ${selectedBrand === brand ? 'bg-orange-500' : 'bg-orange-100'}`}
                      onPress={() => {
                        setSelectedBrand(brand)
                        setSelectedModel('')
                        setExpandedFilter(null)
                      }}
                    >
                      <Text style={tw`${selectedBrand === brand ? 'text-white' : 'text-orange-700'}`}>{brand}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
          
          {expandedFilter === 'models' && selectedBrand && (
            <View style={tw`bg-white border border-orange-200 rounded-lg p-2 mb-4 shadow-sm`}>
              <ScrollView style={tw`max-h-40`}>
                <View style={tw`flex-row flex-wrap`}>
                  <TouchableOpacity 
                    style={tw`m-1 px-3 py-1.5 rounded-full ${selectedModel === '' ? 'bg-orange-500' : 'bg-orange-100'}`}
                    onPress={() => {
                      setSelectedModel('')
                      setExpandedFilter(null)
                    }}
                  >
                    <Text style={tw`${selectedModel === '' ? 'text-white' : 'text-orange-700'}`}>Tous</Text>
                  </TouchableOpacity>
                  {models.map(model => (
                    <TouchableOpacity 
                      key={model}
                      style={tw`m-1 px-3 py-1.5 rounded-full ${selectedModel === model ? 'bg-orange-500' : 'bg-orange-100'}`}
                      onPress={() => {
                        setSelectedModel(model)
                        setExpandedFilter(null)
                      }}
                    >
                      <Text style={tw`${selectedModel === model ? 'text-white' : 'text-orange-700'}`}>{model}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
          
          {expandedFilter === 'colors' && (
            <View style={tw`bg-white border border-orange-200 rounded-lg p-2 mb-4 shadow-sm`}>
              <ScrollView style={tw`max-h-40`}>
                <View style={tw`flex-row flex-wrap`}>
                  <TouchableOpacity 
                    style={tw`m-1 px-3 py-1.5 rounded-full ${selectedColor === '' ? 'bg-orange-500' : 'bg-orange-100'}`}
                    onPress={() => {
                      setSelectedColor('')
                      setExpandedFilter(null)
                    }}
                  >
                    <Text style={tw`${selectedColor === '' ? 'text-white' : 'text-orange-700'}`}>Toutes</Text>
                  </TouchableOpacity>
                  {colors.map(color => (
                    <TouchableOpacity 
                      key={color}
                      style={tw`m-1 px-3 py-1.5 rounded-full ${selectedColor === color ? 'bg-orange-500' : 'bg-orange-100'}`}
                      onPress={() => {
                        setSelectedColor(color)
                        setExpandedFilter(null)
                      }}
                    >
                      <Text style={tw`${selectedColor === color ? 'text-white' : 'text-orange-700'}`}>{color}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {filteredCars.map((car) => (
          <TouchableOpacity
            key={car._id}
            style={tw`bg-white rounded-xl shadow-md mb-6 overflow-hidden border border-orange-200`}
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
                    <View style={tw`bg-orange-500 bg-opacity-70 rounded-full p-2`}>
                      <Text style={tw`text-white text-xl font-bold`}>{"<"}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`h-full px-2 justify-center`}
                    onPress={() => nextImage(car._id, car.images.flat().length)}
                  >
                    <View style={tw`bg-orange-500 bg-opacity-70 rounded-full p-2`}>
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
                        index === currentImageIndexes[car._id] ? "bg-orange-500" : "bg-white bg-opacity-70"
                      }`}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={tw`p-4`}>
              <Text style={tw`text-xl font-bold text-orange-700`}>
                {car.marque} {car.modele}
              </Text>

              <View style={tw`flex-row justify-between items-center mt-2`}>
                <Text style={tw`${car.statut === "réservé" ? "text-red-500" : "text-green-500"} font-semibold`}>
                  {car.statut}
                </Text>
                <View style={tw`bg-orange-500 px-3 py-1 rounded-full`}>
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