import { AuthProvider } from '@/context/authContext';
import { Stack } from 'expo-router';
import 'react-native-reanimated';


const StackLayout = ()=>{
  return(
    <Stack screenOptions={{ headerShown:false, presentation:'modal'}} />    
  )
}

export default function RootLayout() {
 
  return (
    <AuthProvider>
      <StackLayout/>
    </AuthProvider>
  );
}
