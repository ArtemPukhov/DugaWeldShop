'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasToken } from '@/lib/api';
import AdminTopBar from '@/components/AdminTopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Eye, RotateCcw } from 'lucide-react';

export default function HeroAdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  
  const [heroData, setHeroData] = useState({
    title: 'DugaWeld',
    slogan: 'Профессиональное сварочное оборудование для мастеров своего дела',
    showAdvantages: true,
    advantage1: {
      icon: '⚡',
      title: 'Быстрая доставка',
      description: 'По всей России за 1-3 дня'
    },
    advantage2: {
      icon: '🛡️',
      title: 'Гарантия качества',
      description: 'Официальная гарантия на все товары'
    },
    advantage3: {
      icon: '🔧',
      title: 'Техподдержка',
      description: 'Помощь в выборе и настройке'
    }
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!hasToken()) {
      router.replace('/admin/login');
      return;
    }
    setReady(true);
    
    // Загружаем сохраненные настройки
    loadSettings();
  }, [router]);

  const loadSettings = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hero-settings');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setHeroData(prev => ({ ...prev, ...data }));
        } catch (e) {
          console.error('Ошибка загрузки настроек:', e);
        }
      }
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hero-settings', JSON.stringify(heroData));
      }
      alert('Настройки сохранены!');
    } catch (e) {
      console.error('Ошибка сохранения:', e);
      alert('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    if (confirm('Сбросить настройки к значениям по умолчанию?')) {
      setHeroData({
        title: 'DugaWeld',
        slogan: 'Профессиональное сварочное оборудование для мастеров своего дела',
        showAdvantages: true,
        advantage1: {
          icon: '⚡',
          title: 'Быстрая доставка',
          description: 'По всей России за 1-3 дня'
        },
        advantage2: {
          icon: '🛡️',
          title: 'Гарантия качества',
          description: 'Официальная гарантия на все товары'
        },
        advantage3: {
          icon: '🔧',
          title: 'Техподдержка',
          description: 'Помощь в выборе и настройке'
        }
      });
    }
  };

  if (!ready) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminTopBar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Настройки главной страницы
          </h1>
          <p className="text-gray-600">
            Управляйте заголовком, слоганом и преимуществами на главной странице
          </p>
        </div>

        <div className="space-y-6">
          {/* Основные настройки */}
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Заголовок компании</Label>
                <Input
                  id="title"
                  value={heroData.title}
                  onChange={(e) => setHeroData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="DugaWeld"
                />
              </div>
              
              <div>
                <Label htmlFor="slogan">Слоган</Label>
                <Textarea
                  id="slogan"
                  value={heroData.slogan}
                  onChange={(e) => setHeroData(prev => ({ ...prev, slogan: e.target.value }))}
                  placeholder="Профессиональное сварочное оборудование для мастеров своего дела"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={heroData.showAdvantages}
                  onCheckedChange={(checked) => setHeroData(prev => ({ ...prev, showAdvantages: checked }))}
                />
                <Label>Показывать блок преимуществ</Label>
              </div>
            </CardContent>
          </Card>

          {/* Преимущества */}
          {heroData.showAdvantages && (
            <Card>
              <CardHeader>
                <CardTitle>Преимущества компании</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Преимущество 1 */}
                  <div className="space-y-3">
                    <Label>Преимущество 1</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="⚡"
                        value={heroData.advantage1.icon}
                        onChange={(e) => setHeroData(prev => ({ 
                          ...prev, 
                          advantage1: { ...prev.advantage1, icon: e.target.value }
                        }))}
                        className="w-16"
                      />
                      <Input
                        placeholder="Заголовок"
                        value={heroData.advantage1.title}
                        onChange={(e) => setHeroData(prev => ({ 
                          ...prev, 
                          advantage1: { ...prev.advantage1, title: e.target.value }
                        }))}
                      />
                      <Input
                        placeholder="Описание"
                        value={heroData.advantage1.description}
                        onChange={(e) => setHeroData(prev => ({ 
                          ...prev, 
                          advantage1: { ...prev.advantage1, description: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  {/* Преимущество 2 */}
                  <div className="space-y-3">
                    <Label>Преимущество 2</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="🛡️"
                        value={heroData.advantage2.icon}
                        onChange={(e) => setHeroData(prev => ({ 
                          ...prev, 
                          advantage2: { ...prev.advantage2, icon: e.target.value }
                        }))}
                        className="w-16"
                      />
                      <Input
                        placeholder="Заголовок"
                        value={heroData.advantage2.title}
                        onChange={(e) => setHeroData(prev => ({ 
                          ...prev, 
                          advantage2: { ...prev.advantage2, title: e.target.value }
                        }))}
                      />
                      <Input
                        placeholder="Описание"
                        value={heroData.advantage2.description}
                        onChange={(e) => setHeroData(prev => ({ 
                          ...prev, 
                          advantage2: { ...prev.advantage2, description: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  {/* Преимущество 3 */}
                  <div className="space-y-3">
                    <Label>Преимущество 3</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="🔧"
                        value={heroData.advantage3.icon}
                        onChange={(e) => setHeroData(prev => ({ 
                          ...prev, 
                          advantage3: { ...prev.advantage3, icon: e.target.value }
                        }))}
                        className="w-16"
                      />
                      <Input
                        placeholder="Заголовок"
                        value={heroData.advantage3.title}
                        onChange={(e) => setHeroData(prev => ({ 
                          ...prev, 
                          advantage3: { ...prev.advantage3, title: e.target.value }
                        }))}
                      />
                      <Input
                        placeholder="Описание"
                        value={heroData.advantage3.description}
                        onChange={(e) => setHeroData(prev => ({ 
                          ...prev, 
                          advantage3: { ...prev.advantage3, description: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Предварительный просмотр */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Предварительный просмотр</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 rounded-lg">
                <div className="text-center">
                  <h1 className="text-2xl md:text-3xl font-bold mb-3">
                    {heroData.title}
                  </h1>
                  <p className="text-base md:text-lg font-light mb-4 text-blue-100">
                    {heroData.slogan}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2 justify-center items-center mb-4">
                    <button className="bg-yellow-500 text-black font-bold px-4 py-2 rounded text-sm">
                      Перейти в каталог
                    </button>
                    <button className="border border-white text-white font-semibold px-4 py-2 rounded text-sm">
                      Связаться с нами
                    </button>
                  </div>
                  
                  {heroData.showAdvantages && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-3 border-t border-blue-700">
                      <div className="text-center">
                        <div className="text-lg mb-1">{heroData.advantage1.icon}</div>
                        <h3 className="text-sm font-semibold mb-1">{heroData.advantage1.title}</h3>
                        <p className="text-blue-200 text-xs">{heroData.advantage1.description}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg mb-1">{heroData.advantage2.icon}</div>
                        <h3 className="text-sm font-semibold mb-1">{heroData.advantage2.title}</h3>
                        <p className="text-blue-200 text-xs">{heroData.advantage2.description}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg mb-1">{heroData.advantage3.icon}</div>
                        <h3 className="text-sm font-semibold mb-1">{heroData.advantage3.title}</h3>
                        <p className="text-blue-200 text-xs">{heroData.advantage3.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Кнопки управления */}
          <div className="flex justify-between">
            <Button
              onClick={resetSettings}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Сбросить</span>
            </Button>
            
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Сохраняю...' : 'Сохранить'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
