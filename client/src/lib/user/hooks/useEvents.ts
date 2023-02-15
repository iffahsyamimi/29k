import {useMemo} from 'react';
import {FeedbackEvent, PostEvent} from '../../../../../shared/src/types/Event';
import useUserState, {getCurrentUserStateSelector} from '../state/state';

const useEvents = () => {
  const events = useUserState(state =>
    getCurrentUserStateSelector(state),
  )?.events;

  const postEvents = useMemo(() => {
    if (events) {
      return events.filter(e => e.type === 'post') as PostEvent[];
    }
    return [];
  }, [events]);

  const feedbackEvents = useMemo(() => {
    if (events) {
      return events.filter(e => e.type === 'feedback') as FeedbackEvent[];
    }
    return [];
  }, [events]);

  return useMemo(
    () => ({
      postEvents,
      feedbackEvents,
    }),
    [postEvents, feedbackEvents],
  );
};

export default useEvents;
