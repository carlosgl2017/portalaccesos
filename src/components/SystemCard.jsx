import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const SystemCard = ({ title, description, icon: Icon, url, color, image_filename }) => {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={description}
      className="group relative flex items-center gap-3 p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r ${color}`} />

      {/* Icon or Image Container */}
      <div className={`relative flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-br ${color} shadow-lg shadow-black/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden`}>
        {image_filename ? (
          <img 
            src={`/system-images/${image_filename}`} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white group-hover:text-white/100 transition-colors truncate">
            {title}
          </h3>
          <ArrowUpRight className="w-3 h-3 text-white/30 group-hover:text-white/80 transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 duration-300" />
        </div>
        <p className="text-[10px] text-white/40 truncate group-hover:text-white/60 transition-colors mt-0.5">
          {description}
        </p>
      </div>
    </motion.a>
  );
};

export default SystemCard;