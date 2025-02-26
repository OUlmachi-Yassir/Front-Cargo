import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from 'expo-router'

export default function index() {
  const  navigation = useNavigation()
  return (
    <View className='text-3xl bg-red-900'>
      <Text>index E</Text>
      <TouchableOpacity onPress={() => navigation.navigate('(auth)/login')} className="mt-3">
              <Text className="text-blue-500">Déjà un compte ? Se connecter</Text>
            </TouchableOpacity>
    </View>
  )
}