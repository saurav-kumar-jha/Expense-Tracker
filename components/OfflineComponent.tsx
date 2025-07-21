import { colors, radius } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import ScreenWrapper from './ScreenWrapper'
import Typo from './Typo'

type myPramas = {
    onRetry?: () => void,
    loading?: boolean,
}

const OfflineComponent = () => {
    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Typo color={colors.white} fontWeight={"700"} size={scale(18)}>⚠️ No Internet Connection</Typo>
                <Typo color={colors.white} fontWeight={"700"} size={scale(16)}>Please check your connection and try again.</Typo>
            </View>
        </ScreenWrapper>
    )
}

export default OfflineComponent

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: scale(13),
        paddingHorizontal: 20
    },
    button: {
        backgroundColor: colors.rose,
        borderRadius: radius._17,
        borderCurve: 'continuous',
        height: verticalScale(52),
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: verticalScale(20),
    }
})