import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils';

interface CardProps extends HTMLMotionProps<"div"> {
  variant?: 'glass' | 'white' | 'flat';
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  className,
  variant = 'white',
  noPadding = false,
  children,
  ...props
}) => {
  const variants = {
    glass: 'glass',
    white: 'bg-white/80 backdrop-blur-md border border-white/40 shadow-xl shadow-slate-200/50',
    flat: 'bg-white border border-gray-100 shadow-sm',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'rounded-2xl overflow-hidden',
        variants[variant],
        !noPadding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
