'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HeroSectionProps {
  title?: string;
  slogan?: string;
  showAdvantages?: boolean;
}

export default function HeroSection({ 
  title = "DugaWeld",
  slogan = "Профессиональное сварочное оборудование для мастеров своего дела",
  showAdvantages = true
}: HeroSectionProps) {
  const [heroData, setHeroData] = useState({
    title,
    slogan,
    showAdvantages
  });

  // Загружаем настройки из localStorage (можно заменить на API)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hero-settings');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setHeroData(prev => ({ ...prev, ...data }));
        } catch (e) {
          console.error('Ошибка загрузки настроек hero:', e);
        }
      }
    }
  }, []);

  // Обновляем данные при изменении localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('hero-settings');
        if (stored) {
          try {
            const data = JSON.parse(stored);
            setHeroData(prev => ({ ...prev, ...data }));
          } catch (e) {
            console.error('Ошибка загрузки настроек hero:', e);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          {heroData.title}
        </h1>
        <p className="text-xl md:text-2xl lg:text-3xl font-light mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
          {heroData.slogan}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/catalog"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Перейти в каталог
          </Link>
          <Link 
            href="/contacts"
            className="border-2 border-white hover:bg-white hover:text-blue-900 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 hover:scale-105"
          >
            Связаться с нами
          </Link>
        </div>
        
        {/* Дополнительные преимущества */}
        {heroData.showAdvantages && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-8 border-t border-blue-700">
            <div className="text-center">
              <div className="text-3xl mb-3">{heroData.advantage1?.icon || '⚡'}</div>
              <h3 className="text-lg font-semibold mb-2">{heroData.advantage1?.title || 'Быстрая доставка'}</h3>
              <p className="text-blue-200 text-sm">{heroData.advantage1?.description || 'По всей России за 1-3 дня'}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">{heroData.advantage2?.icon || '🛡️'}</div>
              <h3 className="text-lg font-semibold mb-2">{heroData.advantage2?.title || 'Гарантия качества'}</h3>
              <p className="text-blue-200 text-sm">{heroData.advantage2?.description || 'Официальная гарантия на все товары'}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">{heroData.advantage3?.icon || '🔧'}</div>
              <h3 className="text-lg font-semibold mb-2">{heroData.advantage3?.title || 'Техподдержка'}</h3>
              <p className="text-blue-200 text-sm">{heroData.advantage3?.description || 'Помощь в выборе и настройке'}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
