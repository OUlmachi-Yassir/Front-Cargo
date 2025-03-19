import { View, Text, TouchableOpacity, Image, ImageBackground, StatusBar, SafeAreaView, Dimensions } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import tw from 'twrnc'
import { LinearGradient } from 'expo-linear-gradient'

const { width, height } = Dimensions.get('window')

export default function Index() {
  const router = useRouter()
  
  return (
    <SafeAreaView style={tw`flex-1`}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=2070' }}
        style={tw`flex-1 w-full h-full`}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={tw`flex-1 justify-between p-6`}
        >
          <View style={tw`items-center mt-10`}>
              <Text style={tw`text-orange-500 text-4xl font-bold`}><Text style={tw`text-white text-4xl font-bold`}>Auto</Text>Rent</Text>
          </View>

          <View style={tw`items-center justify-center`}>
            <View style={tw`bg-black bg-opacity-50 p-6 rounded-3xl w-full max-w-xs mx-auto`}>
              <Text style={tw`text-white text-3xl font-bold text-center mb-2`}>
                Louez votre voiture idéale
              </Text>
              <Text style={tw`text-white text-center mb-4 opacity-80`}>
                Des véhicules de qualité pour tous vos besoins, à des prix compétitifs
              </Text>
              
              <View style={tw`flex-row items-center justify-center mb-4`}>
                <View style={tw`flex-row items-center mr-4`}>
                  <View style={tw`w-2 h-2 rounded-full bg-orange-500 mr-1`} />
                  <Text style={tw`text-white text-xs`}>Facile</Text>
                </View>
                <View style={tw`flex-row items-center mr-4`}>
                  <View style={tw`w-2 h-2 rounded-full bg-orange-500 mr-1`} />
                  <Text style={tw`text-white text-xs`}>Rapide</Text>
                </View>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-2 h-2 rounded-full bg-orange-500 mr-1`} />
                  <Text style={tw`text-white text-xs`}>Sécurisé</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={tw`mb-10`}>
            <TouchableOpacity
              style={tw`bg-orange-500 py-4 rounded-xl shadow-lg mb-4`}
              onPress={() => router.push('/(client)/Clienthome')}
            >
              <Text style={tw`text-white text-center font-bold text-lg`}>
                Explorer les véhicules
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={tw`bg-white py-4 rounded-xl shadow-lg mb-6`}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={tw`text-orange-600 text-center font-bold text-lg`}>
                Se connecter
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={tw`text-white text-center`}>
                Nouveau client ? <Text style={tw`font-bold underline`}>Créer un compte</Text>
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={tw`absolute bottom-0 left-0 right-0 flex-row justify-between px-4 opacity-30`}>
            <Image
              source={{ uri: 'https://www.freeiconspng.com/uploads/car-png-22.png' }}
              style={{ width: width * 0.4, height: 60, resizeMode: 'contain' }}
            />
            <Image
              source={{ uri: 'https://www.freeiconspng.com/uploads/car-png-27.png' }}
              style={{ width: width * 0.4, height: 60, resizeMode: 'contain', transform: [{ scaleX: -1 }] }}
            />
          </View>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  )
}