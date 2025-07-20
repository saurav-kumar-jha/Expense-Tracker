import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authContext'
import useFetchData from '@/hooks/useFetchData'
import { WalletType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import { orderBy, where } from 'firebase/firestore'
import * as Icons from 'phosphor-react-native'
import React from 'react'
import { ImageBackground, StyleSheet, View } from 'react-native'
import Typo from './Typo'

const HomeCard = () => {
    const { user } = useAuth()
    const { data: wallets, loading:walletloading, error } = useFetchData<WalletType>("wallets", [
        where("uid", "==", user?.uid),
        orderBy("created", "desc")
    ])

    const getTotals = ()=>{
        return wallets.reduce((totals:any, item:WalletType)=>{
            // console.log("item:", item);
            // console.log("totals:", totals)
            totals.balance = totals.balance + item.amount;
            totals.income = totals.income + item.totalIncome;
            totals.expenses = totals.expenses + item.totalExpenses;
            return totals;

        }, {balance:0, income:0, expenses:0})
    }
    // console.log("getTotal:", getTotals());
    
    return (
        <ImageBackground
            source={require("../assets/images/card.png")}
            resizeMode='stretch'
            style={styles.bgImage}
        >
            <View style={styles.container}>
                <View>
                    {/* total Balance  */}
                    <View style={styles.totalBalanceRow}>
                        <Typo color={colors.neutral800} size={17} fontWeight={"500"}>Total Balance</Typo>
                        <Icons.DotsThreeOutlineIcon size={verticalScale(23)} color={colors.neutral800} weight='fill' />
                    </View>
                    <Typo color={colors.black} size={30} fontWeight={"bold"}>
                        <Icons.CurrencyInrIcon size={30} weight='bold' color={colors.black} />
                        {walletloading ? "--" : getTotals()?.balance?.toFixed(2)}
                    </Typo>
                </View>

                {/* total income and expense  */}
                <View style={styles.stats}>
                    {/* income  */}
                    <View style={{ gap: verticalScale(5) }}>
                        <View style={styles.incomeExpense}>
                            <View style={styles.statsIcon}>
                                <Icons.ArrowDownIcon size={verticalScale(15)} weight='bold' color={colors.black} />
                            </View>
                            <Typo size={16} color={colors.neutral700} fontWeight={"500"}>Income</Typo>
                        </View>
                        <View style={{ alignSelf: 'center' }}>
                            <Typo color={colors.green} size={17} fontWeight={"600"}>
                                <Icons.CurrencyInrIcon size={17} weight='bold' color={colors.green} />
                                {walletloading ? "--" : getTotals()?.income?.toFixed(2)}
                            </Typo>
                        </View>
                    </View>
                    {/* expense  */}
                    <View style={{ gap: verticalScale(5) }}>
                        <View style={styles.incomeExpense}>
                            <View style={styles.statsIcon}>
                                <Icons.ArrowUpIcon size={verticalScale(15)} weight='bold' color={colors.black} />
                            </View>
                            <Typo size={16} color={colors.neutral700} fontWeight={"500"}>Expense</Typo>
                        </View>
                        <View style={{ alignSelf: 'center' }}>
                            <Typo color={colors.rose} size={17} fontWeight={"600"}>
                                <Icons.CurrencyInrIcon size={17} weight='bold' color={colors.rose} />
                                {walletloading ? "--" :getTotals()?.expenses?.toFixed(2)}
                            </Typo>
                        </View>
                    </View>
                </View>
            </View>
        </ImageBackground>
    )
}

export default HomeCard

const styles = StyleSheet.create({
    bgImage: {
        height: scale(210),
        width: '100%',
    },
    container: {
        padding: spacingX._20,
        paddingHorizontal: scale(23),
        height: '87%',
        width: '100%',
        justifyContent: 'space-between'
    },
    totalBalanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacingY._5
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    statsIcon: {
        backgroundColor: colors.neutral350,
        padding: spacingY._5,
        borderRadius: 50
    },
    incomeExpense: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingY._7
    }
})