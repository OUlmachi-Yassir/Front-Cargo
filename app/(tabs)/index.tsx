import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

export default function index() {
  const  router = useRouter()
  return (
    <View className='text-3xl bg-red-900 flex flex-colomn items-center '>
      <Text>index E</Text>
      <TouchableOpacity onPress={() => router.push('/(auth)/login')} className="mt-3">
              <Text className="text-blue-500 mt-12">Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </View>
  )
}