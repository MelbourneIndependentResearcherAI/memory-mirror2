import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Volume2, RefreshCw, Star } from 'lucide-react';
import { speakWithRealisticVoice } from '@/components/memory-mirror/voiceUtils';
import { base44 } from '@/api/base44Client';

// ─── Dementia-friendly categories ──────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'animals',
    label: '🐾 Animals',
    color: 'from-green-500 to-teal-500',
    items: [
      { word: 'Dog', emoji: '🐶' },
      { word: 'Cat', emoji: '🐱' },
      { word: 'Bird', emoji: '🐦' },
      { word: 'Cow', emoji: '🐮' },
      { word: 'Horse', emoji: '🐴' },
      { word: 'Sheep', emoji: '🐑' },
      { word: 'Pig', emoji: '🐷' },
      { word: 'Duck', emoji: '🦆' },
      { word: 'Fish', emoji: '🐟' },
      { word: 'Rabbit', emoji: '🐰' },
      { word: 'Hen', emoji: '🐔' },
      { word: 'Frog', emoji: '🐸' },
    ],
  },
  {
    id: 'colours',
    label: '🎨 Colours',
    color: 'from-pink-500 to-rose-500',
    items: [
      { word: 'Red', emoji: '🔴' },
      { word: 'Blue', emoji: '🔵' },
      { word: 'Yellow', emoji: '🟡' },
      { word: 'Green', emoji: '🟢' },
      { word: 'Orange', emoji: '🟠' },
      { word: 'Purple', emoji: '🟣' },
      { word: 'Pink', emoji: '🌸' },
      { word: 'White', emoji: '⬜' },
      { word: 'Brown', emoji: '🟤' },
      { word: 'Black', emoji: '⬛' },
      { word: 'Gold', emoji: '🌟' },
      { word: 'Silver', emoji: '✨' },
    ],
  },
  {
    id: 'food',
    label: '🍎 Food',
    color: 'from-orange-500 to-amber-500',
    items: [
      { word: 'Apple', emoji: '🍎' },
      { word: 'Bread', emoji: '🍞' },
      { word: 'Cake', emoji: '🎂' },
      { word: 'Banana', emoji: '🍌' },
      { word: 'Pie', emoji: '🥧' },
      { word: 'Soup', emoji: '🍲' },
      { word: 'Tea', emoji: '🍵' },
      { word: 'Egg', emoji: '🥚' },
      { word: 'Biscuit', emoji: '🍪' },
      { word: 'Cheese', emoji: '🧀' },
      { word: 'Carrot', emoji: '🥕' },
      { word: 'Ice Cream', emoji: '🍦' },
    ],
  },
  {
    id: 'seasons',
    label: '🌸 Seasons & Nature',
    color: 'from-blue-500 to-cyan-500',
    items: [
      { word: 'Sun', emoji: '☀️' },
      { word: 'Rain', emoji: '🌧️' },
      { word: 'Snow', emoji: '❄️' },
      { word: 'Wind', emoji: '💨' },
      { word: 'Flower', emoji: '🌸' },
      { word: 'Tree', emoji: '🌳' },
      { word: 'Rainbow', emoji: '🌈' },
      { word: 'Moon', emoji: '🌙' },
      { word: 'Star', emoji: '⭐' },
      { word: 'Cloud', emoji: '☁️' },
      { word: 'Leaf', emoji: '🍂' },
      { word: 'Butterfly', emoji: '🦋' },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function checkBingo(marked, size = 3) {
  const total = size * size;
  // rows
  for (let r = 0; r < size; r++) {
    if (Array.from({ length: size }, (_, c) => r * size + c).every(i => marked.has(i))) return true;
  }
  // cols
  for (let c = 0; c < size; c++) {
    if (Array.from({ length: size }, (_, r) => r * size + c).every(i => marked.has(i))) return true;
  }
  // diagonals
  if (Array.from({ length: size }, (_, i) => i * size + i).every(i => marked.has(i))) return true;
  if (Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)).every(i => marked.has(i))) return true;
  return false;
}

// ─── Free Space Cell ────────────────────────────────────────────────────────
const FREE_CELL = { word: 'FREE', emoji: '⭐', isFree: true };

// ─── Category Picker ────────────────────────────────────────────────────────
function CategoryPicker({ onSelect }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🎰</div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Memory Bingo!</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">Choose a category to play</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CATEGORIES.map(cat => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelect(cat)}
            className={`bg-gradient-to-br ${cat.color} text-white rounded-2xl p-6 shadow-xl flex flex-col items-center gap-3 min-h-[120px] text-2xl font-bold`}
          >
            {cat.label}
            <span className="text-sm font-normal opacity-90">Tap to play</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Bingo Card Cell ────────────────────────────────────────────────────────
function BingoCell({ item, index, isMarked, isNew, onClick, disabled }) {
  return (
    <motion.button
      key={`${index}-${isMarked}`}
      onClick={() => !disabled && onClick(index)}
      disabled={disabled || item.isFree}
      whileTap={!disabled && !item.isFree ? { scale: 0.93 } : {}}
      className={`
        relative rounded-2xl flex flex-col items-center justify-center gap-1 aspect-square border-4 transition-all duration-200 select-none
        ${item.isFree
          ? 'bg-yellow-400 border-yellow-300 cursor-default shadow-lg'
          : isMarked
            ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-300 shadow-xl'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer hover:shadow-lg'
        }
      `}
    >
      {isNew && isMarked && (
        <motion.div
          initial={{ scale: 2, opacity: 1 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-green-300 rounded-2xl"
        />
      )}
      <span className={`text-2xl sm:text-3xl ${isMarked && !item.isFree ? 'grayscale-0' : ''}`}>
        {item.emoji}
      </span>
      <span className={`text-xs sm:text-sm font-bold text-center leading-tight px-1 ${isMarked ? 'text-white' : 'text-slate-700 dark:text-slate-200'} ${item.isFree ? 'text-yellow-900' : ''}`}>
        {item.word}
      </span>
      {isMarked && !item.isFree && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center"
        >
          <span className="text-green-500 text-xs font-bold">✓</span>
        </motion.div>
      )}
    </motion.button>
  );
}

// ─── Caller Panel ────────────────────────────────────────────────────────────
function CallerPanel({ currentCall, onCallNext, isAutoMode, calledItems, totalItems, isFinished }) {
  const handleSpeak = () => {
    if (currentCall) speakWithRealisticVoice(`${currentCall.word}! ${currentCall.word}!`);
  };

  return (
    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 text-white shadow-xl">
      <p className="text-sm font-semibold opacity-80 mb-2 text-center uppercase tracking-wide">Called Number</p>
      {currentCall ? (
        <div className="text-center">
          <div className="text-5xl mb-1">{currentCall.emoji}</div>
          <div className="text-2xl font-bold">{currentCall.word}</div>
        </div>
      ) : (
        <div className="text-center text-4xl opacity-40 py-2">—</div>
      )}
      <div className="mt-3 flex gap-2 justify-center">
        <Button
          onClick={onCallNext}
          disabled={isFinished || calledItems.length >= totalItems}
          className="bg-white text-purple-700 hover:bg-purple-50 font-bold min-h-[48px] px-5 rounded-xl flex-1"
        >
          {calledItems.length === 0 ? '▶ Start!' : '▶ Next'}
        </Button>
        {currentCall && (
          <Button
            onClick={handleSpeak}
            variant="outline"
            className="border-white text-white hover:bg-white/20 min-h-[48px] px-3 rounded-xl"
          >
            <Volume2 className="w-5 h-5" />
          </Button>
        )}
      </div>
      <p className="text-xs text-center opacity-70 mt-2">
        {calledItems.length} of {totalItems} called
      </p>
    </div>
  );
}

// ─── Called Items History ────────────────────────────────────────────────────
function CalledHistory({ calledItems }) {
  if (calledItems.length === 0) return null;
  return (
    <div className="bg-white/60 dark:bg-slate-800/60 rounded-2xl p-3">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Called so far:</p>
      <div className="flex flex-wrap gap-1.5">
        {calledItems.map((item, i) => (
          <span key={i} className="text-lg" title={item.word}>{item.emoji}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Win Celebration ────────────────────────────────────────────────────────
function WinCelebration({ onPlayAgain, onChangeCategory }) {
  useEffect(() => {
    speakWithRealisticVoice("BINGO! You did it! Wonderful job! You are absolutely brilliant!");
    base44.entities.ActivityLog.create({
      activity_type: 'game_played',
      details: { game: 'bingo', result: 'bingo_win', timestamp: new Date().toISOString() }
    }).catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
    >
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full">
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: 2 }}
          className="text-8xl mb-4"
        >
          🏆
        </motion.div>
        <h2 className="text-4xl font-black text-white mb-2 drop-shadow">BINGO!</h2>
        <p className="text-xl text-yellow-100 mb-1 font-semibold">You did it!</p>
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {['⭐', '🎉', '🌟', '🎊', '✨'].map((e, i) => (
            <motion.span key={i} className="text-3xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ delay: i * 0.1, repeat: Infinity, duration: 1 }}
            >{e}</motion.span>
          ))}
        </div>
        <div className="space-y-3">
          <Button
            onClick={onPlayAgain}
            className="w-full bg-white text-orange-600 hover:bg-orange-50 font-bold min-h-[56px] rounded-2xl text-lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Play Again!
          </Button>
          <Button
            onClick={onChangeCategory}
            variant="outline"
            className="w-full border-white text-white hover:bg-white/20 min-h-[56px] rounded-2xl text-lg"
          >
            Change Category
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Bingo Board ────────────────────────────────────────────────────────
function BingoBoard({ category, onChangeCategory }) {
  const GRID_SIZE = 3; // 3×3 = 9 cells, free centre = 8 unique items needed
  const NEEDED = GRID_SIZE * GRID_SIZE - 1;

  const buildCard = useCallback(() => {
    const picks = shuffle(category.items).slice(0, NEEDED);
    const cells = [...picks];
    // Insert FREE in centre (index 4 for 3×3)
    cells.splice(Math.floor(NEEDED / 2), 0, FREE_CELL);
    return cells;
  }, [category]);

  const buildPool = useCallback(() => {
    // Call pool = items NOT on player card (from same category shuffled)
    return shuffle(category.items);
  }, [category]);

  const [card, setCard] = useState(buildCard);
  const [pool, setPool] = useState(buildPool);
  const [calledItems, setCalledItems] = useState([]);
  const [currentCall, setCurrentCall] = useState(null);
  const [marked, setMarked] = useState(new Set([Math.floor(NEEDED / 2)])); // free centre pre-marked
  const [lastMarked, setLastMarked] = useState(null);
  const [hasBingo, setHasBingo] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [poolIndex, setPoolIndex] = useState(0);

  const callNext = () => {
    if (poolIndex >= pool.length) return;
    const item = pool[poolIndex];
    setCurrentCall(item);
    setCalledItems(prev => [...prev, item]);
    setPoolIndex(prev => prev + 1);
    speakWithRealisticVoice(`${item.word}!`);
  };

  const markCell = (index) => {
    if (marked.has(index)) return;
    const cellItem = card[index];
    // Only allow marking if this item has been called
    const isCalled = calledItems.some(c => c.word === cellItem.word);
    if (!isCalled) {
      speakWithRealisticVoice("That one hasn't been called yet! Listen carefully.");
      return;
    }
    const newMarked = new Set(marked);
    newMarked.add(index);
    setMarked(newMarked);
    setLastMarked(index);
    speakWithRealisticVoice(`Well done! ${cellItem.word} marked!`);

    if (checkBingo(newMarked, GRID_SIZE)) {
      setHasBingo(true);
      setTimeout(() => setShowWin(true), 400);
    }
  };

  const resetGame = () => {
    const newCard = buildCard();
    const newPool = buildPool();
    setCard(newCard);
    setPool(newPool);
    setPoolIndex(0);
    setCalledItems([]);
    setCurrentCall(null);
    setMarked(new Set([Math.floor(NEEDED / 2)]));
    setLastMarked(null);
    setHasBingo(false);
    setShowWin(false);
  };

  const isFinished = poolIndex >= pool.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Memory Bingo</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{category.label}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetGame} className="min-h-[44px] rounded-xl">
            <RefreshCw className="w-4 h-4 mr-1" /> New Card
          </Button>
          <Button variant="ghost" onClick={onChangeCategory} className="min-h-[44px] rounded-xl text-slate-500">
            Change
          </Button>
        </div>
      </div>

      {/* Caller */}
      <CallerPanel
        currentCall={currentCall}
        onCallNext={callNext}
        calledItems={calledItems}
        totalItems={pool.length}
        isFinished={isFinished || hasBingo}
      />

      {/* How to play tip */}
      {calledItems.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/40 rounded-2xl p-4 text-sm text-blue-800 dark:text-blue-300 text-center border border-blue-200 dark:border-blue-800">
          <p className="font-bold mb-1">How to Play 🎯</p>
          <p>Press <strong>Start!</strong> to hear a word called out.<br />
          Find it on your card and tap it to mark it.<br />
          Get 3 in a row to win — <strong>BINGO!</strong> 🏆</p>
        </div>
      )}

      {/* Bingo Grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
      >
        {card.map((item, i) => (
          <BingoCell
            key={i}
            index={i}
            item={item}
            isMarked={marked.has(i)}
            isNew={lastMarked === i}
            onClick={markCell}
            disabled={hasBingo}
          />
        ))}
      </div>

      {/* Called history */}
      <CalledHistory calledItems={calledItems} />

      {/* Progress */}
      {!hasBingo && marked.size > 1 && (
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
          <Star className="w-4 h-4 text-yellow-400" />
          {marked.size - 1} square{marked.size !== 2 ? 's' : ''} marked — keep going!
        </div>
      )}

      {/* Win overlay */}
      <AnimatePresence>
        {showWin && (
          <WinCelebration
            onPlayAgain={resetGame}
            onChangeCategory={onChangeCategory}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────────
export default function BingoGame() {
  const [category, setCategory] = useState(null);

  return (
    <div className="max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {!category ? (
          <motion.div
            key="picker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <CategoryPicker onSelect={setCategory} />
          </motion.div>
        ) : (
          <motion.div
            key="board"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <BingoBoard category={category} onChangeCategory={() => setCategory(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}