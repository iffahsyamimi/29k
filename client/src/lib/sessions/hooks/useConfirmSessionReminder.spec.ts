import {Alert} from 'react-native';
import {renderHook} from '@testing-library/react-hooks';

import useConfirmSessionReminder from './useConfirmSessionReminder';
import {LiveSession} from '../../../../../shared/src/types/Session';
import useNotificationSetting from '../../notifications/hooks/useNotificationSetting';

const mockAlert = jest.mocked(Alert.alert);

const mockSetNotificationsEnabled = jest.fn();
const mockUseNotificationSetting = jest.mocked(useNotificationSetting);
jest.mock('../../notifications/hooks/useNotificationSetting');

const mockToggleReminder = jest.fn();
jest.mock('../../sessions/hooks/useSessionNotificationReminder', () => () => ({
  toggleReminder: mockToggleReminder,
}));

afterEach(jest.clearAllMocks);

describe('useConfirmSessionReminder', () => {
  describe('notificationsEnabled == true', () => {
    beforeEach(() => {
      mockUseNotificationSetting.mockReturnValueOnce({
        notificationsEnabled: true,
        setNotificationsEnabled: mockSetNotificationsEnabled,
      });
    });

    it('toggles reminder on', async () => {
      const {result} = renderHook(() =>
        useConfirmSessionReminder({id: 'session-id'} as LiveSession),
      );

      await result.current(true);

      expect(mockToggleReminder).toHaveBeenCalledTimes(1);
      expect(mockToggleReminder).toHaveBeenCalledWith(true);
    });

    it('toggles reminder off', async () => {
      const {result} = renderHook(() =>
        useConfirmSessionReminder({id: 'session-id'} as LiveSession),
      );

      await result.current(false);

      expect(mockToggleReminder).toHaveBeenCalledTimes(1);
      expect(mockToggleReminder).toHaveBeenCalledWith(false);
    });
  });

  describe('notificationsEnabled == false', () => {
    beforeEach(() => {
      mockUseNotificationSetting.mockReturnValueOnce({
        notificationsEnabled: false,
        setNotificationsEnabled: mockSetNotificationsEnabled,
      });
    });

    it('does not toggle reminder on', async () => {
      const {result} = renderHook(() =>
        useConfirmSessionReminder({id: 'session-id'} as LiveSession),
      );

      await result.current(true);

      expect(mockToggleReminder).toHaveBeenCalledTimes(0);
    });

    it('does not toggle reminder off', async () => {
      const {result} = renderHook(() =>
        useConfirmSessionReminder({id: 'session-id'} as LiveSession),
      );

      await result.current(false);

      expect(mockToggleReminder).toHaveBeenCalledTimes(0);
    });
  });

  describe('notificationsEnabled == undefined', () => {
    beforeEach(() => {
      mockUseNotificationSetting.mockReturnValueOnce({
        notificationsEnabled: undefined,
        setNotificationsEnabled: mockSetNotificationsEnabled,
      });
    });

    it('prompts the user about enabling notification reminders', async () => {
      const {result} = renderHook(() =>
        useConfirmSessionReminder({id: 'session-id'} as LiveSession),
      );

      await result.current(true);

      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockAlert).toHaveBeenCalledWith('title', 'message', [
        {
          text: 'actions.dismiss',
          style: 'destructive',
          onPress: expect.any(Function),
        },
        {text: 'actions.cancel'},
        {
          text: 'actions.confirm',
          onPress: expect.any(Function),
        },
      ]);
    });

    it('disables notification reminders on dismiss', async () => {
      mockAlert.mockImplementationOnce((header, text, config) => {
        // Run the dismiss action
        if (config?.[0]?.onPress) {
          config[0].onPress();
        }
      });

      const {result} = renderHook(() =>
        useConfirmSessionReminder({id: 'session-id'} as LiveSession),
      );

      await result.current(true);

      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockToggleReminder).toHaveBeenCalledTimes(0);
      expect(mockSetNotificationsEnabled).toHaveBeenCalledTimes(1);
      expect(mockSetNotificationsEnabled).toHaveBeenCalledWith(false);
    });

    it('does nothing on cancel', async () => {
      mockAlert.mockImplementationOnce((header, text, config) => {
        // Run the cancel action
        if (config?.[1]?.onPress) {
          config[1].onPress();
        }
      });

      const {result} = renderHook(() =>
        useConfirmSessionReminder({id: 'session-id'} as LiveSession),
      );

      await result.current(true);

      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockToggleReminder).toHaveBeenCalledTimes(0);
      expect(mockSetNotificationsEnabled).toHaveBeenCalledTimes(0);
    });

    it('enables notification reminders on confirm', async () => {
      mockAlert.mockImplementationOnce((header, text, config) => {
        // Run the confirm action
        if (config?.[2]?.onPress) {
          config[2].onPress();
        }
      });

      const {result} = renderHook(() =>
        useConfirmSessionReminder({id: 'session-id'} as LiveSession),
      );

      await result.current(true);

      expect(mockAlert).toHaveBeenCalledTimes(1);
      expect(mockSetNotificationsEnabled).toHaveBeenCalledTimes(0);
      expect(mockToggleReminder).toHaveBeenCalledTimes(1);
      expect(mockToggleReminder).toHaveBeenCalledWith(true);
    });

    it('does nothing on disabling notification reminder', async () => {
      mockAlert.mockImplementationOnce((header, text, config) => {
        // Run the confirm action
        if (config?.[2]?.onPress) {
          config[2].onPress();
        }
      });

      const {result} = renderHook(() =>
        useConfirmSessionReminder({id: 'session-id'} as LiveSession),
      );

      await result.current(false);

      expect(mockAlert).toHaveBeenCalledTimes(0);
      expect(mockSetNotificationsEnabled).toHaveBeenCalledTimes(0);
      expect(mockToggleReminder).toHaveBeenCalledTimes(0);
    });
  });
});
