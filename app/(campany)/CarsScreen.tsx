import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import { createCar } from "~/services/cars/carService"
import { authService } from "~/services/auth/authService"
import { Ionicons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"
import tw from "twrnc"
import { fetchBrands, fetchModels, fetchColors } from "~/services/cars/api"

const AddCarScreen = () => {

  const [marque, setMarque] = useState("")
  const [modele, setModele] = useState("")
  const [annee, setAnnee] = useState("")
  const [couleur, setCouleur] = useState("")
  const [kilometrage, setKilometrage] = useState("")
  const [price, setPrice] = useState("")
  const [images, setImages] = useState<string[]>([])

  const [brands, setBrands] = useState<string[]>([])
  const [models, setModels] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const brandsData = await fetchBrands()
        setBrands(brandsData)

        const colorsData = await fetchColors()
        setColors(colorsData)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    const loadModels = async () => {
      if (!marque) return

      try {
        const modelsData = await fetchModels(marque)
        setModels(modelsData)
      } catch (error) {
        console.error("Error loading models:", error)
      }
    }

    loadModels()
  }, [marque])

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
    })

    if (!result.canceled && result.assets.length > 0) {
      const newImages = result.assets.map((asset) => asset.uri)
      setImages([...images, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  const handleCreateCar = async () => {
    if (!marque || !modele || !annee || !couleur || !kilometrage || !price) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires")
      return
    }

    try {
      setLoading(true)
      const token = await authService.getToken()
      if (!token) throw new Error("Token non disponible")

      const carData = { marque, modele, annee, couleur, kilometrage, price}
      await createCar(token, carData, images)

      Alert.alert("Succès", "Voiture ajoutée avec succès")
      setMarque("")
      setModele("")
      setAnnee("")
      setCouleur("")
      setKilometrage("")
      setPrice("")
      setImages([])
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'ajouter la voiture")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient colors={["#FF8C00", "#FFA500", "#FFD700"]} style={tw`flex-1`}>
      <ScrollView>
        <View style={tw`bg-white p-5 rounded-t-3xl shadow-lg mt-12 min-h-[85%]`}>
          <Text style={tw`text-2xl font-bold text-center mb-6`}>Ajouter une Voiture</Text>

          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-600 mb-1 ml-1`}>Marque</Text>
            <View style={tw`border border-gray-300 rounded-lg overflow-hidden`}>
              <Picker
                selectedValue={marque}
                onValueChange={(value) => {
                  setMarque(value)
                  setModele("") 
                }}
              >
                <Picker.Item label="Sélectionner une marque" value="" />
                {brands.map((brand, index) => (
                  <Picker.Item key={index} label={brand} value={brand} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={tw`mb-4 ${!marque ? "opacity-50" : ""}`}>
            <Text style={tw`text-gray-600 mb-1 ml-1`}>Modèle</Text>
            <View style={tw`border border-gray-300 rounded-lg overflow-hidden`}>
              <Picker selectedValue={modele} onValueChange={(value) => setModele(value)} enabled={!!marque}>
                <Picker.Item label="Sélectionner un modèle" value="" />
                {models.map((model, index) => (
                  <Picker.Item key={index} label={model} value={model} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-600 mb-1 ml-1`}>Année</Text>
            <View style={tw`flex-row items-center border border-gray-300 rounded-lg p-3`}>
              <Ionicons name="calendar-outline" size={20} style={tw`text-orange-500 mr-2`} />
              <TextInput
                placeholder="Ex: 2020"
                value={annee}
                onChangeText={setAnnee}
                keyboardType="number-pad"
                style={tw`flex-1`}
              />
            </View>
          </View>

          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-600 mb-1 ml-1`}>Couleur</Text>
            <View style={tw`border border-gray-300 rounded-lg overflow-hidden`}>
              <Picker selectedValue={couleur} onValueChange={(value) => setCouleur(value)}>
                <Picker.Item label="Sélectionner une couleur" value="" />
                {colors.map((color, index) => (
                  <Picker.Item key={index} label={color} value={color} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-600 mb-1 ml-1`}>Kilométrage</Text>
            <View style={tw`flex-row items-center border border-gray-300 rounded-lg p-3`}>
              <Ionicons name="speedometer-outline" size={20} style={tw`text-orange-500 mr-2`} />
              <TextInput
                placeholder="Ex: 50000"
                value={kilometrage}
                onChangeText={setKilometrage}
                keyboardType="number-pad"
                style={tw`flex-1`}
              />
            </View>
          </View>

          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-600 mb-1 ml-1`}>Prix</Text>
            <View style={tw`flex-row items-center border border-gray-300 rounded-lg p-3`}>
              <Ionicons name="pricetag-outline" size={20} style={tw`text-orange-500 mr-2`} />
              <TextInput
                placeholder="Ex: 15000"
                value={price}
                onChangeText={setPrice}
                keyboardType="number-pad"
                style={tw`flex-1`}
              />
            </View>
          </View>

          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-600 mb-1 ml-1`}>Photos</Text>
            <TouchableOpacity
              style={tw`border-2 border-dashed border-gray-300 rounded-lg p-4 items-center justify-center bg-gray-50`}
              onPress={pickImage}
            >
              <Ionicons name="camera" size={24} style={tw`text-orange-500 mb-1`} />
              <Text style={tw`text-gray-700`}>Ajouter des photos</Text>
            </TouchableOpacity>
          </View>

          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`mb-4`}>
              {images.map((uri, index) => (
                <View key={index} style={tw`relative mr-2`}>
                  <Image source={{ uri }} style={tw`w-24 h-24 rounded-lg`} />
                  <TouchableOpacity
                    style={tw`absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center`}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={tw`bg-orange-500 p-4 rounded-lg mt-4`} onPress={handleCreateCar} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={tw`text-white font-bold text-center text-lg`}>Ajouter la voiture</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

export default AddCarScreen

