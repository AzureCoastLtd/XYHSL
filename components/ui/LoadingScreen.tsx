import React from 'react';
import { useProgress } from '@react-three/drei';

export default function LoadingScreen() {
  const { progress } = useProgress();

  return (
    <div className={`absolute inset-0 z-50 flex items-center justify-center bg-[#050103] transition-opacity duration-500 ${progress === 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-pink-500 mb-4">Loading Magic...</h2>
        <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-pink-300 mt-2">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
