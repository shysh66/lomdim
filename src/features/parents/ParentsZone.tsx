import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, BarChart3, Users, Settings } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useGame, RANKS } from '@/contexts/GameContext';
import { Button, Card } from '@/components/ui';
import { getRandomInt } from '@/lib/utils';

export const ParentsZone = () => {
  const navigate = useNavigate();
  const { profiles, currentProfile } = useGame();
  const [isLocked, setIsLocked] = useState(true);
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathQuestion] = useState(() => {
    const a = getRandomInt(3, 9);
    const b = getRandomInt(3, 9);
    return { a, b, answer: a * b };
  });
  const [selectedProfile, setSelectedProfile] = useState(currentProfile);
  const [activeTab, setActiveTab] = useState<'stats' | 'profiles' | 'settings'>('stats');

  const handleUnlock = () => {
    if (parseInt(mathAnswer) === mathQuestion.answer) {
      setIsLocked(false);
    } else {
      setMathAnswer('');
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
        >
          <Lock className="mx-auto mb-4 text-slate-400" size={48} />
          <h1 className="text-2xl font-bold mb-2">אזור הורים</h1>
          <p className="text-gray-600 mb-6">פתרו את התרגיל כדי להיכנס:</p>

          <div className="bg-slate-100 rounded-2xl p-6 mb-6">
            <p className="text-4xl font-bold text-slate-800">
              {mathQuestion.a} × {mathQuestion.b} = ?
            </p>
          </div>

          <input
            type="number"
            value={mathAnswer}
            onChange={(e) => setMathAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-2xl text-center mb-4"
            placeholder="התשובה..."
            autoFocus
          />

          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={() => navigate('/')}>
              חזרה
            </Button>
            <Button variant="primary" className="flex-1" onClick={handleUnlock}>
              כניסה
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const profile = selectedProfile || profiles[0];
  
  const activityData = profile?.activityHistory.slice(-7).map(h => ({
    date: new Date(h.date).toLocaleDateString('he-IL', { weekday: 'short' }),
    xp: h.xp,
  })) || [];

  const accuracyData = profile ? Object.entries(profile.accuracyBySubject).map(([subject, data]) => ({
    subject: subject === 'math' ? 'חשבון' : 
             subject === 'reading' ? 'קריאה' :
             subject === 'english' ? 'אנגלית' :
             subject === 'logic' ? 'חשיבה' :
             subject === 'memory' ? 'זיכרון' :
             subject === 'sorting' ? 'מיון' :
             subject === 'counting' ? 'ספירה' : subject,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    total: data.total,
  })) : [];

  const currentRank = RANKS.find(r => (profile?.totalXP || 0) >= r.minXP) || RANKS[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/80 hover:text-white"
        >
          <ArrowRight size={24} />
          <span className="font-bold">חזרה</span>
        </button>
        <h1 className="text-2xl font-bold text-white">אזור הורים 👨‍👩‍👧‍👦</h1>
      </div>

      <div className="flex gap-2 mb-6 max-w-lg mx-auto">
        {[
          { id: 'stats', icon: BarChart3, label: 'סטטיסטיקות' },
          { id: 'profiles', icon: Users, label: 'פרופילים' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all
              ${activeTab === tab.id ? 'bg-white text-slate-800' : 'bg-white/10 text-white hover:bg-white/20'}
            `}
          >
            <tab.icon size={20} />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'stats' && profile && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProfile(p)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all
                  ${selectedProfile?.id === p.id ? 'bg-white text-slate-800' : 'bg-white/10 text-white hover:bg-white/20'}
                `}
              >
                <span className="text-2xl">{p.avatar}</span>
                <span className="font-medium">{p.name}</span>
              </button>
            ))}
          </div>

          <Card className="bg-white/10 backdrop-blur text-white">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{profile.avatar}</span>
              <div>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-white/60">
                  {currentRank.emoji} {currentRank.name} • {profile.totalXP} XP
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={24} />
              פעילות ב-7 ימים אחרונים
            </h3>
            {activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} XP`, 'נקודות']} />
                  <Line
                    type="monotone"
                    dataKey="xp"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">אין נתונים עדיין</p>
            )}
          </Card>

          <Card className="bg-white">
            <h3 className="text-xl font-bold mb-4">דיוק לפי נושא</h3>
            {accuracyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={accuracyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="subject" width={80} />
                  <Tooltip formatter={(value, name) => {
                    const item = accuracyData.find(d => d.accuracy === value);
                    return [`${value}% (${item?.total || 0} שאלות)`, 'דיוק'];
                  }} />
                  <Bar dataKey="accuracy" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">אין נתונים עדיין</p>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'profiles' && (
        <div className="max-w-2xl mx-auto">
          <div className="grid gap-4">
            {profiles.map((p) => (
              <Card key={p.id} className="bg-white">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{p.avatar}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{p.name}</h3>
                    <p className="text-gray-600">
                      {RANKS.find(r => p.totalXP >= r.minXP)?.emoji}{' '}
                      {RANKS.find(r => p.totalXP >= r.minXP)?.name} • {p.totalXP} XP
                    </p>
                    <p className="text-sm text-gray-500">
                      רמות פתוחות: {Object.values(p.unlockedLevels).flat().length}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
