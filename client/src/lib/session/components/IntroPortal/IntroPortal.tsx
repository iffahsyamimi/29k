import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import {SPACINGS} from '../../../constants/spacings';
import useSessionState from '../../state/state';
import {Exercise} from '../../../../../../shared/src/types/generated/Exercise';
import Screen from '../../../components/Screen/Screen';
import {
  BottomSafeArea,
  Spacer16,
  TopSafeArea,
} from '../../../components/Spacers/Spacer';
import Gutters from '../../../components/Gutters/Gutters';
import IconButton from '../../../components/Buttons/IconButton/IconButton';
import AudioFader from '../AudioFader/AudioFader';
import HostNotes from '../HostNotes/HostNotes';
import {ArrowLeftIcon} from '../../../components/Icons';
import Button from '../../../components/Buttons/Button';
import VideoTransition from '../VideoTransition/VideoTransition';
import P5Animation from '../P5Animation/P5Animation';

const Spinner = styled.ActivityIndicator({
  ...StyleSheet.absoluteFillObject,
});

const Wrapper = styled.View({
  flex: 1,
  justifyContent: 'space-between',
  zIndex: 1,
});
const Content = styled.View({
  flex: 1,
  justifyContent: 'space-between',
});

const TopBar = styled(Gutters)({
  justifyContent: 'space-between',
  flexDirection: 'row',
});

const BackButton = styled(IconButton)({
  marginLeft: -SPACINGS.SIXTEEN,
});

type IntroPortalProps = {
  exercise: Exercise | null;
  isHost: boolean;
  isVisible: boolean;
  isLive?: boolean;
  hideHostNotes?: boolean;
  onStartSession: () => void;
  onLeaveSession: () => void;
  onNavigateToSession: () => void;
  statusComponent?: React.ReactNode;
};

const IntroPortal: React.FC<IntroPortalProps> = ({
  exercise,
  isHost,
  isVisible,
  isLive,
  hideHostNotes = false,
  onStartSession,
  onLeaveSession,
  onNavigateToSession,
  statusComponent,
}) => {
  const {t} = useTranslation('Screen.Portal');

  const introPortal = exercise?.introPortal;
  const textColor = exercise?.theme?.textColor;

  const isVideo =
    !introPortal?.videoLoop?.p5JsScript?.code &&
    Boolean(introPortal?.videoLoop?.source);

  const [isReadyForAudio, setIsReadyForAudio] = useState(!isVideo);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(isVideo);
  const [hasError, setHasError] = useState(false);

  const sessionState = useSessionState(state => state.sessionState);

  useEffect(() => {
    if (sessionState?.started && !isVideo) {
      // If no video is defined, navigate directly
      onNavigateToSession();
    } else if (sessionState?.started && (isLoading || hasError)) {
      // If sesstion is started but video not loaded, navigate directly
      onNavigateToSession();
    } else if (sessionState?.started && !isLive) {
      // If async, don't wait for the end video
      onNavigateToSession();
    }
  }, [
    isLoading,
    hasError,
    sessionState?.started,
    isVideo,
    isLive,
    onNavigateToSession,
  ]);

  const onVideoLoad = useCallback(() => {
    setIsLoading(false);
    // TODO remove this timeout when daily is not joined
    // until after the portal is done
    // https://www.notion.so/29k/Early-Access-2794500652b34c64b0aff0dbbc53e0ab?pvs=4#2f566fc8ac87402aa92eb6798b469918
    setTimeout(() => {
      setIsReadyForAudio(true);
    }, 2000);
  }, [setIsReadyForAudio, setIsLoading]);

  const onVideoTransition = useCallback(() => {
    setIsTransitioning(true);
    ReactNativeHapticFeedback.trigger('impactHeavy');
  }, [setIsTransitioning]);

  const onVideoEnd = useCallback(() => {
    onNavigateToSession();
  }, [onNavigateToSession]);

  const onVideoError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, [setHasError]);

  if (!isVisible) return null;

  return (
    <Screen backgroundColor={exercise?.theme?.backgroundColor}>
      {(!isHost || hideHostNotes) && <TopSafeArea minSize={SPACINGS.SIXTEEN} />}

      {introPortal?.videoLoop?.audio ? (
        <AudioFader
          source={introPortal.videoLoop.audio}
          paused={!isReadyForAudio}
          volume={isTransitioning ? 0 : 1}
          duration={isTransitioning ? 5000 : 10000}
          isLive={isLive}
          repeat
        />
      ) : null}

      {introPortal?.videoLoop?.p5JsScript?.code ? (
        <P5Animation script={introPortal.videoLoop.p5JsScript.code} />
      ) : introPortal?.videoLoop?.source ? (
        <VideoTransition
          repeat={!sessionState?.started}
          loopSource={introPortal?.videoLoop?.source}
          endSource={introPortal?.videoEnd?.source}
          onLoad={onVideoLoad}
          onTransition={onVideoTransition}
          onEnd={onVideoEnd}
          onError={onVideoError}
          isLive={isLive}
        />
      ) : null}

      {isHost && !hideHostNotes && (
        <>
          <HostNotes introPortal exercise={exercise} />
          <Spacer16 />
        </>
      )}
      {isLoading && <Spinner color={exercise?.theme?.textColor} size="large" />}
      <Wrapper>
        <Content>
          <TopBar>
            <BackButton
              onPress={onLeaveSession}
              fill={textColor}
              Icon={ArrowLeftIcon}
              noBackground
            />
            {__DEV__ && sessionState?.started && (
              <Button size="small" onPress={onNavigateToSession}>
                {t('skipPortal')}
              </Button>
            )}
            {isHost && (
              <Button
                size="small"
                disabled={sessionState?.started}
                onPress={onStartSession}>
                {sessionState?.started
                  ? t('sessionStarted')
                  : t('startSession')}
              </Button>
            )}
          </TopBar>
          {statusComponent}
        </Content>
      </Wrapper>
      <BottomSafeArea minSize={SPACINGS.SIXTEEN} />
    </Screen>
  );
};

export default IntroPortal;
