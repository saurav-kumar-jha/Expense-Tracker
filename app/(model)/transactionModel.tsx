import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import ImageUpload from '@/components/ImageUpload'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { expenseCategories, transactionTypes } from '@/constants/data'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authContext'
import useFetchData from '@/hooks/useFetchData'
import { createOrUpdateTransaction, deleteTransaction } from '@/services/transactionService'
import { TransactionType, WalletType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { orderBy, where } from 'firebase/firestore'
import * as Icons from 'phosphor-react-native'
import React, { useEffect, useState } from 'react'
import { Alert, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'


const TransactionModel = () => {
  const { user } = useAuth()
  const [transcation, setTranscation] = useState<TransactionType>({
    type: 'expense',
    amount: 0,
    date: new Date(),
    walletId: '',
    category: '',
    description: '',
    image: null
  })
  type paramType = {
    id: string;
    type: string;
    amount: string;
    category?: string;
    date:  string;
    description?: string;
    image?: any;
    uid?: string;
    walletId: string; 
  }
  const [isloading, setIsloading] = useState(false)
  const router = useRouter()
  const oldTransaction: paramType = useLocalSearchParams()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const { data: wallets, loading: walletloading, error: walletError } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc")
  ])
  

  const onDateChange = (event: any, selectDate: any) => {
    const currentTime = selectDate || transcation.date;
    setTranscation({ ...transcation, date: currentTime })
    setShowDatePicker(Platform.OS == 'android' ? false : true)
  }

  useEffect(()=>{
    if(oldTransaction?.id){
      setTranscation({
        type:oldTransaction?.type,
        amount:Number(oldTransaction.amount),
        description:oldTransaction.description || "",
        image:oldTransaction?.image, 
        category:oldTransaction.category || "",
        date:new Date(oldTransaction.date),
        walletId:oldTransaction?.walletId,        
      })
    }
  },[])

  const handleSubmit = async () => {
    const {type, amount, date, walletId, category, description, image} = transcation;

    if(!walletId || !date || (type == 'expense' && !category) || !amount){
      Alert.alert("Transaction","Please fill all the fields!!")
    }


    let transactionData: TransactionType = {
      type,
      amount,
      date,
      walletId,
      category,
      image : image ? image : null,
      uid:user?.uid,
      description
    }

    if(oldTransaction?.id) transactionData.id = oldTransaction.id;   
    setIsloading(true)
    const res = await createOrUpdateTransaction(transactionData);
    setIsloading(false)

    if(res.success){
      router.back()
    }else{
      Alert.alert("Transactions", res.msg)
    }

    
  }
  const onDelete = async () => {
    if (!oldTransaction?.id) return;

    console.log("oldtransactionid:", oldTransaction.id)
    setIsloading(true)
    const res = await deleteTransaction(oldTransaction?.id, oldTransaction.walletId);
    console.log("res:", res)
    setIsloading(false)
    if (res.success) {
      router.back()
    } else {
      Alert.alert("Transaction", res.msg)
    }
  }
  const showDeleteAlert = () => {
    Alert.alert("Confirm",
      "Are you sure to delete this?",
      [
        {
          text: "Cancel",
          onPress: () => { },
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => onDelete(),
          style: 'destructive'
        }
      ]
    )
  }

  return (
    <ModalWrapper>
      <View style={styles.container} >
        <Header title={oldTransaction?.id ? "Update Transaction" : 'New Transaction'} leftIcon={<BackButton />} style={{ marginBottom: spacingY._10 }} />

        {/* form  */}
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          {/* Input  */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16}>Type:</Typo>
            <Dropdown
              style={styles.dropContainer}
              activeColor={colors.neutral700}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              data={transactionTypes}
              itemTextStyle={styles.dropdownItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdownListContainer}
              maxHeight={300}
              labelField="label"
              valueField="value"
              value={transcation.type}
              onChange={item => {
                setTranscation({ ...transcation, type: item.value })
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16}>Wallet:</Typo>
            <Dropdown
              style={styles.dropContainer}
              activeColor={colors.neutral700}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              iconStyle={styles.dropdownIcon}
              data={wallets.map((wallet) => ({
                label: `${wallet?.name} (${wallet?.amount})`,
                value:wallet?.id
              }))}
              itemTextStyle={styles.dropdownItemText}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={styles.dropdownListContainer}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={'Select wallet'}
              value={transcation.walletId}
              onChange={item => {
                setTranscation({ ...transcation, walletId: item.value })
              }}
            />
          </View>

          {/* expense category  */}
          {
            transcation.type == 'expense' && (
              <View style={styles.inputContainer}>
                <Typo color={colors.neutral200} size={16}>Expense Category:</Typo>
                <Dropdown
                  style={styles.dropContainer}
                  activeColor={colors.neutral700}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  iconStyle={styles.dropdownIcon}
                  data={Object.values(expenseCategories)}
                  itemTextStyle={styles.dropdownItemText}
                  itemContainerStyle={styles.dropdownItemContainer}
                  containerStyle={styles.dropdownListContainer}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={'--Select category--'}
                  value={transcation.category}
                  onChange={item => {
                    setTranscation({ ...transcation, category: item.value })
                  }}
                />
              </View>
            )
          }
          {/* Date picker  */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16}>Date:</Typo>
            {
              !showDatePicker && (
                <Pressable style={styles.dateInput} onPress={() => setShowDatePicker(true)} >
                  <Typo size={14}>
                    {(transcation.date as Date).toLocaleDateString()}
                  </Typo>
                </Pressable>
              )
            }
            {
              showDatePicker && (
                <View style={Platform.OS == 'ios' && styles.iosDatePicker}>
                  <DateTimePicker
                    // themeVariant='dark'
                    value={transcation.date as Date}
                    {...(Platform.OS === 'ios' ? { textColor: colors.white } : {})}
                    mode='date'
                    display={Platform.OS == 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                  />
                  {
                    Platform.OS == 'ios' && (
                      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(false)} >
                        <Typo size={15} fontWeight={"500"}>Ok</Typo>
                      </TouchableOpacity>
                    )
                  }
                </View>
              )
            }
          </View>

          {/* amount  */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16}>Amount:</Typo>
            <Input
              // placeholder='salary'
              keyboardType='numeric'
              value={transcation.amount.toString()}
              onChangeText={(value) => setTranscation({ ...transcation, amount: Number(value.replace(/[^0-9]/g, '')) })}
            />
          </View>

          {/* description  */}
          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typo color={colors.neutral200} size={16}>Description</Typo>
              <Typo color={colors.neutral500} size={14}>(Optional)</Typo>
            </View>
            <Input
              multiline
              containerStyle={{
                flexDirection:'row',
                alignItems:'flex-start',
                height:verticalScale(100),
                paddingVertical:15
              }}
              value={transcation.description}
              onChangeText={(value) => setTranscation({ ...transcation, description:value })}
            />
          </View>
          <View style={styles.inputContainer}>
          <View style={styles.flexRow}>
              <Typo color={colors.neutral200} size={16}>Recipt</Typo>
              <Typo color={colors.neutral500} size={14}>(Optional)</Typo>
            </View>
            {/* Image picker  */}
            <ImageUpload
              file={transcation.image}
              onClear={() => setTranscation({ ...transcation, image: null })}
              onSelect={file => setTranscation({ ...transcation, image: file })}
              placeholder='Upload Image'
            />
          </View>
        </ScrollView>
      </View>

      {/* footer  */}
      <View style={styles.footer}>
        {
          oldTransaction?.id && !isloading && (
            <Button onPress={showDeleteAlert} style={{
              backgroundColor: colors.rose,
              paddingHorizontal: spacingX._15,

            }} >
              <Icons.TrashIcon size={verticalScale(25)} weight='bold' color={colors.white} />
            </Button>
          )
        }
        <Button onPress={handleSubmit} loading={isloading} style={{ flex: 1 }} >
          <Typo>{oldTransaction?.id ? "Update" : "Submit"}</Typo>
        </Button>
      </View>
    </ModalWrapper>
  )
}

export default TransactionModel

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingVertical: spacingY._15,
    paddingBottom: spacingY._40
  },
  iosDropDown: {
    flexDirection: 'row',
    height: verticalScale(54),
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: verticalScale(14),
    borderWidth: 1,
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: 'continuous',
    paddingHorizontal: spacingX._15
  },
  androidDropDown: {
    height: verticalScale(54),
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: verticalScale(14),
    borderWidth: 1,
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: 'continuous',
  },
  datePickerButton: {
    backgroundColor: colors.neutral700,
    alignSelf: 'flex-end',
    padding: spacingY._7,
    marginRight: spacingX._7,
    paddingHorizontal: spacingY._15,
    borderRadius: radius._15
  },
  dropContainer: {
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    borderCurve: 'continuous'
  },
  dropdownItemText: {
    color: colors.white
  },
  dropdownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(14)
  },
  dropdownListContainer: {
    backgroundColor: colors.neutral900,
    borderRadius: radius._15,
    borderCurve: 'continuous',
    paddingVertical: spacingY._7,
    top: 5,
    borderColor: colors.neutral500
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingY._5
  },
  inputContainer: {
    gap: spacingY._10
  },
  dropdownPlaceholder: {
    color: colors.white
  },
  dropdownItemContainer: {
    borderRadius: radius._15,
    marginHorizontal: spacingX._7
  },
  dropdownIcon: {
    height: verticalScale(30),
    tintColor: colors.neutral300
  },
  iosDatePicker: {

  },
  androidDatePicker: {

  },
  dateInput: {
    flexDirection: 'row',
    height: verticalScale(54),
    alignItems: 'center',
    borderRadius: radius._17,
    borderWidth: 1,
    borderCurve: 'continuous',
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15
  }
})