import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useRecoilValue} from 'recoil';

import {RootStackProps, TempleStackProps} from '../../common/constants/routes';
import KillSwitch from '../../routes/KillSwitch/KillSwitch';
import {killSwitchFields} from '../killSwitch/state/state';
import Tabs from './Tabs';
import Temple from '../../routes/Temple/Temple';
import ChangingRoom from '../../routes/Temple/ChangingRoom';
import Portal from '../../routes/Temple/Portal';
import DailyProvider from '../../routes/Temple/DailyProvider';
import TempleModal from '../../routes/Temples/components/TempleModal';
import Contributors from '../../routes/Contributors/Contributors';

const RootStack = createNativeStackNavigator<RootStackProps>();
const TempleStack = createNativeStackNavigator<TempleStackProps>();

const stackOptions = {
  headerShown: false,
};

const TempleStackWrapper = () => (
  <DailyProvider>
    <TempleStack.Navigator
      screenOptions={{
        ...stackOptions,
        animation: 'fade',
        animationDuration: 2000,
        gestureEnabled: false,
      }}>
      <TempleStack.Screen name={'ChangingRoom'} component={ChangingRoom} />
      <TempleStack.Screen name={'Portal'} component={Portal} />
      <TempleStack.Screen name={'Temple'} component={Temple} />
    </TempleStack.Navigator>
  </DailyProvider>
);

const RootStackWrapper = () => {
  const isBlocking = useRecoilValue(killSwitchFields('isBlocking'));

  return (
    <RootStack.Navigator screenOptions={stackOptions}>
      {isBlocking ? (
        <RootStack.Screen name={'KillSwitch'} component={KillSwitch} />
      ) : (
        <>
          <RootStack.Screen name={'Tabs'} component={Tabs} />
          <RootStack.Screen
            name={'TempleStack'}
            component={TempleStackWrapper}
            options={{gestureEnabled: false}}
          />
          <RootStack.Screen name={'Contributors'} component={Contributors} />

          <RootStack.Group
            screenOptions={{
              presentation: 'transparentModal',
              gestureDirection: 'vertical',
              gestureEnabled: true,
            }}>
            <RootStack.Screen name={'TempleModal'} component={TempleModal} />
          </RootStack.Group>
        </>
      )}
    </RootStack.Navigator>
  );
};

export default RootStackWrapper;
