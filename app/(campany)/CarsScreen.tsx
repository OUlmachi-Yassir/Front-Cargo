import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient'; 
import { createCar } from '~/services/cars/carService';
import { authService } from '~/services/auth/authService';
import tw from 'twrnc';

const AddCarScreen = () => {
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [statut, setStatut] = useState('non réservé');
  const [images, setImages] = useState<string[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleCreateCar = async () => {
    try {
      const token = await authService.getToken();
      if (!token) throw new Error('Token non disponible');

      const carData = { marque, modele, statut };
      await createCar(token, carData, images);

      Alert.alert('Succès', 'Voiture ajoutée avec succès');
      setMarque('');
      setModele('');
      setStatut('non réservé');
      setImages([]);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d’ajouter la voiture');
      console.error(error);
    }
  };

  return (
    <LinearGradient
      colors={['#fad7a0', '#f2f3f4']} 
      style={tw`flex-1  justify-center`}
    >
      <View style={tw`bg-white p-5 rounded-t-10 shadow-lg h-[90%] relative top-12`}>
        <Text style={tw`text-2xl font-bold text-center mb-5`}>Ajouter une Voiture</Text>

        <TextInput
          placeholder="Marque"
          value={marque}
          onChangeText={setMarque}
          style={tw`border border-gray-300 rounded-lg p-3 mb-4`}
        />

        <TextInput
          placeholder="Modèle"
          value={modele}
          onChangeText={setModele}
          style={tw`border border-gray-300 rounded-lg p-3 mb-4`}
        />

        <Button
          title="Choisir une image"
          onPress={pickImage}
          color="#FFA500" 
        />

        <ScrollView horizontal style={tw`mt-4`}>
          {images.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={tw`w-24 h-24 rounded-lg mr-2`}
            />
          ))}
        </ScrollView>

        <View style={tw`mt-6`}>
          <Button
            title="Ajouter la voiture"
            onPress={handleCreateCar}
            color="#4CAF50" 
          />
        </View>
      </View>
    </LinearGradient>
  );
};

export default AddCarScreen;