import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Заголовок */}
      <section className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">О компании</h1>
          <p className="text-xl">DugaWeld - ваш надежный партнер в мире сварочного оборудования</p>
        </div>
      </section>

      {/* Основной контент */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-6 py-12">
        {/* О компании */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Кто мы такие</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>DugaWeld</strong> - ведущий поставщик профессионального сварочного оборудования
                и расходных материалов в России. Мы работаем на рынке с 2010 года и за это время
                заслужили доверие тысяч клиентов по всей стране.
              </p>
              <p>
                Наша миссия - обеспечивать профессионалов и любителей качественным, надежным
                и современным сварочным оборудованием по доступным ценам.
              </p>
              <p>
                Мы сотрудничаем с ведущими мировыми производителями и предлагаем только
                сертифицированную продукцию с гарантией качества.
              </p>
            </div>
          </div>
          <div className="bg-gray-200 rounded-2xl h-80 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9m0 12h4m-4 0V9m4 0h2m-2 0V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v4" />
              </svg>
              <p>Фото нашего производства</p>
            </div>
          </div>
        </div>

        {/* Преимущества */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Наши преимущества</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 text-center shadow-md">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Качество</h3>
              <p className="text-gray-600 text-sm">Только сертифицированное оборудование от проверенных производителей</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-md">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Цены</h3>
              <p className="text-gray-600 text-sm">Конкурентные цены и гибкая система скидок для постоянных клиентов</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-md">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Доставка</h3>
              <p className="text-gray-600 text-sm">Быстрая доставка по всей России и СНГ в кратчайшие сроки</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-md">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Поддержка</h3>
              <p className="text-gray-600 text-sm">Профессиональные консультации и техническая поддержка 24/7</p>
            </div>
          </div>
        </div>

        {/* История компании */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Наша история</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">2010</div>
              <h3 className="font-semibold mb-2">Основание</h3>
              <p className="text-gray-600">Начали работу как небольшой магазин сварочного оборудования</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">2015</div>
              <h3 className="font-semibold mb-2">Рост</h3>
              <p className="text-gray-600">Расширили ассортимент и начали работать по всей России</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">2023</div>
              <h3 className="font-semibold mb-2">Лидерство</h3>
              <p className="text-gray-600">Стали одним из ведущих поставщиков сварочного оборудования</p>
            </div>
          </div>
        </div>

        {/* Партнеры */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Наши партнеры</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="bg-white rounded-2xl p-6 flex items-center justify-center shadow-md h-32">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9m0 12h4m-4 0V9m4 0h2m-2 0V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v4" />
                  </svg>
                  <p className="text-sm">Логотип {item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Сертификаты */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Сертификаты качества</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="text-center">
                <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center mb-4">
                  <div className="text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p>Сертификат {item}</p>
                  </div>
                </div>
                <h3 className="font-semibold">Сертификат соответствия</h3>
                <p className="text-gray-600 text-sm">№12345-{item} от 01.01.2023</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA секция */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Готовы начать сотрудничество?</h2>
          <p className="mb-6 text-lg">Присоединяйтесь к тысячам довольных клиентов DugaWeld</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalog"
              className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Перейти в каталог
            </Link>
            <Link
              href="/contacts"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors"
            >
              Связаться с нами
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}