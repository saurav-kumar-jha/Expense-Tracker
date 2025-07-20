import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Input from '@/components/Input'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authContext'
import { verticalScale } from '@/utils/styling'
import { useRouter } from 'expo-router'
import * as Icon from 'phosphor-react-native'
import React, { useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'

const Login = () => {
    const emailRef = useRef("")
    const PasswordRef = useRef("")
    const [isloading, setisloading] = useState(false)
    const router = useRouter()
    const {login} = useAuth()

    const handleSubmit = async ()=>{
        if(!emailRef.current || !PasswordRef.current){
            Alert.alert("Login", "Please fill all the fields")
            return;
        }
        setisloading(true)
        const res = await login(emailRef.current, PasswordRef.current)
        setisloading(false)
        if(!res.success){
            Alert.alert("Error:", res.msg)
        }
        
    }
    return (
        <ScreenWrapper>
            <View style={styles.container} >
                <BackButton iconSize={28} />

                <View style={{ gap: 5, paddingTop: spacingY._20 }} >
                    <Typo size={30} fontWeight={"800"}>Hey,</Typo>
                    <Typo size={30} fontWeight={"800"}>Welcome Back</Typo>
                </View>

                {/* Form... */}
                <View style={styles.form}>
                    <Typo size={16} color={colors.textLighter} >Login now to track all your Expenses.</Typo>

                    <Input
                        placeholder='Enter your email'
                        onChangeText={(value)=>(emailRef.current = value)}
                        icon={<Icon.AtIcon size={verticalScale(26)} color={colors.neutral300} weight='fill' />}
                    />
                    <Input
                        placeholder='Enter your password'
                        secureTextEntry
                        onChangeText={(value)=>(PasswordRef.current = value)}
                        icon={<Icon.LockIcon size={verticalScale(26)} color={colors.neutral300} weight='fill' />}
                    />

                    <Typo size={14} color={colors.text} style={{alignSelf:'flex-end'}} >Forget Password</Typo>

                    <Button loading={isloading} onPress={handleSubmit}>
                        <Typo fontWeight={"700"} size={21} color={colors.black} >Login</Typo>
                    </Button>
                </View>

                {/* Footer.... */}
                <View style={styles.footer} >
                    <Typo size={15}>Don't have an account?</Typo>
                    <Pressable onPress={()=> router.navigate("/(auth)/register")}>
                        <Typo size={15} fontWeight={"700"} color={colors.primary}>Sign In</Typo>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: spacingY._30,
        paddingHorizontal: spacingX._20
    },
    welcomeText: {
        fontSize: verticalScale(20),
        fontWeight: 'bold',
        color: colors.text
    },
    form: {
        gap: spacingY._20
    },
    forgetPassword: {
        textAlign: 'right',
        fontWeight: '500',
        color: colors.text
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
    },
    footerText: {
        textAlign: 'center',
        color: colors.text,
        fontSize: verticalScale(15)
    }
})