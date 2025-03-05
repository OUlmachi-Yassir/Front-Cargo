import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createCar } from '~/services/cars/carService';
import { authService } from '~/services/auth/authService';

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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Ajouter une Voiture</Text>
      <TextInput placeholder="Marque" value={marque} onChangeText={setMarque} style={{ borderWidth: 1, marginVertical: 5 }} />
      <TextInput placeholder="Modèle" value={modele} onChangeText={setModele} style={{ borderWidth: 1, marginVertical: 5 }} />
      <Button title="Choisir une image" onPress={pickImage} />

      <ScrollView horizontal>
        {/* {images.map((uri, index) => (
          <Image key={index} source={{ uri }} style={{ width: 100, height: 100, margin: 5 }} />
        ))} */}
      </ScrollView>

      <Button title="Ajouter la voiture" onPress={handleCreateCar} />
    </View>
  );
};

export default AddCarScreen;
