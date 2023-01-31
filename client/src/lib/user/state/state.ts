import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createJSONStorage, persist} from 'zustand/middleware';
import {omit} from 'ramda';

import {Session} from '../../../../../shared/src/types/Session';
import {v0} from './migrateVersion0';

const USER_STATE_VERSION = 1;

type PinnedSession = {
  id: string;
  expires: Date;
};

export type CompletedSession = {
  id: Session['id'];
  hostId: Session['hostId'];
  contentId: Session['contentId'];
  language: Session['language'];
  type: Session['type'];
  completedAt: Date;
};

export type UserState = {
  pinnedSessions?: Array<PinnedSession>;
  completedSessions?: Array<CompletedSession>;
  metricsUid?: string;
};

type SetCurrentUserState = (
  setter:
    | Partial<UserState>
    | ((userState: Partial<UserState>) => Partial<UserState>),
) => void;

type State = {
  user: FirebaseAuthTypes.User | null;
  claims: FirebaseAuthTypes.IdTokenResult['claims'];
  userState: {[key: string]: UserState};
};

type Actions = {
  setUser: (user: State['user']) => void;
  setClaims: (claims: State['claims']) => void;
  setUserAndClaims: (state: {
    user: State['user'];
    claims: State['claims'];
  }) => void;
  setPinnedSessions: (pinnedSessions: Array<PinnedSession>) => void;
  addCompletedSession: (completedSession: CompletedSession) => void;
  setCurrentUserState: SetCurrentUserState;
  reset: (isDelete?: boolean) => void;
};

const initialState: State = {
  user: null,
  claims: {},
  userState: {},
};

type GetCurrentUserStateSelector = (state: State) => UserState | undefined;
export const getCurrentUserStateSelector: GetCurrentUserStateSelector = ({
  user,
  userState,
}) => {
  if (user?.uid) {
    return userState[user.uid];
  }
};

const useUserState = create<State & Actions>()(
  persist(
    (set, get) => {
      const setCurrentUserState: SetCurrentUserState = setter => {
        const {user} = get();
        if (user?.uid) {
          const currentState = getCurrentUserStateSelector(get()) ?? {};
          const newState =
            typeof setter === 'function' ? setter(currentState) : setter;

          set(({userState}) => ({
            userState: {
              ...userState,
              [user.uid]: {
                ...currentState,
                ...newState,
              },
            },
          }));
        }
      };

      return {
        ...initialState,
        setUser: user => set({user}),
        setClaims: claims => set({claims}),
        setUserAndClaims: ({user, claims}) => set({user, claims}),

        setCurrentUserState,
        setPinnedSessions: pinnedSessions =>
          setCurrentUserState({pinnedSessions}),
        addCompletedSession: completedSession =>
          setCurrentUserState(({completedSessions = []} = {}) => ({
            completedSessions: [...completedSessions, completedSession],
          })),

        reset: isDelete => {
          const {user} = get();
          if (isDelete && user?.uid) {
            // Remove the state specific to the user on delete
            set(({userState}) => ({
              ...initialState,
              userState: omit([user.uid], userState),
            }));
          } else {
            // Keep persisted state in case of sign out
            set(({userState}) => ({...initialState, userState}));
          }
        },
      };
    },
    {
      name: 'userState',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({userState}) => ({userState}),
      // In dev I had change this with the app closed (android)
      // otherwise the "migrate" functions does not run
      version: USER_STATE_VERSION,
      migrate: async (persistedState, version) => {
        const persisted = persistedState as {userState: State['userState']};

        if (version === 0) {
          const newState: State['userState'] = {};
          for (const [userId, state] of Object.entries(persisted.userState)) {
            newState[userId] = await v0.migrateState(state as UserState);
          }
          return {userState: newState} as unknown as State & Actions;
        }

        return {userState: persisted.userState} as unknown as State & Actions;
      },
    },
  ),
);

export default useUserState;
