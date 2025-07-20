import Header from '@/components/Header'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { auth } from '@/config/firebase'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authContext'
import { getProfile } from '@/services/imageService'
import { accountOptionType } from '@/types'
import { verticalScale } from '@/utils/styling'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { signOut } from 'firebase/auth'
import * as Icons from 'phosphor-react-native'
import React from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID
const Profile = () => {
  const { user } = useAuth()
  const router = useRouter()
  console.log("appId:",appId);
  const accountOptions : accountOptionType[] = [
    {
      title:"Edit Profile",
      icon:(
        <Icons.UserIcon size={26} weight='fill' color={colors.white} />
      ),
      bgColor:"#6366f1",
      routeName:"/(model)/profileModel"
    },
    {
      title:"Setting",
      icon:(
        <Icons.GearSixIcon size={26} weight='fill' color={colors.white} />
      ),
      bgColor:"#059669",
      // routeName:"/(modals)/profileModal"
    },
    {
      title:"Privacy Policy",
      icon:(
        <Icons.LockIcon size={26} weight='fill' color={colors.white} />
      ),
      bgColor:colors.neutral600,
      // routeName:"/(modals)/profileModal"
    },
    {
      title:"Logout",
      icon:(
        <Icons.PowerIcon size={26} weight='fill' color={colors.white} />
      ),
      bgColor:"#e11d48",
      // routeName:"/(modals)/profileModal"
    },
  ]

  

  const handleLogout = async()=>{
    await signOut(auth)
  }

  const showHandleLogout = ()=>{
    Alert.alert("Welcome", "Are you sure to logout?",[
      {
        text:"Cancel",
        onPress:()=> console.log("cancel logout"),
        style:'cancel',        
      },
      {
        text:"logout",
        onPress:()=> handleLogout(),
        style:'destructive',
      }
    ])
  }

  const handlePress = (item : accountOptionType)=>{
    if(item.title == 'Logout'){
      showHandleLogout()
    }

    if(item.routeName) router.push(item.routeName)
  }
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header  */}
        <Header title='Profile' 
        // style={{ marginVertical: spacingY._10 }} 
        />

        {/* user info  */}
        <View style={styles.userInfo}>
          {/* avatar  */}
          <View>
            {/* profile image */}
            <Image source={getProfile(user?.image)} style={styles.avatar} contentFit='cover' transition={100} />
          </View>
          {/* name & email */}
          <View style={styles.nameContainer}>
            <Typo size={24} fontWeight={"600"} color={colors.neutral100} >{user?.name || "UserName"}</Typo>
            <Typo size={15} color={colors.neutral400}>{user?.email}</Typo>
          </View>
        </View>

        {/* account option  */}
        <View style={styles.accountOptions}>
          {
            accountOptions.map((item, index)=>{
              return(
                <Animated.View entering={FadeInDown.delay(index*100).springify().damping(14)} key={index.toString()} style={styles.listItem}  >
                  <TouchableOpacity style={styles.flexBox} onPress={()=> handlePress(item)}>
                    {/* Icon  */}
                    <View style={[styles.listIcon,{backgroundColor: item?.bgColor}]}>
                      {item.icon && item.icon}
                    </View>
                    <Typo size={16} style={{flex:1}} fontWeight={"500"} >{item.title}</Typo>
                    <Icons.CaretRightIcon size={verticalScale(20)} weight='bold' color={colors.white} />
                  </TouchableOpacity>
                </Animated.View>
              )
            })
          }
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20
  },
  userInfo: {
    marginTop: verticalScale(30),
    alignItems: 'center',
    gap: spacingY._15
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'center'
  },
  avatar: {
    alignSelf: 'center',
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    // overflow:'hidden',
    // position:'relative'
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 8,
    borderRadius: 50,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: 5,
  },
  nameContainer: {
    gap: verticalScale(4),
    alignItems: 'center',
  },
  listIcon: {
    height: verticalScale(44),
    width: verticalScale(44),
    backgroundColor: colors.neutral500,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius._15,
    borderCurve: 'continuous'
  },
  listItem: {
    marginBottom: verticalScale(17)
  },
  accountOptions: {
    marginTop: spacingY._35,
  },
  flexBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._10
  }
})