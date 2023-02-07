import {PersistOptions} from 'zustand/middleware';

import {Actions, PersistedState, State} from '../state';
import migrateV0, {V0State} from './v0';
import migrateV1, {V1State} from './v1';

const migrate: Required<
  PersistOptions<State & Actions, PersistedState>
>['migrate'] = async (persistedState, version) => {
  let state = persistedState;

  if (version === 0) {
    state = await migrateV0(state as V0State);
  }

  if (version <= 1) {
    state = await migrateV1(state as V1State);
  }

  return state as State & Actions;
};

export default migrate;
