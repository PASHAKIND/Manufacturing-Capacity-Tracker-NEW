

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Select, Card, Button, Spinner, TextArea } from '../components/ui';
import { PRODUCT_CATEGORIES_OPTIONS, APP_NAME } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole, SpecialOffer, Inquiry, ProductionFacility, SearchCriteria, TurnkeyProject } from '../types';
import { apiService } from '../services/apiService';
import { SidePanel } from '../components/ui/SidePanel';
import { InquiryModal } from '../components/InquiryModal';
import { ProductionCard } from '../components/ProductionCard';

interface GeolocationState {
  latitude?: number;
  longitude?: number;
  error?: string | null;
  status: 'idle' | 'pending' | 'success' | 'error';
}

// --- Icon Components ---
const IconClipboardList = () => <span className="text-3xl mb-2">📝</span>;
const IconMagnifyingGlass = () => <span className="text-3xl mb-2">🔍</span>;
const IconPaperAirplane = () => <span className="text-3xl mb-2">📨</span>;
const IconBuildingStorefront = () => <span className="text-3xl mb-2">🏭</span>;
const IconWrenchScrewdriver = () => <span className="text-3xl mb-2">🛠️</span>;
const IconBriefcase = () => <span className="text-3xl mb-2">💼</span>;
const GeolocationIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


// --- Standalone Section Components ---

const SpecialOffersPreview: React.FC<{ onOfferClick: (offer: SpecialOffer) => void }> = ({ onOfferClick }) => {
    const [offers, setOffers] = useState<SpecialOffer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            setIsLoading(true);
            try {
                const activeOffers = await apiService.getSpecialOffers({ activeOnly: true });
                setOffers(activeOffers.slice(0, 3));
            } catch (error) {
                console.error("Failed to fetch special offers", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOffers();
    }, []);

    return (
        <section className="py-12 md:py-16 bg-white animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="">
                <h2 className="text-3xl font-bold text-center text-black mb-10">Специальные предложения</h2>
                {isLoading ? (
                     <div className="text-center"><Spinner /></div>
                ) : offers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {offers.map(offer => (
                            <Card 
                                key={offer.id} 
                                className="cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col"
                                onClick={() => onOfferClick(offer)}
                            >
                                {offer.imageUrl && (
                                    <img src={offer.imageUrl} alt={offer.title} className="w-full h-40 object-cover" />
                                )}
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-bold text-lg text-black mb-2 flex-grow">{offer.title}</h3>
                                    <p className="text-sm text-gray-500">{offer.facilityName}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Активных спецпредложений на данный момент нет.</p>
                )}
            </div>
        </section>
    );
};

// --- NEW Advantages Section ---
const AdvantagesSection: React.FC = () => (
    <section className="py-12 md:py-16 bg-gray-50 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Card className="text-center">
                <h3 className="text-2xl font-semibold text-black mb-4">Для клиентов</h3>
                <ul className="text-gray-600 space-y-3 text-sm list-inside text-left">
                    <li><strong>Мгновенный доступ к базе производств:</strong> Находите проверенных исполнителей для любых задач по всей стране.</li>
                    <li><strong>Проекты "под ключ":</strong> Доверьте AI декомпозицию сложных изделий и поиск подрядчиков на каждом этапе.</li>
                    <li><strong>Прозрачность и прямой контакт:</strong> Следите за загрузкой производств и общайтесь с исполнителями напрямую.</li>
                </ul>
            </Card>
            <Card className="text-center">
                <h3 className="text-2xl font-semibold text-black mb-4">Для производителей</h3>
                <ul className="text-gray-600 space-y-3 text-sm list-inside text-left">
                    <li><strong>Новые клиенты без усилий:</strong> Получайте релевантные запросы от заказчиков, заинтересованных в ваших услугах.</li>
                    <li><strong>Оптимизация производственной загрузки:</strong> Демонстрируйте свои свободные мощности и привлекайте заказы.</li>
                    <li><strong>Простые инструменты:</strong> Управляйте профилем, продуктами и спецпредложениями в удобном интерфейсе.</li>
                </ul>
            </Card>
        </div>
    </section>
);


interface HeroSectionProps {
    currentUser: User | null;
    onDashboardRedirect: () => void;
}
const HeroSection: React.FC<HeroSectionProps> = ({ currentUser, onDashboardRedirect }) => (
    <section className="w-full py-12 md:py-16 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
      <div className="text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-black">
          Ищите производителей и создавайте<br className="hidden sm:inline" />
          цепочки процессов для сложных изделий
        </h1>
        <div className="mt-8">
          {currentUser && (
            <Button
              onClick={onDashboardRedirect}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              Перейти в Панель Управления
            </Button>
          )}
        </div>
      </div>
    </section>
);

const HowItWorksSection: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section className="py-12 md:py-16 bg-gray-50 animate-fadeIn" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
                <Button onClick={() => setIsExpanded(!isExpanded)} variant="secondary">
                    {isExpanded ? 'Скрыть, как это работает' : 'Показать, как это работает'}
                </Button>
                {isExpanded && (
                    <div className="animate-fadeIn pt-12">
                        <h2 className="text-3xl font-bold text-center text-black mb-10 md:mb-12">Простой путь к сотрудничеству</h2>
                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-2xl font-semibold text-black mb-6 text-center">Для Клиентов</h3>
                            <div className="space-y-6">
                              <div className="flex flex-col items-center text-center"><IconClipboardList /><h4 className="font-semibold text-lg mb-1">1. Опишите Задачу</h4><p className="text-gray-600 text-sm">Четко сформулируйте ваши требования к продукции или услуге.</p></div>
                              <div className="flex flex-col items-center text-center"><IconMagnifyingGlass /><h4 className="font-semibold text-lg mb-1">2. Найдите Исполнителей</h4><p className="text-gray-600 text-sm">Используйте наш поиск для подбора производств по категории, загрузке и местоположению.</p></div>
                              <div className="flex flex-col items-center text-center"><IconPaperAirplane /><h4 className="font-semibold text-lg mb-1">3. Отправьте Запрос</h4><p className="text-gray-600 text-sm">Свяжитесь с выбранными производителями напрямую через платформу.</p></div>
                            </div>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-2xl font-semibold text-black mb-6 text-center">Для Производителей</h3>
                            <div className="space-y-6">
                              <div className="flex flex-col items-center text-center"><IconBuildingStorefront /><h4 className="font-semibold text-lg mb-1">1. Зарегистрируйте Производство</h4><p className="text-gray-600 text-sm">Добавьте информацию о вашем предприятии, услугах и специализации.</p></div>
                              <div className="flex flex-col items-center text-center"><IconWrenchScrewdriver /><h4 className="font-semibold text-lg mb-1">2. Управляйте Профилем</h4><p className="text-gray-600 text-sm">Обновляйте данные о текущей загрузке, добавляйте продукты и сертификаты.</p></div>
                              <div className="flex flex-col items-center text-center"><IconBriefcase /><h4 className="font-semibold text-lg mb-1">3. Получайте Заказы</h4><p className="text-gray-600 text-sm">Отвечайте на запросы от потенциальных клиентов и расширяйте свой бизнес.</p></div>
                            </div>
                          </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

interface SearchSectionProps {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    productCategory: string;
    setProductCategory: (c: string) => void;
    geolocation: GeolocationState;
    isSearching: boolean;
    handleSearchSubmit: (e?: React.FormEvent) => void;
    requestGeolocation: () => void;
    productCategoryOptions: { value: string; label: string }[];
}
const SearchSection: React.FC<SearchSectionProps> = ({
    searchQuery, setSearchQuery, productCategory, setProductCategory, geolocation, isSearching, handleSearchSubmit, requestGeolocation, productCategoryOptions
}) => (
    <section className="py-12 md:py-16 animate-fadeIn">
      <Card title="Поиск">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex items-end gap-2">
                <div className="flex-grow">
                    <div className="flex w-full rounded-md shadow-sm">
                        <Input 
                            id="home-search-query"
                            name="searchQuery" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            placeholder="Что нужно произвести?" 
                            wrapperClassName="flex-grow"
                            className="rounded-none rounded-l-md focus:ring-inset focus:z-10 relative"
                            disabled={isSearching}
                        />
                         <Select 
                            name="productCategory" 
                            value={productCategory} 
                            onChange={(e) => setProductCategory(e.target.value)} 
                            options={productCategoryOptions}
                            placeholder="Категории"
                            wrapperClassName="flex-shrink-0"
                            className="rounded-none border-l-0 focus:ring-inset focus:z-10 relative"
                            disabled={isSearching}
                            aria-label="Категории"
                        />
                        <Button 
                            type="submit" 
                            variant="primary"
                            className="rounded-none rounded-r-md border-l-0 relative"
                            isLoading={isSearching}
                        >
                            Найти
                        </Button>
                    </div>
                </div>
                <Button 
                    type="button" 
                    onClick={requestGeolocation}
                    variant="outline"
                    size="md"
                    className={`!p-2.5 transition-colors ${geolocation.status === 'pending' ? 'animate-pulse' : ''} ${geolocation.status === 'success' ? 'text-green-600 border-green-500 bg-green-50' : 'text-gray-500 border-gray-300'}`}
                    title={geolocation.status === 'success' ? "Местоположение определено" : "Уточнить по моему местоположению"}
                    disabled={geolocation.status === 'pending' || isSearching}
                >
                    <GeolocationIcon />
                </Button>
            </div>
          
          <div className="pt-1 text-center min-h-[20px]">
              {geolocation.status === 'pending' && <div className="text-sm text-black flex items-center justify-center"><Spinner size="sm" className="mr-2" /> Определение местоположения...</div>}
              {geolocation.status === 'error' && geolocation.error && (<p className="text-xs text-red-600">{geolocation.error}</p>)}
          </div>
        </form>
      </Card>
    </section>
);

const BenefitsSection: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
      <section className="py-12 md:py-16 bg-gray-50 animate-fadeIn" style={{animationDelay: '0.8s'}}>
        <div className="text-center">
          <Button onClick={() => setIsExpanded(!isExpanded)} variant="secondary">
              {isExpanded ? `Скрыть преимущества` : `Почему выбирают ${APP_NAME}?`}
          </Button>
          {isExpanded && (
            <div className="animate-fadeIn pt-12">
              <h2 className="text-3xl font-bold text-center text-black mb-10 md:mb-12">Почему выбирают {APP_NAME}?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="text-center"><h3 className="text-xl font-semibold text-black mb-3">Для Клиентов</h3><ul className="text-gray-600 space-y-1 text-sm list-disc list-inside text-left"><li>Быстрый и удобный поиск производств.</li><li>Информация об актуальной загрузке.</li><li>Прямая связь с исполнителями.</li><li>Экономия времени и ресурсов.</li></ul></Card>
                <Card className="text-center"><h3 className="text-xl font-semibold text-black mb-3">Для Производителей</h3><ul className="text-gray-600 space-y-1 text-sm list-disc list-inside text-left"><li>Доступ к новым заказам и клиентам.</li><li>Удобное управление профилем и услугами.</li><li>Оптимизация производственных мощностей.</li><li>Простое взаимодействие с заказчиками.</li></ul></Card>
                <Card className="text-center"><h3 className="text-xl font-semibold text-black mb-3">Надежность и Эффективность</h3><ul className="text-gray-600 space-y-1 text-sm list-disc list-inside text-left"><li>Прозрачная система взаимодействия.</li><li>Повышение эффективности для обеих сторон.</li><li>Современная и удобная платформа.</li><li>Постоянное развитие и поддержка.</li></ul></Card>
              </div>
            </div>
          )}
        </div>
      </section>
    );
};

const GuestTurnkeyProjectPanel: React.FC<{isOpen: boolean; onClose: () => void;}> = ({isOpen, onClose}) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string>('');
    
    // Guest fields
    const [name, setName] = useState(currentUser?.name || '');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [telegram, setTelegram] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const resetForm = useCallback(() => {
        setProjectName('');
        setDescription('');
        setImagePreview(null);
        setImageBase64('');
        if (!currentUser) setName('');
        setEmail('');
        setPhone('');
        setTelegram('');
        setError(null);
        setIsLoading(false);
        setSuccess(false);
    }, [currentUser]);

    useEffect(() => {
        if (isOpen) {
            if (currentUser) {
                setName(currentUser.name);
            }
        } else {
            resetForm();
        }
    }, [isOpen, currentUser, resetForm]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError("Файл слишком большой. Максимальный размер 2МБ.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setImageBase64((reader.result as string)); // Keep the full data URL for mock API
            };
            reader.onerror = () => {
                setError("Не удалось прочитать файл.");
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async () => {
        setError(null);
        if (!projectName.trim() || !description.trim() || !name.trim()) {
            setError('Название проекта, описание и ваше имя обязательны.');
            return;
        }
        if (!currentUser && !email.trim() && !phone.trim() && !telegram.trim()) {
            setError('Пожалуйста, укажите хотя бы один способ связи (Email, телефон или Telegram).');
            return;
        }

        setIsLoading(true);
        try {
            const projectData: Omit<TurnkeyProject, 'id' | 'createdAt' | 'status' | 'stages'> = {
                projectName: projectName.trim(),
                productDescription: description.trim(),
                clientName: name.trim(),
                clientId: currentUser?.id,
                productImageUrl: imageBase64 || undefined,
                contactEmail: email.trim() || undefined,
                contactPhone: phone.trim() || undefined,
                contactTelegram: telegram.trim() || undefined,
            };
            await apiService.createTurnkeyProject(projectData);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Не удалось отправить проект.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if(isLoading) return;
        resetForm();
        onClose();
    }
    
    return (
        <SidePanel
            isOpen={isOpen}
            onClose={handleClose}
            title={success ? "Заявка отправлена!" : "Запросить проект 'под ключ'"}
            size="lg"
            footer={
                !success ? (
                    <>
                        <Button variant="secondary" onClick={handleClose} disabled={isLoading}>Отмена</Button>
                        <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>Отправить на анализ</Button>
                    </>
                ) : null
            }
        >
            {success ? (
                 <div className="text-center p-4 flex flex-col items-center h-full justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-4 text-gray-600">Спасибо! Ваш проект отправлен на обработку. AI проанализирует его, и администратор скоро с вами свяжется или опубликует проект для производителей.</p>
                    <Button variant="primary" onClick={handleClose} className="mt-6">Отлично!</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Опишите конечное изделие, и наш AI разложит его на производственные этапы. Вы получите уведомление о готовности.</p>
                    <Input label="Название проекта" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Напр., Журнальный столик 'Лофт'" required disabled={isLoading} />
                    <TextArea label="Описание изделия" value={description} onChange={e => setDescription(e.target.value)} placeholder="Например: Мне нужен небольшой журнальный столик: круглая столешница из светлого дуба..." rows={5} required disabled={isLoading} />
                     <div>
                        <label htmlFor="project-image" className="block text-sm font-medium text-gray-700 mb-1">Изображение или чертеж (до 2МБ)</label>
                        <Input id="project-image" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} disabled={isLoading} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"/>
                        {imagePreview && (
                            <div className="mt-2 relative">
                                <img src={imagePreview} alt="Предпросмотр" className="w-full max-h-48 object-contain rounded-md border" />
                                <Button size="sm" variant="danger" className="absolute top-1 right-1" onClick={() => {setImagePreview(null); setImageBase64('');(document.getElementById('project-image') as HTMLInputElement).value = '';}}>X</Button>
                            </div>
                        )}
                    </div>
                    <div className="pt-2 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-2">Ваши контактные данные</p>
                        <div className="space-y-3">
                             <Input label="Ваше имя" value={name} onChange={e => setName(e.target.value)} placeholder="Как к вам обращаться?" required disabled={isLoading || !!currentUser} />
                             {!currentUser && (
                                <>
                                 <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@mail.com" disabled={isLoading} />
                                 <Input label="Телефон" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (999) 123-45-67" disabled={isLoading} />
                                 <Input label="Telegram" value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="@username" disabled={isLoading} />
                                </>
                             )}
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
            )}
        </SidePanel>
    );
}

export const HomePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [geolocation, setGeolocation] = useState<GeolocationState>({ status: 'idle' });
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    
    const [guestSearchResults, setGuestSearchResults] = useState<ProductionFacility[] | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);

    const [selectedOffer, setSelectedOffer] = useState<SpecialOffer | null>(null);
    const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
    const [selectedFacilityForEnquiry, setSelectedFacilityForEnquiry] = useState<ProductionFacility | null>(null);

    const [isGuestTurnkeyPanelOpen, setIsGuestTurnkeyPanelOpen] = useState(false);

    const productCategoryOptions = PRODUCT_CATEGORIES_OPTIONS.map(cat => ({ value: cat, label: cat }));

    const requestGeolocation = useCallback(() => {
        if (!navigator.geolocation) {
          setGeolocation({ status: 'error', error: 'Геолокация не поддерживается вашим браузером.' });
          return;
        }
        setGeolocation(prev => ({ ...prev, status: 'pending', error: null }));
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setGeolocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              status: 'success',
              error: null,
            });
          },
          (error) => {
            let errorMessage = 'Не удалось определить ваше местоположение.';
            if (error.code === error.PERMISSION_DENIED) {
              errorMessage = 'Доступ к геолокации запрещен.';
            }
            setGeolocation({ status: 'error', error: errorMessage });
          }
        );
      }, []);

      const handleSearchSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim() && !productCategory) {
            alert("Пожалуйста, введите условия для поиска или выберите категорию.");
            return;
        }

        const searchParams: SearchCriteria = {
            query: searchQuery, 
            productCategory: productCategory, 
            latitude: geolocation.status === 'success' ? geolocation.latitude : undefined,
            longitude: geolocation.status === 'success' ? geolocation.longitude : undefined,
        };

        setIsSearching(true);

        if (currentUser) {
            if (currentUser.role === UserRole.CLIENT) {
                navigate('/client', { state: searchParams });
            } else {
                alert("Поиск доступен для клиентов. Пожалуйста, войдите как клиент или перейдите в свою панель.");
                const nonClientPath = currentUser.role === UserRole.MANUFACTURER ? "/manufacturer" : "/admin";
                navigate(nonClientPath);
                setIsSearching(false);
            }
        } else {
            setGuestSearchResults(null);
            setSearchError(null);
            try {
                const results = await apiService.getProductionFacilities(searchParams);
                setGuestSearchResults(results.slice(0, 3));
            } catch (err) {
                setSearchError("Произошла ошибка при поиске.");
            } finally {
                setIsSearching(false);
            }
        }
      };

      const handleDashboardRedirect = () => {
        if (!currentUser) return;
        if (currentUser.role === UserRole.CLIENT) navigate('/client');
        else if (currentUser.role === UserRole.MANUFACTURER) navigate('/manufacturer');
        else if (currentUser.role === UserRole.ADMIN) navigate('/admin');
      };
      
      const handleOfferClick = (offer: SpecialOffer) => {
        setSelectedOffer(offer);
        if (currentUser && currentUser.role === UserRole.CLIENT) {
            apiService.recordSpecialOfferView(offer.id, currentUser.id, currentUser.name);
        }
      };
    
      const handleOpenInquiryModal = (facility: ProductionFacility) => {
          if (!currentUser) {
              navigate('/login', { state: { infoMessage: 'Пожалуйста, войдите в систему, чтобы отправить запрос.' } });
              return;
          }
          setSelectedFacilityForEnquiry(facility);
          setIsEnquiryModalOpen(true);
      };
    
      const handleInquirySent = (inquiry: Inquiry) => {
          alert(`Ваш запрос успешно отправлен в "${inquiry.productionFacilityName}"!`);
          setIsEnquiryModalOpen(false);
      };

      const handleDelegateClick = () => {
        const searchCriteria: SearchCriteria = {
            query: searchQuery, 
            productCategory: productCategory, 
            latitude: geolocation.status === 'success' ? geolocation.latitude : undefined,
            longitude: geolocation.status === 'success' ? geolocation.longitude : undefined,
        };
        if (currentUser?.role === UserRole.CLIENT) {
            navigate('/client', { state: { intendedAction: 'delegate_search', ...searchCriteria } });
        } else {
            navigate('/guest-inquiry', { state: { searchCriteria } });
        }
    };
    
      return (
        <div className="space-y-4">
            <HeroSection currentUser={currentUser} onDashboardRedirect={handleDashboardRedirect} />
            <SearchSection
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                productCategory={productCategory}
                setProductCategory={setProductCategory}
                geolocation={geolocation}
                isSearching={isSearching}
                handleSearchSubmit={handleSearchSubmit}
                requestGeolocation={requestGeolocation}
                productCategoryOptions={[{ value: '', label: 'Все категории' }, ...productCategoryOptions]}
            />
             {guestSearchResults && (
                <Card title="Результаты поиска (первые 3)" className="mt-6 animate-fadeIn" actions={
                    <Button variant="outline" size="sm" onClick={() => navigate('/login', {state: {intendedAction: 'search', query: searchQuery, productCategory, latitude: geolocation.latitude, longitude: geolocation.longitude }})}>Войти, чтобы увидеть больше</Button>
                }>
                    <div className="space-y-4">
                        {guestSearchResults.length > 0 ? guestSearchResults.map(facility => (
                            <ProductionCard key={facility.id} facility={facility} onViewDetails={() => navigate(`/facility/${facility.id}`)} />
                        )) : <p>Ничего не найдено. Попробуйте изменить условия поиска или оставьте заявку на подбор.</p>}
                    </div>
                </Card>
            )}
            {guestSearchResults === null && isSearching && <div className="text-center py-4"><Spinner /></div>}
            {searchError && <p className="text-red-500 text-center">{searchError}</p>}
            
            <section className="text-center py-8 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-black">Готовы начать?</h3>
                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-4 sm:gap-8 px-4">
                    <div className="flex flex-col items-center justify-between text-center p-4 max-w-sm">
                        <div>
                            <p className="font-semibold text-black">Простая задача?</p>
                            <p className="mb-3 text-gray-600 text-sm">Найдите исполнителя или доверьте это нам.</p>
                        </div>
                        <Button variant="secondary" onClick={handleDelegateClick}>
                            Оставить заявку на подбор
                        </Button>
                    </div>

                    <div className="flex items-center">
                       <div className="h-full w-px bg-gray-200 sm:block hidden"></div>
                       <div className="h-px w-full bg-gray-200 sm:hidden block"></div>
                    </div>

                    <div className="flex flex-col items-center justify-between text-center p-4 max-w-sm">
                        <div>
                           <p className="font-semibold text-black">Сложное изделие?</p>
                           <p className="mb-3 text-gray-600 text-sm">Опишите его, и мы разложим на этапы.</p>
                        </div>
                        <Button variant="primary" onClick={() => {
                            if (currentUser?.role === UserRole.CLIENT) {
                                navigate('/client', {state: { view: 'projects' }})
                            } else {
                                setIsGuestTurnkeyPanelOpen(true)
                            }
                        }}>
                            Запросить проект 'под ключ'
                        </Button>
                    </div>
                </div>
            </section>

            <SpecialOffersPreview onOfferClick={handleOfferClick} />
            <AdvantagesSection />
            <HowItWorksSection />
            <BenefitsSection />

            <SidePanel 
                isOpen={!!selectedOffer}
                onClose={() => setSelectedOffer(null)}
                title={selectedOffer?.title || ""}
                size="lg"
            >
                {selectedOffer && (
                    <div className="space-y-4">
                        {selectedOffer.imageUrl && <img src={selectedOffer.imageUrl} alt={selectedOffer.title} className="w-full h-48 object-cover rounded-lg"/>}
                        <p className="text-sm text-gray-500 font-semibold">{selectedOffer.facilityName}</p>
                        <p>{selectedOffer.description}</p>
                        {selectedOffer.discountPercentage && <p className="font-bold text-lg text-green-600">Скидка {selectedOffer.discountPercentage}%</p>}
                        {selectedOffer.promoCode && <p><strong>Промокод:</strong> {selectedOffer.promoCode}</p>}
                        <p className="text-xs text-gray-500">Действует с {new Date(selectedOffer.validFrom).toLocaleDateString()} до {new Date(selectedOffer.validUntil).toLocaleDateString()}</p>
                        {selectedOffer.termsAndConditions && <p className="text-xs text-gray-500 border-t pt-2 mt-2"><strong>Условия:</strong> {selectedOffer.termsAndConditions}</p>}
                        <Button variant="primary" onClick={() => handleOpenInquiryModal({id: selectedOffer.facilityId, name: selectedOffer.facilityName} as ProductionFacility)} >Связаться с производством</Button>
                    </div>
                )}
            </SidePanel>
            
            {selectedFacilityForEnquiry && (
                <InquiryModal
                    isOpen={isEnquiryModalOpen}
                    onClose={() => setIsEnquiryModalOpen(false)}
                    facility={selectedFacilityForEnquiry}
                    onInquirySent={handleInquirySent}
                />
            )}
            <GuestTurnkeyProjectPanel isOpen={isGuestTurnkeyPanelOpen} onClose={() => setIsGuestTurnkeyPanelOpen(false)} />
        </div>
    );
};