import React, { useEffect, useMemo, useState } from 'react';
import { keys, map, remove } from 'lodash';

import { languageDescription } from '@/components/Dialogs/constants';
import Button from '@/components/Input/Button';
import Checkbox from '@/components/Input/Checkbox';
import ModalPanel from '@/components/Panels/ModalPanel';
import { usePatchSettingsMutation } from '@/core/react-query/settings/mutations';
import { useSettingsQuery } from '@/core/react-query/settings/queries';
import useEventCallback from '@/hooks/useEventCallback';

type Props = {
  type: 'Series' | 'Episode' | null;
  onClose: () => void;
};

function LanguagesModal({ onClose, type }: Props) {
  const settings = useSettingsQuery().data;
  const LanguagePreference = useMemo(
    () => (type === 'Episode'
      ? settings.EpisodeLanguagePreference
      : settings.LanguagePreference),
    [type, settings],
  );
  const { mutate: patchSettings } = usePatchSettingsMutation();

  const [languages, setLanguages] = useState([] as string[]);

  const handleSave = useEventCallback(() => {
    patchSettings({
      newSettings: {
        ...settings,
        [type === 'Episode' ? 'EpisodeLanguagePreference' : 'LanguagePreference']: languages,
      },
    }, {
      onSuccess: () => onClose(),
    });
  });

  useEffect(() => {
    if (type !== null) setLanguages(LanguagePreference);
  }, [type, LanguagePreference]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked: value, id } = event.target;

    const newLanguages = languages.slice();

    if (value) newLanguages.push(id);
    else remove(newLanguages, item => item === id);

    setLanguages(newLanguages);
  };

  return (
    <ModalPanel
      show={type !== null}
      onRequestClose={onClose}
      header={`${type} Languages`}
    >
      <div className="w-full rounded-md border border-panel-border bg-panel-input p-4 capitalize">
        <div className="flex h-80 flex-col gap-y-1.5 overflow-y-auto rounded-md bg-panel-input px-3 py-2">
          {map(keys(languageDescription), (key: keyof typeof languageDescription) => (
            <Checkbox
              id={key}
              key={key}
              isChecked={languages.includes(key)}
              onChange={handleInputChange}
              label={languageDescription[key]}
              justify
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-5 py-2">Discard</Button>
        <Button onClick={handleSave} buttonType="primary" className="px-5 py-2" disabled={languages.length === 0}>
          Save
        </Button>
      </div>
    </ModalPanel>
  );
}

export default LanguagesModal;
