import React from "react"
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import tw from "twrnc"
import { authService } from "~/services/auth/authService"
import { jwtDecode } from "jwt-decode"

const CompanyDetails = () => {
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

      if (!loggedUser) return

      router.push({ pathname: "/chats/CampanyChat", params: { id } })
    } catch (error) {
      console.error("Erreur lors du démarrage du chat", error)
    }
  }

  return (
    <View style={tw`flex-1 p-4 bg-white`}>
      <Image
        source={image ? { uri: image } : require("~/assets/images/blank-profile-picture-973460_1280.png")}
        style={tw`w-full h-64 rounded-lg mb-4`}
        resizeMode="cover"
      />
      <Text style={tw`text-2xl font-bold text-orange-600 mb-2`}>{name}</Text>
      <Text style={tw`text-gray-700 mb-4`}>
        Détails supplémentaires sur l'entreprise peuvent être ajoutés ici.
      </Text>
      <TouchableOpacity
        style={tw`bg-orange-500 px-4 py-2 rounded-full items-center`}
        onPress={startChat}
      >
        <Text style={tw`text-white font-medium`}>Contacter l'entreprise</Text>
      </TouchableOpacity>
    </View>
  )
}

export default CompanyDetails