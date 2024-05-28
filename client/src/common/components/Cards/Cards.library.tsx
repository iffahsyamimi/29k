import React from 'react';

import ScreenWrapper from '../../../lib/uiLib/decorators/ScreenWrapper';
import {Spacer16} from '../Spacers/Spacer';
import {Body18} from '../Typography/Body/Body';
import Card from './Card';

const lottieSource = require('../../../assets/animations/mandala.json');

export const AllCards = () => (
  <ScreenWrapper>
    <Card
      title="Test temple"
      image={{
        uri: 'https://res.cloudinary.com/twentyninek/image/upload/v1646061249/Illustrations_Tests/take-test_c4qa3u.png',
      }}
      buttonText="Join"
      onPress={() => console.log('Temple Card!')}
    />
    <Spacer16 />
    <Card
      title="Test temple"
      description="With description"
      lottie={lottieSource}
      buttonText="Go fish!"
      onPress={() => console.log('Temple Card!')}
    />
    <Spacer16 />
    <Card
      description="Only description"
      lottie={lottieSource}
      buttonText="Go fish!"
      onPress={() => console.log('Temple Card!')}
    />
    <Spacer16 />
    <Card
      description="Only description"
      image={{
        uri: 'https://res.cloudinary.com/twentyninek/image/upload/v1646061249/Illustrations_Tests/take-test_c4qa3u.png',
      }}
      buttonText="Go dance!"
      onPress={() => console.log('Temple Card!')}>
      <Body18>Can have custom content</Body18>
      <Body18>Can have custom content</Body18>
      <Body18>Can have custom content</Body18>
    </Card>
  </ScreenWrapper>
);