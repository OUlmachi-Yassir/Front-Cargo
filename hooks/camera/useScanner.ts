import { CameraType, useCameraPermissions } from "expo-camera";
import { useNavigation, useRouter } from "expo-router";
import { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "@/app/types/types";

export default function useScanner() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    const handleBarCodeScanned = async ({ type, data , barcode}: { type: string; data: string, barcode:string }) => {
        setScanned(true);
        console.log("Scanned Barcode Data:", data); 
        alert(`Barcode scanned! Type: ${type}, Data: ${data}`);
        const router = useRouter()
        
        
        if (data) {
            try{
                const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/products`)
                const product = await response.json();
                const barcodeExist = product.some((product:{codebare :string})=>{
                  product.codebare===data
                })
          
                if(barcodeExist){
                const productId =product.id
                  return router.push({ pathname: '/ProductDetailScreen', params: { id: productId } })
                }

                
                        navigation.navigate("AddProductScreen", { scannedBarcode: data });
                
        }catch(error){
                console.log(error) 
        }
    }};

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    return {
        facing,
        permission,
        scanned,
        requestPermission,
        handleBarCodeScanned,
        toggleCameraFacing,
    }
}