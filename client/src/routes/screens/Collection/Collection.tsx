import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import hexToRgba from 'hex-to-rgba';
import React, {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {SectionList, SectionListRenderItem, Switch} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/native';
import {COLORS} from '../../../../../shared/src/constants/colors';
import {Exercise} from '../../../../../shared/src/types/generated/Exercise';
import CompletedSessionCard from '../../../lib/components/Cards/SessionCard/CompletedSessionCard';
import ExerciseCardContainer from '../../../lib/components/Cards/SessionCard/ExerciseCardContainer';
import CompletedSessionsCount from '../../../lib/components/CompletedSessionsCount/CompletedSessionsCount';
import Gutters from '../../../lib/components/Gutters/Gutters';
import Image from '../../../lib/components/Image/Image';
import Screen from '../../../lib/components/Screen/Screen';
import {
  Spacer24,
  Spacer32,
  Spacer48,
  Spacer8,
  TopSafeArea,
} from '../../../lib/components/Spacers/Spacer';
import StickyHeading from '../../../lib/components/StickyHeading/StickyHeading';
import {Body16} from '../../../lib/components/Typography/Body/Body';
import {Display20} from '../../../lib/components/Typography/Display/Display';
import {Heading16} from '../../../lib/components/Typography/Heading/Heading';
import useCollectionById from '../../../lib/content/hooks/useCollectionById';
import useGetExerciseById from '../../../lib/content/hooks/useGetExerciseById';
import {SessionsStackProps} from '../../../lib/navigation/constants/routes';
import useCompletedSessionByTime from '../../../lib/user/hooks/useCompletedSessionByTime';
import useSaveCollection from '../../../lib/user/hooks/useSaveCollection';
import useSavedCollectionById from '../../../lib/user/hooks/useSavedCollection';

type Section = {
  title: string;
  data: Exercise[];
};

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  flex: 1,
});

const LeftColumn = styled.View({
  flex: 1,
  height: 134,
  justifyContent: 'space-between',
});

const GraphicsWrapper = styled.View({
  width: 134,
  height: 134,
});

const Wrapper = styled.View({flex: 1});

const BottomGradient = styled(LinearGradient)({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: 40,
});

const Collection = () => {
  const {
    params: {collectionId},
  } = useRoute<RouteProp<SessionsStackProps, 'Collection'>>();
  const {goBack} =
    useNavigation<NativeStackNavigationProp<SessionsStackProps>>();
  const {t} = useTranslation('Screen.Collection');
  const collection = useCollectionById(collectionId);
  const savedCollection = useSavedCollectionById(collectionId);
  const getExerciseById = useGetExerciseById();
  const {getCompletedSessionByExerciseId} = useCompletedSessionByTime();
  const {toggleSaved, isSaved} = useSaveCollection(collectionId);
  const [completedSessionCount] = useState(0); // TODO: get this from some storage

  const colors = useMemo(
    () => [hexToRgba(COLORS.WHITE, 0), hexToRgba(COLORS.WHITE, 1)],
    [],
  );

  const image = useMemo(
    () => ({
      uri: collection?.image?.source,
    }),
    [collection],
  );

  const trackColor = useMemo(() => ({true: COLORS.PRIMARY}), []);

  const exerciseSections = useMemo(() => {
    const exercises = collection?.exercises
      .map(id => getExerciseById(id))
      .filter(Boolean) as Array<Exercise>;
    return [
      {
        title: t('sessionsHeading'),
        data: exercises,
      } as Section,
    ];
  }, [collection, getExerciseById, t]);

  const renderExerciseSectionHeader = useCallback<
    (info: {section: Section}) => React.ReactElement
  >(
    ({section: {title}}) => (
      <StickyHeading backgroundColor={COLORS.GREYLIGHTEST}>
        <Heading16>{title}</Heading16>
      </StickyHeading>
    ),
    [],
  );

  const renderExerciseItem = useCallback<
    SectionListRenderItem<Exercise, Section>
  >(
    ({item, section, index}) => {
      const hasCardBefore = index > 0;
      const hasCardAfter = index !== section.data.length - 1;
      const completedExerciseEvent = savedCollection
        ? getCompletedSessionByExerciseId(item.id, savedCollection.statedAt)
        : undefined;
      return (
        <Gutters>
          {completedExerciseEvent ? (
            <CompletedSessionCard
              completedSessionEvent={completedExerciseEvent}
              hasCardBefore={hasCardBefore}
              hasCardAfter={hasCardAfter}
            />
          ) : (
            <ExerciseCardContainer
              exercise={item}
              hasCardBefore={hasCardBefore}
              hasCardAfter={hasCardAfter}
            />
          )}
        </Gutters>
      );
    },
    [savedCollection, getCompletedSessionByExerciseId],
  );

  return (
    <Screen
      onPressBack={goBack}
      backgroundColor={COLORS.GREYLIGHTEST}
      title={t('collectionHeading')}>
      <Wrapper>
        <TopSafeArea />
        <Spacer32 />

        <SectionList
          sections={exerciseSections}
          keyExtractor={exercise => exercise.id}
          ListHeaderComponent={
            <Gutters>
              <Spacer32 />
              <Row>
                <LeftColumn>
                  <Spacer8 />
                  <Display20 numberOfLines={3}>{collection?.name}</Display20>
                  {completedSessionCount > 0 ? (
                    <CompletedSessionsCount count={completedSessionCount} />
                  ) : (
                    <Spacer8 />
                  )}
                </LeftColumn>
                <GraphicsWrapper>
                  <Image source={image} />
                </GraphicsWrapper>
              </Row>

              <Spacer32 />
              <Row>
                <Body16>{t('addToJourney')}</Body16>
                <Switch
                  trackColor={trackColor}
                  value={isSaved}
                  onValueChange={toggleSaved}
                />
              </Row>
              <Spacer24 />
            </Gutters>
          }
          renderSectionHeader={renderExerciseSectionHeader}
          ListFooterComponent={Spacer48}
          renderItem={renderExerciseItem}
        />
      </Wrapper>
      <BottomGradient colors={colors} />
    </Screen>
  );
};

export default Collection;
