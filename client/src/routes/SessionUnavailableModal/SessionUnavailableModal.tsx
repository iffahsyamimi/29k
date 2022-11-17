import React from 'react';
import {useTranslation} from 'react-i18next';

import Gutters from '../../common/components/Gutters/Gutters';
import SheetModal from '../../lib/modal/components/SheetModal';
import {Spacer16, Spacer24} from '../../common/components/Spacers/Spacer';
import {Body16} from '../../common/components/Typography/Body/Body';

const SessionUnavailableModal = () => {
  const {t} = useTranslation('Modal.SessionUnavailable');

  return (
    <SheetModal>
      <Spacer16 />
      <Gutters>
        <Spacer24 />
        <Body16>{t('description')}</Body16>
        <Spacer24 />
      </Gutters>
    </SheetModal>
  );
};

export default SessionUnavailableModal;
