import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui';
import { speak, getRandomInt } from '@/lib/utils';

const ANIMALS = [
  { emoji: '🦁', name: 'אריה', food: '🍖' },
  { emoji: '🐘', name: 'פיל', food: '🥜' },
  { emoji: '🐰', name: 'ארנב', food: '🥕' },
  { emoji: '🐵', name: 'קוף', food: '🍌' },
];

const FoodItem = ({ id, emoji }: { id: string; emoji: string }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`text-5xl cursor-grab active:cursor-grabbing touch-none
        ${isDragging ? 'opacity-50 scale-110' : ''}`}
      whileHover={{ scale: 1.1 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
    >
      {emoji}
    </motion.div>
  );
};

const AnimalZone = ({ children }: { children: React.ReactNode }) => {
  const { isOver, setNodeRef } = useDroppable({ id: 'animal' });

  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-3xl p-8 transition-all ${isOver ? 'scale-105' : ''}`}
    >
      {children}
    </div>
  );
};

export const FeedGame = () => {
  const navigate = useNavigate();
  const { addXP } = useGame();
  const [animal, setAnimal] = useState(ANIMALS[0]);
  const [targetCount, setTargetCount] = useState(3);
  const [fedCount, setFedCount] = useState(0);
  const [foodItems, setFoodItems] = useState<string[]>([]);
  const [showComplete, setShowComplete] = useState(false);
  const [round, setRound] = useState(1);

  useEffect(() => {
    startNewRound();
  }, []);

  const startNewRound = () => {
    const newAnimal = ANIMALS[getRandomInt(0, ANIMALS.length - 1)];
    const newTarget = getRandomInt(1, 5);
    setAnimal(newAnimal);
    setTargetCount(newTarget);
    setFedCount(0);
    setFoodItems(Array.from({ length: 8 }, (_, i) => `food-${i}`));
    setShowComplete(false);

    setTimeout(() => {
      speak(`תנו ל${newAnimal.name} ${newTarget} ${newTarget === 1 ? 'אוכל' : 'פריטי אוכל'}`);
    }, 300);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || over.id !== 'animal') return;

    const newFedCount = fedCount + 1;
    setFedCount(newFedCount);
    setFoodItems(prev => prev.filter(id => id !== active.id));

    speak(String(newFedCount));

    if (newFedCount === targetCount) {
      setTimeout(() => {
        speak('מצוין! האכלת נכון!');
        setShowComplete(true);
        addXP(10 + targetCount * 5, 'counting', true);
      }, 500);
    } else if (newFedCount > targetCount) {
      speak('יותר מדי! נסה שוב');
      addXP(0, 'counting', false);
      setTimeout(startNewRound, 1500);
    }
  };

  const nextRound = () => {
    setRound(round + 1);
    startNewRound();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 to-emerald-300 p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/zone-a')}
          className="flex items-center gap-2 text-green-700"
        >
          <ArrowRight size={24} />
          <span className="font-bold">חזרה</span>
        </button>
        <h1 className="text-2xl font-bold text-green-800">🦁 זמן אוכל</h1>
        <button onClick={startNewRound} className="p-2 rounded-full bg-white/50">
          <RotateCcw size={24} />
        </button>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-4 bg-white rounded-full px-8 py-4 shadow-lg">
          <span className="text-3xl">תנו ל{animal.name}</span>
          <span className="text-5xl font-bold text-green-600">{targetCount}</span>
          <span className="text-4xl">{animal.food}</span>
        </div>
      </motion.div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col items-center gap-8">
          <AnimalZone>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-center"
            >
              <span className="text-[150px] block">{animal.emoji}</span>
              <div className="flex justify-center gap-1 mt-2">
                {Array.from({ length: fedCount }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="text-3xl"
                  >
                    {animal.food}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </AnimalZone>

          <div className="bg-amber-100 rounded-3xl p-6 shadow-lg">
            <p className="text-center text-lg font-bold text-amber-700 mb-4">
              גררו את האוכל לחיה
            </p>
            <div className="flex flex-wrap justify-center gap-4 min-h-[80px]">
              {foodItems.map((id) => (
                <FoodItem key={id} id={id} emoji={animal.food} />
              ))}
            </div>
          </div>
        </div>
      </DndContext>

      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-8 text-center"
            >
              <span className="text-8xl block mb-4">🎉</span>
              <h2 className="text-3xl font-bold mb-2">יופי!</h2>
              <p className="text-xl text-gray-600 mb-6">+{10 + targetCount * 5} XP</p>
              <div className="flex gap-4 justify-center">
                <Button variant="secondary" size="lg" onClick={() => navigate('/zone-a')}>
                  חזרה
                </Button>
                <Button variant="zone-a" size="lg" onClick={nextRound}>
                  עוד פעם!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
