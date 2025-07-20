import BackButton from '@/components/BackButton'
import Header from '@/components/Header'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import TransactionList from '@/components/TransactionList'
import { colors, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authContext'
import useFetchData from '@/hooks/useFetchData'
import { TransactionType } from '@/types'
import { useRouter } from 'expo-router'
import { orderBy, where } from 'firebase/firestore'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

const SearchModel = () => {
    const { user } = useAuth()
    const router = useRouter()
    const [search, setSearch] = useState('')

    const constrainst = [
        where("uid", "==", user?.uid),
        orderBy("date", "desc")
      ]
      const { 
        data: alltransactions, 
        loading:transactionloading, 
        error 
    } = useFetchData<TransactionType>("transactions", constrainst)
    
    const filterTransaction = alltransactions.filter((item)=>   {
        if(search.length >1){
            if(
                item.category?.toLowerCase()?.includes(search?.toLowerCase())||
                item.type?.toLowerCase()?.includes(search?.toLowerCase())||
                item.description?.toLowerCase()?.includes(search?.toLowerCase())||
                item.amount?.toString()?.toLowerCase()?.includes(search?.toLowerCase())
            ){
                return true;
            }
            return false;
        }
        return true;
    })

    return (
        <ModalWrapper style={{backgroundColor:colors.neutral900}}>
            <View style={styles.container} >
                <Header title={ 'Search' } leftIcon={<BackButton />} style={{ marginBottom: spacingY._10 }} />

                {/* form  */}
                <ScrollView contentContainerStyle={styles.form}>
                    {/* Input  */}
                    <View style={styles.inputContainer}>
                        <Input
                            placeholder='shoes.....'
                            placeholderTextColor={colors.neutral400}
                            value={search}
                            containerStyle={{backgroundColor:colors.neutral800}}
                            onChangeText={(value) => setSearch(value)}
                        />
                    </View>
                    <View>
                        <TransactionList 
                            data={filterTransaction}
                            loading={transactionloading}
                            emptyListMessage='No transaction match with your search keyword'
                        />
                    </View>
                </ScrollView>
            </View>
        </ModalWrapper>
    )
}

export default SearchModel

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: spacingY._20
    },
    
    form: {
        gap: spacingY._30,
        marginTop: spacingY._15
    },
    avatarContainer: {
        position: 'relative',
        alignSelf: 'center'
    },
    inputContainer: {
        gap: spacingY._10
    }
})