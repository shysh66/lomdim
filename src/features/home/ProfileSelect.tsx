import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, User } from 'lucide-react';
import { useGame, AVATARS } from '@/contexts/GameContext';
import { Button, Card, Modal } from '@/components/ui';

interface ProfileSelectProps {
  onSelect: () => void;
}

export const ProfileSelect = ({ onSelect }: ProfileSelectProps) => {
  const { profiles, setCurrentProfile, addProfile } = useGame();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const handleCreate = () => {
    if (newName.trim()) {
      addProfile(newName.trim(), selectedAvatar);
      setShowCreate(false);
      setNewName('');
      onSelect();
    }
  };

  const handleSelectProfile = (profile: typeof profiles[0]) => {
    setCurrentProfile(profile);
    onSelect();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl font-bold text-white mb-2">לומדים! 📚</h1>
        <p className="text-xl text-white/80">בחרו שחקן</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl w-full">
        {profiles.map((profile, i) => (
          <motion.div
            key={profile.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              className="text-center hover:ring-4 ring-white/50"
              onClick={() => handleSelectProfile(profile)}
            >
              <span className="text-6xl block mb-2">{profile.avatar}</span>
              <p className="font-bold text-lg">{profile.name}</p>
              <p className="text-sm text-gray-500">{profile.totalXP} XP</p>
            </Card>
          </motion.div>
        ))}

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: profiles.length * 0.1 }}
        >
          <Card
            className="text-center border-2 border-dashed border-gray-300 hover:border-purple-400 bg-white/80"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="font-bold text-gray-600">שחקן חדש</p>
          </Card>
        </motion.div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="שחקן חדש">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">שם</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-lg"
              placeholder="הכניסו שם..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">דמות</label>
            <div className="grid grid-cols-5 gap-2">
              {AVATARS.map(avatar => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-4xl p-2 rounded-xl transition-all ${
                    selectedAvatar === avatar
                      ? 'bg-purple-100 ring-2 ring-purple-400 scale-110'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleCreate}
            disabled={!newName.trim()}
          >
            יצירת שחקן
          </Button>
        </div>
      </Modal>
    </div>
  );
};
