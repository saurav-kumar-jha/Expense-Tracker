import Header from '@/components/Header'
import Loading from '@/components/Loading'
import ScreenWrapper from '@/components/ScreenWrapper'
import TransactionList from '@/components/TransactionList'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/context/authContext'
import { fetchMontlyStats, fetchWeeklyStats, fetchYearlyStats } from '@/services/transactionService'
import { scale, verticalScale } from '@/utils/styling'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import { BarChart } from "react-native-gifted-charts"


const Statistics = () => {
  const {user} = useAuth()
  const [activeIndex, setActiveIndex] = useState(0)
  const [chartLoading, setChartLoading] = useState(false)
  const [chartData, setChartData] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(()=>{
    if(activeIndex == 0){
      getWeeklyStats()
    }
    if(activeIndex == 1){
      getMonthlyStats()
    }
    if(activeIndex == 2){
      getYearlyStats()
    }
  },[activeIndex])

  const getWeeklyStats = async ()=>{
    //get week stats
    setChartLoading(true)
    let res = await fetchWeeklyStats(user?.uid as string)
    setChartLoading(false)
    if(res.success){
      setChartData(res?.data?.stats)
      setTransactions(res?.data?.transactions)
    }else{
      Alert.alert("Error", res?.msg)
    }
  }
  const getMonthlyStats = async ()=>{
    //get monthly stats
    setChartLoading(true)
    let res = await fetchMontlyStats(user?.uid as string)
    setChartLoading(false)
    if(res.success){
      setChartData(res?.data?.stats)
      setTransactions(res?.data?.transactions)
    }else{
      Alert.alert("Error", res?.msg)
    }
  }
  const getYearlyStats = async()=>{
    //get Yearly stats
    setChartLoading(true)
    let res = await fetchYearlyStats(user?.uid as string)
    setChartLoading(false)
    if(res.success){
      setChartData(res?.data?.stats)
      setTransactions(res?.data?.transactions)
    }else{
      Alert.alert("Error", res?.msg)
    }
  }
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Header title='Statistics' />
        </View>

        <ScrollView
          contentContainerStyle={{
            gap: spacingY._20,
            paddingTop: spacingY._5,
            paddingBottom: verticalScale(100)
          }}
          showsVerticalScrollIndicator={false}
        >
          <SegmentedControl
            values={['Weekly', 'Monthly', 'Yearly']}
            selectedIndex={activeIndex}
            onChange={(event) => {
              setActiveIndex(event.nativeEvent.selectedSegmentIndex)
            }}
            tintColor={colors.neutral200}
            backgroundColor={colors.neutral800}
            appearance='dark'
            activeFontStyle={styles.segmentFontStyle}
            style={styles.segmentStyle}
            fontStyle={{...styles.segmentFontStyle, color:colors.white}}
          />
          <View style={styles.chartContainer}>
            {
              chartData.length > 0 ? (
                <BarChart 
                  data = {chartData}
                  barWidth={scale(12)}
                  spacing={[1,2].includes(activeIndex) ? scale(25) : scale(16)}
                  roundedTop
                  roundedBottom
                  hideRules
                  yAxisLabelPrefix='₹'
                  yAxisThickness={0}
                  xAxisThickness={0}
                  yAxisLabelWidth={[1,2].includes(activeIndex) ? scale(38) :scale(35)}
                  yAxisTextStyle={{color:colors.neutral300}}
                  xAxisLabelTextStyle={{
                    color:colors.neutral300,
                    fontSize:verticalScale(12)
                  }}
                  noOfSections={3}
                  minHeight={5}
                  // isAnimated={true}
                  // animationDuration={100}
                 />
              ):(
                <View style={styles.noChart} />
              )
            }

            {
              chartLoading && (
                <View style={styles.chartLoadingContainer}>
                  <Loading />
                </View>
              )
            }
          </View>
          <View>
            <TransactionList
             title='Transactions'
             emptyListMessage='No transactions'
             data={transactions}
            />
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  )
}

export default Statistics;

const styles = StyleSheet.create({
  chartContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  chartLoadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: radius._12,
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  header: {},
  noChart: {
    height: verticalScale(210),
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  searchIcons: {
    backgroundColor: colors.neutral700,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    height: verticalScale(35),
    width: verticalScale(35),
    borderCurve: 'continuous'
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    color: colors.black,
    fontWeight: 'bold'
  },
  container: {
    gap: spacingY._10,
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._5
  },
  segmentStyle:{
    height: scale(37)
  }
})