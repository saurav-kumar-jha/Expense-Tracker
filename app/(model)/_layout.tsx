import { Stack } from 'expo-router'
import React from 'react'

const ModalLayout = () => {
  return (
    <Stack screenOptions={{
        presentation:'modal',
        headerShown:false
    }} />
  )
}

export default ModalLayout