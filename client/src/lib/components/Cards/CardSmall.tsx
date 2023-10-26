import React, {Fragment, useMemo} from 'react';
import {ViewStyle} from 'react-native';
import styled from 'styled-components/native';
import AnimatedLottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import hexToRgba from 'hex-to-rgba';

import {COLORS} from '../../../../../shared/src/constants/colors';
import {SPACINGS} from '../../constants/spacings';
import Image from '../Image/Image';
import TouchableOpacity from '../TouchableOpacity/TouchableOpacity';
import {Display16} from '../Typography/Display/Display';
import Byline from '../Bylines/Byline';
import {Spacer4, Spacer8} from '../Spacers/Spacer';
import Tag from '../Tag/Tag';
import {UserType} from '../../../../../shared/src/schemas/User';
import {ExerciseCard} from '../../../../../shared/src/types/generated/Exercise';

export const HEIGHT = 80;

const Wrapper = styled(TouchableOpacity)<{backgroundColor: string}>(
  ({backgroundColor}) => ({
    height: HEIGHT,
    borderRadius: 16,
    backgroundColor,
    padding: 8,
    paddingLeft: 16,
    flexDirection: 'row',
    overflow: 'hidden',
  }),
);

const Graphic = styled.View<{backgroundColor?: string}>(
  ({backgroundColor}) => ({
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor,
  }),
);

const Lottie = styled(AnimatedLottieView)({
  aspectRatio: '1',
});

const Main = styled.View({
  flex: 1,
  justifyContent: 'center',
});

const Tags = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  overflow: 'hidden',
});

const TagsGradient = styled(LinearGradient)({
  position: 'absolute',
  right: -SPACINGS.SIXTEEN,
  bottom: 0,
  width: 30,
  height: 20,
});

const Title = styled(Display16)({
  textOverflow: 'ellipsis',
});

const Content = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

type CardProps = {
  title?: string;
  tags?: Array<string>;
  graphic?: ExerciseCard;
  onPress: () => void;
  hostProfile?: UserType | null;
  completed?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
};

export const CardSmall: React.FC<CardProps> = ({
  title,
  tags,
  graphic,
  onPress,
  hostProfile,
  completed,
  style,
  children,
}) => {
  const colors = useMemo(
    () => [
      hexToRgba(COLORS.CREAM, 0),
      hexToRgba(COLORS.CREAM, 1),
      hexToRgba(COLORS.CREAM, 1),
    ],
    [],
  );

  const image = useMemo(
    () =>
      graphic?.image?.source
        ? {
            uri: graphic?.image?.source,
          }
        : undefined,
    [graphic?.image?.source],
  );

  const lottie = useMemo(
    () =>
      graphic?.lottie?.source
        ? {
            uri: graphic?.lottie?.source,
          }
        : undefined,
    [graphic?.lottie?.source],
  );

  return (
    <Wrapper
      onPress={onPress}
      style={style}
      backgroundColor={completed ? COLORS.LIGHT_GREEN : COLORS.CREAM}>
      <Main>
        {tags && (
          <>
            <Tags>
              {tags &&
                tags.map(tag => (
                  <Fragment key={tag}>
                    <Tag>{tag}</Tag>
                    <Spacer4 />
                  </Fragment>
                ))}
              <TagsGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={colors}
              />
            </Tags>
            <Spacer4 />
          </>
        )}
        <Title numberOfLines={children || tags ? 1 : 2}>{title}</Title>
        {hostProfile && (
          <>
            <Spacer4 />
            <Byline
              small
              pictureURL={hostProfile.photoURL}
              name={hostProfile.displayName}
            />
          </>
        )}
        {children && (
          <>
            <Spacer4 />
            <Content>{children}</Content>
          </>
        )}
      </Main>
      <Spacer8 />
      <Graphic backgroundColor={graphic?.backgroundColor}>
        {lottie ? (
          <Lottie source={lottie} autoPlay loop />
        ) : image ? (
          <Image resizeMode="contain" source={image} />
        ) : null}
      </Graphic>
    </Wrapper>
  );
};

export default CardSmall;