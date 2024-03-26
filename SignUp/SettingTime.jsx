import React from 'react';
import { View, Text } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

const SettingTime = ({ timeRange, setTimeRange }) => { // 프롭스: timeRange == 초기값. 즉, 멀티 슬라이드 초기 위치. 
  const timeChange = (values) => {
    setTimeRange(values);
  };

  return (
    <View style={{marginTop: hp(3)}}>
      <Text>시간을 선택하세요: {timeRange[0]}시부터 {timeRange[1]}시까지</Text>
      <MultiSlider
        values={timeRange}
        sliderLength={280}
        onValuesChange={timeChange}
        min={0}
        max={24}
        step={1}
        allowOverlap={false}
        snapped
      />
    </View>
  );
};

export default SettingTime;
