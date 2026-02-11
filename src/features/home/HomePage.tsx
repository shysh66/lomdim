import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { ProfileSelect } from './ProfileSelect';
import { ZoneSelect } from './ZoneSelect';

export const HomePage = () => {
  const { currentProfile, setCurrentProfile } = useGame();
  const [showZoneSelect, setShowZoneSelect] = useState(!!currentProfile);

  const handleProfileSelect = () => {
    setShowZoneSelect(true);
  };

  const handleBack = () => {
    setCurrentProfile(null);
    setShowZoneSelect(false);
  };

  if (!showZoneSelect) {
    return <ProfileSelect onSelect={handleProfileSelect} />;
  }

  return <ZoneSelect onBack={handleBack} />;
};
