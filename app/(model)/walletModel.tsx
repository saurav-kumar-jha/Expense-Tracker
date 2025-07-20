import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import ImageUpload from '@/components/ImageUpload'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authContext'
import { createOrUpdateWallet, deleteWallet } from '@/services/walletService'
import { WalletType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Icons from 'phosphor-react-native'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'

const WalletModel = () => {
    const { user, updateUserData } = useAuth()
    const [walletData, setwalletData] = useState<WalletType>({
        name: "",
        image: null
    })
    const [isloading, setIsloading] = useState(false)
    const router = useRouter()
    const oldWallet :{ name : string, image: string, id: string} = useLocalSearchParams()
    // console.log("OldWallet:", oldWallet);
    
    useEffect(()=>{
        if(oldWallet?.id){
            setwalletData({
                name:oldWallet?.name,
                image:oldWallet?.image
            })
        }
    },[])

    const handleSubmit = async () => {
        let { name, image } = walletData;
        if (!name.trim() || !image) {
            Alert.alert("Wallet", "Please fill all the fields")
            return;
        }

        const data : WalletType = {
            name,
            image,
            uid : user?.uid
        };
        if(oldWallet?.id) data.id = oldWallet?.id;
        setIsloading(true);
        const res = await createOrUpdateWallet(data)
        // console.log("wallet res: ", res);
        
        setIsloading(false);
        if (res.success) {
            router.back()
        } else {
            Alert.alert("Wallet", res.msg)
        }
    }
    const onDelete = async()=>{
        if(!oldWallet?.id) return;

        setIsloading(true)
        const res = await deleteWallet(oldWallet?.id)     
        setIsloading(false)
        if(res.success){
            router.back()
        }else{
            Alert.alert("Wallet", res.msg)
        }
    }
    const showDeleteAlert = ()=>{
        Alert.alert("Confirm",
            "Are you sure to do this?\nThis action will remove all the transactions related to this wallet.",
            [
                {
                    text:"Cancel",
                    onPress:()=> {},
                    style:'cancel'
                },
                {
                    text:'Delete',
                    onPress:()=>onDelete(),
                    style:'destructive'
                }
            ]
        )
    }
    return (
        <ModalWrapper>
            <View style={styles.container} >
                <Header title={ oldWallet?.id ? "Update Wallet" : 'New Wallet' } leftIcon={<BackButton />} style={{ marginBottom: spacingY._10 }} />

                {/* form  */}
                <ScrollView contentContainerStyle={styles.form}>
                    {/* Input  */}
                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200}>Wallet Name:</Typo>
                        <Input
                            placeholder='salary'
                            value={walletData.name}
                            onChangeText={(value) => setwalletData({ ...walletData, name: value })}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200}>Wallet Icon:</Typo>
                        {/* Image picker  */}
                        <ImageUpload
                            file={walletData.image}
                            onClear={()=>setwalletData({...walletData, image:null})}
                            onSelect={file => setwalletData({ ...walletData, image: file })}
                            placeholder='Upload Image'
                        />
                    </View>
                </ScrollView>
            </View>

            {/* footer  */}
            <View style={styles.footer}>
                {
                    oldWallet?.id && !isloading && (
                        <Button onPress={showDeleteAlert}  style={{
                            backgroundColor:colors.rose,
                            paddingHorizontal:spacingX._15,
                            
                        }} >
                            <Icons.TrashIcon size={verticalScale(25)} weight='bold' color={colors.white} />
                        </Button>
                    )
                }
                <Button onPress={handleSubmit} loading={isloading} style={{ flex: 1 }} >
                    <Typo>{oldWallet?.id ? "Update Wallet":"Add Wallet"}</Typo>
                </Button>
            </View>
        </ModalWrapper>
    )
}

export default WalletModel

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