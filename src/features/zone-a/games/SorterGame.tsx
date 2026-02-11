import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui';
import { speak, shuffleArray } from '@/lib/utils';

interface Item {
  id: string;
  emoji: string;
  category: string;
}

interface Level {
  name: string;
  categories: { id: string; name: string; emoji: string; color: string }[];
  items: Item[];
}

const LEVELS: Level[] = [
  {
    name: 'צבעים',
    categories: [
      { id: 'red', name: 'אדום', emoji: '🔴', color: 'bg-red-200 border-red-400' },
      { id: 'blue', name: 'כחול', emoji: '🔵', color: 'bg-blue-200 border-blue-400' },
    ],
    items: [
      { id: '1', emoji: '🍎', category: 'red' },
      { id: '2', emoji: '🍓', category: 'red' },
      { id: '3', emoji: '❤️', category: 'red' },
      { id: '4', emoji: '🧢', category: 'blue' },
      { id: '5', emoji: '🐳', category: 'blue' },
      { id: '6', emoji: '💙', category: 'blue' },
    ],
  },
  {
    name: 'צורות',
    categories: [
      { id: 'circle', name: 'עיגול', emoji: '⭕', color: 'bg-green-200 border-green-400' },
      { id: 'square', name: 'ריבוע', emoji: '⬜', color: 'bg-yellow-200 border-yellow-400' },
    ],
    items: [
      { id: '1', emoji: '🔴', category: 'circle' },
      { id: '2', emoji: '🟠', category: 'circle' },
      { id: '3', emoji: '⚽', category: 'circle' },
      { id: '4', emoji: '📦', category: 'square' },
      { id: '5', emoji: '🎁', category: 'square' },
      { id: '6', emoji: '📱', category: 'square' },
    ],
  },
  {
    name: 'חיות',
    categories: [
      { id: 'land', name: 'יבשה', emoji: '🌳', color: 'bg-green-200 border-green-400' },
      { id: 'sea', name: 'ים', emoji: '🌊', color: 'bg-blue-200 border-blue-400' },
    ],
    items: [
      { id: '1', emoji: '🦁', category: 'land' },
      { id: '2', emoji: '🐘', category: 'land' },
      { id: '3', emoji: '🐕', category: 'land' },
      { id: '4', emoji: '🐠', category: 'sea' },
      { id: '5', emoji: '🐙', category: 'sea' },
      { id: '6', emoji: '🐳', category: 'sea' },
    ],
  },
];

const DraggableItem = ({ item, sorted }: { item: Item; sorted: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: item,
    disabled: sorted,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  if (sorted) return null;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`text-6xl cursor-grab active:cursor-grabbing p-4 rounded-2xl bg-white shadow-lg touch-none
        ${isDragging ? 'opacity-50 scale-110' : ''}`}
      whileHover={{ scale: 1.1 }}
    >
      {item.emoji}
    </motion.div>
  );
};

const DropZone = ({ category, children }: { category: typeof LEVELS[0]['categories'][0]; children: React.ReactNode }) => {
  const { isOver, setNodeRef } = useDroppable({ id: category.id });

  return (
    <div
      ref={setNodeRef}
      className={`${category.color} border-4 border-dashed rounded-3xl p-6 min-h-[200px] flex flex-col items-center
        ${isOver ? 'scale-105 border-solid' : ''} transition-all`}
    >
      <span className="text-5xl mb-2">{category.emoji}</span>
      <p className="text-xl font-bold mb-4">{category.name}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {children}
      </div>
    </div>
  );
};

export const SorterGame = () => {
  const navigate = useNavigate();
  const { addXP, unlockLevel } = useGame();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [sortedItems, setSortedItems] = useState<Record<string, Item[]>>({});
  const [shake, setShake] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  const level = LEVELS[currentLevel];

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  const resetLevel = () => {
    setItems(shuffleArray([...level.items]));
    setSortedItems(Object.fromEntries(level.categories.map(c => [c.id, []])));
    setShowComplete(false);
    speak(level.name);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const item = active.data.current as Item;
    const targetCategory = over.id as string;

    if (item.category === targetCategory) {
      speak('יופי!');
      setSortedItems(prev => ({
        ...prev,
        [targetCategory]: [...prev[targetCategory], item],
      }));
      addXP(10, 'sorting', true);

      const remaining = items.filter(i => i.id !== item.id);
      if (remaining.length === 0) {
        setTimeout(() => {
          setShowComplete(true);
          speak('כל הכבוד! סיימת את השלב!');
          addXP(50);
          unlockLevel('sorter', currentLevel + 2);
        }, 500);
      }
    } else {
      setShake(item.id);
      speak('נסה שוב');
      addXP(0, 'sorting', false);
      setTimeout(() => setShake(null), 500);
    }
  };

  const nextLevel = () => {
    if (currentLevel < LEVELS.length - 1) {
      setCurrentLevel(currentLevel + 1);
    } else {
      navigate('/zone-a');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-orange-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/zone-a')}
          className="flex items-center gap-2 text-orange-700"
        >
          <ArrowRight size={24} />
          <span className="font-bold">חזרה</span>
        </button>
        <h1 className="text-2xl font-bold text-orange-800">🧩 המסדר הקטן</h1>
        <button onClick={resetLevel} className="p-2 rounded-full bg-white/50">
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="text-center mb-6">
        <p className="text-xl font-bold text-orange-700">שלב {currentLevel + 1}: {level.name}</p>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
          {level.categories.map(category => (
            <DropZone key={category.id} category={category}>
              {sortedItems[category.id]?.map(item => (
                <span key={item.id} className="text-4xl">{item.emoji}</span>
              ))}
            </DropZone>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {items.filter(item => !Object.values(sortedItems).flat().find(s => s.id === item.id)).map(item => (
            <motion.div
              key={item.id}
              animate={shake === item.id ? { x: [-10, 10, -10, 10, 0] } : {}}
            >
              <DraggableItem item={item} sorted={false} />
            </motion.div>
          ))}
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
              <h2 className="text-3xl font-bold mb-2">כל הכבוד!</h2>
              <p className="text-xl text-gray-600 mb-6">+50 XP</p>
              <Button variant="zone-a" size="lg" onClick={nextLevel}>
                {currentLevel < LEVELS.length - 1 ? 'שלב הבא' : 'סיום'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
