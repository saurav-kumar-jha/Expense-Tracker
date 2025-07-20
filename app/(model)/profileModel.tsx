import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authContext'
import { getProfile } from '@/services/imageService'
import { UpdateUser } from '@/services/userService'
import { UserDataType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import * as Icons from 'phosphor-react-native'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

const ProfileModel = () => {
    const { user, updateUserData } = useAuth()
    const [userData, setUserData] = useState<UserDataType>({
        name: "",
        image: null
    })
    const [isloading, setIsloading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setUserData({
            name: user?.name || "",
            image: user?.image || null
        })
    }, [user])

    const onPickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            // allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        }); 

        if (!result.canceled) {
            setUserData({...userData, image: result.assets[0]});
        }
    }
    const handleSubmit = async () => {
        let { name, image } = userData;
        if (!name.trim()) {
            Alert.alert("User", "Please fill all the fields")
            return;
        }

        console.log("UserData: ", userData);
        

        setIsloading(true);
        const res = await UpdateUser(user?.uid as string, userData)
        // console.log("Res while update user:", res);
        
        setIsloading(false);
        if (res.success) {
            updateUserData(user?.uid as string)
            router.back()
        } else {
            Alert.alert("User", res.msg)
        }
    }
    return (
        <ModalWrapper>
            <View style={styles.container} >
                <Header title='Update Profile' leftIcon={<BackButton />} style={{ marginBottom: spacingY._10 }} />

                {/* form  */}
                <ScrollView contentContainerStyle={styles.form}>
                    {/* Icon   */}
                    <View style={styles.avatarContainer}>
                        <Image
                            style={styles.avatar}
                            source={getProfile(userData.image)}
                            contentFit='cover'
                            transition={100}
                        />

                        <TouchableOpacity style={styles.editIcon} onPress={onPickImage}>
                            <Icons.PencilIcon size={verticalScale(20)} color={colors.neutral800} />
                        </TouchableOpacity>
                    </View>

                    {/* Input  */}
                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200}>Name:</Typo>
                        <Input
                            placeholder='Name'
                            value={userData.name}
                            onChangeText={(value) => setUserData({ ...userData, name: value })}
                        />
                    </View>
                </ScrollView>
            </View>

            {/* footer  */}
            <View style={styles.footer}>
                <Button onPress={handleSubmit} loading={isloading} style={{ flex: 1 }} >
                    <Typo>Update</Typo>
                </Button>
            </View>
        </ModalWrapper>
    )
}

export default ProfileModel

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: spacingY._20
    },
    footer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: spacingX._20,
        gap: scale(12),
        paddingTop: spacingY._15,
        borderTopColor: colors.neutral700,
        borderTopWidth: 1,
        marginBottom: spacingY._5
    },
    form: {
        gap: spacingY._30,
        marginTop: spacingY._15
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
        borderWidth: 1,
        borderColor: colors.neutral500
    },
    editIcon: {
        position: 'absolute',
        bottom: spacingY._5,
        right: spacingY._7,
        borderRadius: 100,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 0 },
        backgroundColor: colors.neutral100,
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
        padding: spacingY._7
    },
    inputContainer: {
        gap: spacingY._10
    }
})