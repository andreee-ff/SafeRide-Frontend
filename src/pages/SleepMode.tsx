import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Star, Coffee } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const wishes = [
  "Пусть сны будут яркими, как твой код!",
  "Завтра будет новый день и новые успешные коммиты.",
  "Отдыхай, сервер тоже заслужил перезагрузку.",
  "Баги не пройдут, пока ты восстанавливаешь силы.",
  "Твоя энергия восстановится на 100%.",
  "Пусть приснится идеальная архитектура без легаси.",
  "Спокойной ночи! Завтра продолжим кодить будущее.",
  "Спи крепко, деплой прошел успешно (в твоих снах).",
  "Звезды светят для тех, кто не боится рефакторинга."
];

const SleepMode: React.FC = () => {
  const navigate = useNavigate();
  const [wish, setWish] = useState("");

  useEffect(() => {
    // Pick random wish on mount
    const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
    setWish(randomWish);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#020617] flex flex-col items-center justify-center relative overflow-hidden text-white font-sans">
      
      {/* Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-70 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            initial={{ opacity: 0.2, scale: 0.5 }}
            animate={{ 
              opacity: [0.2, 0.8, 0.2], 
              scale: [0.5, 1.2, 0.5] 
            }}
            transition={{
              duration: 2 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
            }}
          />
        ))}
      </div>

      {/* Moon */}
      <motion.div 
        initial={{ rotate: -10, scale: 0.9 }}
        animate={{ rotate: 10, scale: 1.1 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="relative z-10 mb-12 drop-shadow-[0_0_60px_rgba(139,92,246,0.4)]"
      >
        <Moon size={140} className="text-violet-200 fill-violet-100/10" strokeWidth={1} />
        
        {/* Sleeping Zzz */}
        <motion.div 
           className="absolute -top-6 -right-10 text-violet-300 font-serif text-5xl select-none"
           initial={{ opacity: 0, y: 10, x: -10 }}
           animate={{ opacity: [0, 1, 0], y: -40, x: 30 }}
           transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        >
          Z
        </motion.div>
        <motion.div 
           className="absolute -top-16 -right-2 text-violet-300 font-serif text-3xl select-none"
           initial={{ opacity: 0, y: 10, x: -10 }}
           animate={{ opacity: [0, 1, 0], y: -40, x: 30 }}
           transition={{ duration: 3, repeat: Infinity, delay: 1.8 }}
        >
          z
        </motion.div>
      </motion.div>

      {/* Main Message */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="z-10 text-center px-6 max-w-2xl"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-violet-200 via-white to-purple-200 drop-shadow-sm select-none">
          Спокойной ночи!
        </h1>
        
        <div className="relative">
             <motion.p 
                key={wish}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xl md:text-3xl text-indigo-100 font-light leading-relaxed italic"
             >
              "{wish}"
            </motion.p>
            <div className="absolute -inset-4 bg-indigo-500/10 blur-xl -z-10 rounded-full"></div>
        </div>
      </motion.div>

      {/* Button to refresh wish */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-12 z-10 flex gap-4"
      >
          <Button 
            variant="ghost" 
            onClick={() => {
                const newWish = wishes[Math.floor(Math.random() * wishes.length)];
                setWish(newWish);
            }}
            className="text-indigo-300 hover:text-white hover:bg-white/10 border border-white/5 rounded-full px-6 transition-all"
        >
            ✨ Еще пожелание
        </Button>

        <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="text-indigo-400/50 hover:text-indigo-200 hover:bg-transparent transition-all text-sm"
        >
            Вернуться в реальность
        </Button>
      </motion.div>

    </div>
  );
};

export default SleepMode;
