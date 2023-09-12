import React from 'react';
import {Path} from 'react-native-svg';
import {IconType} from '..';
import {COLORS} from '../../../../../../shared/src/constants/colors';
import Icon from '../Icon';

export const FilmCameraCheckIcon: IconType = ({fill = COLORS.BLACK}) => (
  <Icon>
    <Path
      d="M11.613 21.754h6.95c2.42 0 3.823-1.375 3.823-3.738v-1.13l3.38 2.863c.443.367.904.621 1.356.621.857 0 1.45-.621 1.45-1.544v-9.84c0-.933-.593-1.555-1.45-1.555-.452 0-.913.255-1.356.622l-3.38 2.863V9.738C22.386 7.375 20.983 6 18.562 6H8.77C6.434 6 4.955 7.375 4.955 9.748v3.654a7.03 7.03 0 0 1 .895-.066c.31 0 .621.028.923.075v-3.4c0-1.553.838-2.316 2.307-2.316h9.172c1.469 0 2.307.791 2.307 2.317v7.721c0 1.535-.848 2.326-2.307 2.326H11.99a5.163 5.163 0 0 1-.377 1.695Zm14.86-3.56-4.087-3.342V12.95l4.087-3.343c.084-.066.14-.113.216-.113.104 0 .16.084.16.207v8.4c0 .122-.056.207-.16.207-.075 0-.132-.047-.216-.113ZM5.859 24.383c2.627 0 4.85-2.204 4.85-4.86 0-2.655-2.194-4.85-4.85-4.85-2.665 0-4.859 2.195-4.859 4.85 0 2.666 2.194 4.86 4.86 4.86Zm-.565-1.997a.733.733 0 0 1-.546-.226l-1.77-1.93a.732.732 0 0 1-.16-.452c0-.415.31-.678.677-.678.217 0 .387.085.509.216l1.243 1.366 2.401-3.324a.692.692 0 0 1 .565-.292c.368 0 .688.292.688.668a.7.7 0 0 1-.142.396L5.85 22.13c-.112.16-.329.254-.555.254Z"
      fill={fill}
    />
  </Icon>
);