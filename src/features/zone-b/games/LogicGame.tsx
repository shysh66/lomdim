import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui';
import { getRandomInt, shuffleArray } from '@/lib/utils';

type GameMode = 'alligator' | 'sequence';

interface AlligatorQuestion {
  num1: number;
  num2: number;
  answer: '<' | '>' | '=';
}

interface SequenceQuestion {
  sequence: number[];
  answer: number;
  options: number[];
}

const generateAlligatorQuestion = (): AlligatorQuestion => {
  const num1 = getRandomInt(1, 20);
  const num2 = getRandomInt(1, 20);
  let answer: '<' | '>' | '=';
  if (num1 < num2) answer = '<';
  else if (num1 > num2) answer = '>';
  else answer = '=';
  return { num1, num2, answer };
};

const generateSequenceQuestion = (): SequenceQuestion => {
  const patterns = [
    { start: getRandomInt(1, 5), step: 1 },
    { start: getRandomInt(0, 5), step: 2 },
    { start: getRandomInt(0, 3), step: 3 },
    { start: getRandomInt(1, 5), step: 5 },
    { start: getRandomInt(0, 3), step: 10 },
  ];
  const pattern = patterns[getRandomInt(0, patterns.length - 1)];
  const sequence = [];
  for (let i = 0; i < 4; i++) {
    sequence.push(pattern.start + pattern.step * i);
  }
  const answer = pattern.start + pattern.step * 4;
  
  const wrongOptions = new Set<number>();
  while (wrongOptions.size < 3) {
    const offset = getRandomInt(-3, 3) * pattern.step;
    const wrong = answer + offset;
    if (wrong !== answer && wrong >= 0) wrongOptions.add(wrong);
  }
  
  return {
    sequence,
    answer,
    options: shuffleArray([answer, ...wrongOptions]),
  };
};

export const LogicGame = () => {
  const navigate = useNavigate();
  const { addXP } = useGame();
  const [mode, setMode] = useState<GameMode | null>(null);
  const [alligatorQ, setAlligatorQ] = useState<AlligatorQuestion | null>(null);
  const [sequenceQ, setSequenceQ] = useState<SequenceQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    if (mode === 'alligator') {
      newAlligatorQuestion();
    } else if (mode === 'sequence') {
      newSequenceQuestion();
    }
  }, [mode]);

  const newAlligatorQuestion = () => {
    setAlligatorQ(generateAlligatorQuestion());
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const newSequenceQuestion = () => {
    setSequenceQ(generateSequenceQuestion());
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleAlligatorAnswer = (answer: '<' | '>' | '=') => {
    if (!alligatorQ || selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const correct = answer === alligatorQ.answer;
    setIsCorrect(correct);

    if (correct) {
      addXP(15, 'logic', true);
      setScore(score + 15);
      setTimeout(newAlligatorQuestion, 1000);
    } else {
      addXP(0, 'logic', false);
      setTimeout(newAlligatorQuestion, 1500);
    }
  };

  const handleSequenceAnswer = (answer: number) => {
    if (!sequenceQ || selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const correct = answer === sequenceQ.answer;
    setIsCorrect(correct);

    if (correct) {
      addXP(20, 'logic', true);
      setScore(score + 20);
      setTimeout(newSequenceQuestion, 1000);
    } else {
      addXP(0, 'logic', false);
      setTimeout(newSequenceQuestion, 1500);
    }
  };

  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/zone-b')}
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowRight size={24} />
            <span className="font-bold">חזרה</span>
          </button>
          <h1 className="text-2xl font-bold text-white">🧠 חשיבה</h1>
        </div>

        <div className="max-w-md mx-auto mt-12 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              variant="zone-b"
              size="xl"
              className="w-full"
              onClick={() => setMode('alligator')}
            >
              <span className="text-4xl ml-4">🐊</span>
              התנין הרעב
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              variant="zone-b"
              size="xl"
              className="w-full"
              onClick={() => setMode('sequence')}
            >
              <span className="text-4xl ml-4">🚂</span>
              רכבת המספרים
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setMode(null)}
          className="flex items-center gap-2 text-white/80 hover:text-white"
        >
          <ArrowRight size={24} />
          <span className="font-bold">חזרה</span>
        </button>
        <h1 className="text-2xl font-bold text-white">
          {mode === 'alligator' ? '🐊 התנין הרעב' : '🚂 רכבת המספרים'}
        </h1>
        <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
          <Zap className="text-yellow-400" size={20} />
          <span className="font-bold text-white">{score}</span>
        </div>
      </div>

      {mode === 'alligator' && alligatorQ && (
        <motion.div
          key={`${alligatorQ.num1}-${alligatorQ.num2}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 mb-6 text-center">
            <p className="text-white/60 mb-4">התנין אוכל את המספר הגדול יותר!</p>
            <div className="flex items-center justify-center gap-6">
              <span className="text-6xl font-bold text-white">{alligatorQ.num1}</span>
              <span className="text-4xl">❓</span>
              <span className="text-6xl font-bold text-white">{alligatorQ.num2}</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            {(['<', '=', '>'] as const).map((op) => {
              const isSelected = selectedAnswer === op;
              const showCorrect = isCorrect !== null && op === alligatorQ.answer;
              const showWrong = isSelected && !isCorrect;

              return (
                <motion.button
                  key={op}
                  whileHover={selectedAnswer === null ? { scale: 1.1 } : undefined}
                  whileTap={selectedAnswer === null ? { scale: 0.95 } : undefined}
                  onClick={() => handleAlligatorAnswer(op)}
                  disabled={selectedAnswer !== null}
                  className={`w-24 h-24 rounded-2xl text-5xl font-bold transition-all
                    ${showCorrect ? 'bg-green-500 text-white' : ''}
                    ${showWrong ? 'bg-red-500 text-white' : ''}
                    ${!showCorrect && !showWrong ? 'bg-white/20 text-white hover:bg-white/30' : ''}
                  `}
                >
                  {op === '<' ? '🐊<' : op === '>' ? '>🐊' : '='}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {mode === 'sequence' && sequenceQ && (
        <motion.div
          key={sequenceQ.sequence.join('-')}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto"
        >
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 mb-6">
            <p className="text-white/60 mb-4 text-center">מה המספר הבא בסדרה?</p>
            <div className="flex items-center justify-center gap-2">
              {sequenceQ.sequence.map((num, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
                >
                  <span className="text-2xl font-bold text-white">{num}</span>
                </motion.div>
              ))}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="w-16 h-16 border-4 border-dashed border-white/50 rounded-xl flex items-center justify-center"
              >
                <span className="text-3xl text-white/50">?</span>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {sequenceQ.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const showCorrect = isCorrect !== null && option === sequenceQ.answer;
              const showWrong = isSelected && !isCorrect;

              return (
                <motion.button
                  key={option}
                  whileHover={selectedAnswer === null ? { scale: 1.05 } : undefined}
                  whileTap={selectedAnswer === null ? { scale: 0.95 } : undefined}
                  onClick={() => handleSequenceAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={`py-6 rounded-2xl text-3xl font-bold transition-all
                    ${showCorrect ? 'bg-green-500 text-white' : ''}
                    ${showWrong ? 'bg-red-500 text-white' : ''}
                    ${!showCorrect && !showWrong ? 'bg-white/20 text-white hover:bg-white/30' : ''}
                  `}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isCorrect && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl pointer-events-none"
          >
            🎉
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
