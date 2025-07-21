import OfflineComponent from '@/components/OfflineComponent';
import { AuthProvider } from '@/context/authContext';
import { addEventListener } from "@react-native-community/netinfo";
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

const StackLayout = ()=>{
  return(
    <Stack screenOptions={{ headerShown:false, presentation:'modal'}} />    
  )
}

export default function RootLayout() {
  const [isNetwork, setIsNetwork] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const unsub = addEventListener(state=>{
      console.log("connection type:", state.type)
      console.log("isconnted:", state.isConnected)
      setIsNetwork(state.isConnected ?? false)
    })
    unsub()
  },[])
  return (
    <AuthProvider>
      {
        isNetwork ? <StackLayout/> : <OfflineComponent  />
      }      
    </AuthProvider>
  );
}
