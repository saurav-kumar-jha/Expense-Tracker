import { colors, spacingY } from '@/constants/theme';
import { ModalWrapperProps } from '@/types';
import React from 'react';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
const {height } = Dimensions.get('window')
const isIos = Platform.OS == 'ios';

const ModalWrapper = ({style, children, bg= colors.neutral800}:ModalWrapperProps) => {
  return (
    <Animated.View entering={FadeIn.delay(10)} style={[styles.container, {backgroundColor: bg}, style && style]} >
      {children}
    </Animated.View>
  )
}

export default ModalWrapper;

const styles = StyleSheet.create({
    container:{
        flex:1,
        paddingTop: isIos ? spacingY._15 :  height * 0.04,
        paddingBottom: isIos ? spacingY._20 : spacingY._10
    }
})