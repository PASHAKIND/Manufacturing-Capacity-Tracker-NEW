
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProductionFacility, Inquiry, SearchCriteria, FavoriteFacility, UserRole, SpecialOffer, TurnkeyProject, DelegationRequest } from '../types';
import { apiService } from '../services/apiService';
import { ProductionCard } from '../components/ProductionCard';
import { InquiryModal } from '../components/InquiryModal';
import { Button, Input, Select, Spinner, Card, SidePanel, TextArea } from '../components/ui';
import { PRODUCT_CATEGORIES_OPTIONS, MOCK_CERTIFICATIONS_OPTIONS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { favoriteService } from '../services/favoriteService';
import { TurnkeyProjectModal } from '../components/TurnkeyProjectModal';
import { TurnkeyProjectCard } from '../components/TurnkeyProjectCard';


interface ClientGeolocationState {
  latitude?: number;
  longitude?: number;
  error?: string | null;
  status: 'idle' | 'pending' | 'success' | 'error';
}

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

type ClientView = 'search' | 'projects' | 'inquiries' | 'favorites' | 'offers';

export const ClientDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [initialLocationStateProcessed, setInitialLocationStateProcessed] = useState(false);

  const [facilities, setFacilities] = useState<ProductionFacility[]>([]);
  const [myInquiries, setMyInquiries] = useState<Inquiry[]>([]);
  const [favoriteFacilities, setFavoriteFacilities] = useState<FavoriteFacility[]>([]);
  const [turnkeyProjects, setTurnkeyProjects] = useState<TurnkeyProject[]>([]);
  const [allSpecialOffers, setAllSpecialOffers] = useState<SpecialOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<ClientView>('search');

  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    query: '',
    productCategory: '',
    latitude: undefined,
    longitude: undefined,
    minLoad: undefined,
    maxLoad: undefined,
    certifications: [],
  });
  const [clientGeo, setClientGeo] = useState<ClientGeolocationState>({ status: 'idle' });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const queryInputRef = useRef<HTMLInputElement>(null);
  const [showDelegationQueryPrompt, setShowDelegationQueryPrompt] = useState(false);


  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [selectedFacilityForEnquiry, setSelectedFacilityForEnquiry] = useState<ProductionFacility | null>(null);

  const [isDelegationPanelOpen, setIsDelegationPanelOpen] = useState(false);
  const [isSubmittingDelegation, setIsSubmittingDelegation] = useState(false);
  const [delegationMessage, setDelegationMessage] = useState('');

  const [selectedOffer, setSelectedOffer] = useState<SpecialOffer | null>(null);

  const [isTurnkeyModalOpen, setIsTurnkeyModalOpen] = useState(false);
  
  // States for "Guaranteed Selection"
  const [isSubmittingGuaranteed, setIsSubmittingGuaranteed] = useState(false);
  const [guaranteedRequestSent, setGuaranteedRequestSent] = useState(false);
  
  const pollingIntervalRef = useRef<number | null>(null);

  // Polling for Turnkey Projects
  const pollTurnkeyProjects = useCallback(async () => {
    if (!currentUser) return;
    const projects = await apiService.getTurnkeyProjectsForClient(currentUser.id);
    setTurnkeyProjects(projects);
    const isProcessing = projects.some(p => p.status === 'processing_ai');
    if (!isProcessing && pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
    }
  }, [currentUser]);

  useEffect(() => {
    const isProcessing = turnkeyProjects.some(p => p.status === 'processing_ai');
    if (isProcessing && !pollingIntervalRef.current) {
        pollingIntervalRef.current = window.setInterval(pollTurnkeyProjects, 3000); // Poll every 3 seconds
    }
    return () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };
  }, [turnkeyProjects, pollTurnkeyProjects]);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const [inquiriesData, favoritesData, projectsData, offersData] = await Promise.all([
        apiService.getInquiriesByClient(currentUser.id),
        Promise.resolve(favoriteService.getFavorites(currentUser.id)),
        apiService.getTurnkeyProjectsForClient(currentUser.id),
        apiService.getSpecialOffers({ activeOnly: true })
      ]);
      setMyInquiries(inquiriesData);
      setFavoriteFacilities(favoritesData);
      setTurnkeyProjects(projectsData);
      setAllSpecialOffers(offersData);
    } catch (err) {
      setError("Не удалось загрузить данные.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const performSearch = useCallback(async (criteria: SearchCriteria) => {
    setIsLoading(true);
    setError(null);
    setGuaranteedRequestSent(false); // Reset on each new search
    try {
      const results = await apiService.getProductionFacilities(criteria);
      setFacilities(results);
    } catch (err) {
      setError('Ошибка при поиске.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to handle initial state from login/redirect
  useEffect(() => {
    if (location.state && !initialLocationStateProcessed) {
      const { query, productCategory, latitude, longitude, minLoad, maxLoad, certifications, intendedAction } = location.state as Partial<SearchCriteria> & { from?: any, intendedAction?: string };

      // Handle delegation request from homepage
      if (intendedAction === 'delegate_search') {
          const criteriaFromState: SearchCriteria = {
            query: query || '',
            productCategory: productCategory || '',
            latitude,
            longitude,
            minLoad,
            maxLoad,
            certifications,
          };
          setSearchCriteria(criteriaFromState);
          setActiveView('search');
          setIsDelegationPanelOpen(true); // Open the panel
          setInitialLocationStateProcessed(true);
          navigate(location.pathname, { replace: true }); // Clear state
          return; // Done with this special action
      }
      
      // Handle regular search from homepage
      if (query !== undefined || productCategory !== undefined) {
        const criteriaFromState: SearchCriteria = {
          query: query || '',
          productCategory: productCategory || '',
          latitude,
          longitude,
          minLoad,
          maxLoad,
          certifications,
        };
        setSearchCriteria(criteriaFromState);
        setActiveView('search');
        performSearch(criteriaFromState);
        setInitialLocationStateProcessed(true);
        navigate(location.pathname, { replace: true });
      }
    } else if (!initialLocationStateProcessed) {
      // Perform a general search on first load
      performSearch({ query: '', productCategory: '' });
      setInitialLocationStateProcessed(true);
    }
  }, [location, initialLocationStateProcessed, performSearch, navigate]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCertificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSearchCriteria(prev => {
        const existingCerts = prev.certifications || [];
        if (checked) {
            return { ...prev, certifications: [...existingCerts, value] };
        } else {
            return { ...prev, certifications: existingCerts.filter(c => c !== value) };
        }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchCriteria);
  };

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setClientGeo({ status: 'error', error: 'Геолокация не поддерживается вашим браузером.' });
      return;
    }
    setClientGeo({ ...clientGeo, status: 'pending' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setClientGeo({ latitude: position.coords.latitude, longitude: position.coords.longitude, status: 'success' });
        setSearchCriteria(prev => ({ ...prev, latitude: position.coords.latitude, longitude: position.coords.longitude }));
      },
      () => {
        setClientGeo({ status: 'error', error: 'Доступ к геолокации запрещен.' });
      }
    );
  };
  
  const handleOpenInquiryModal = (facility: ProductionFacility) => {
    setSelectedFacilityForEnquiry(facility);
    setIsEnquiryModalOpen(true);
  };

  const handleInquirySent = (inquiry: Inquiry) => {
    setMyInquiries(prev => [inquiry, ...prev]);
    alert(`Ваш запрос успешно отправлен в "${inquiry.productionFacilityName}"!`);
  };

  const handleFavoriteToggle = () => {
    if(currentUser) {
        setFavoriteFacilities(favoriteService.getFavorites(currentUser.id));
    }
  };
  
  const handleViewDetails = (facility: ProductionFacility) => {
    navigate(`/facility/${facility.id}`);
  };

  const handleOpenDelegationPanel = () => {
    if (searchCriteria.query.trim()) {
      setIsDelegationPanelOpen(true);
    } else {
      setShowDelegationQueryPrompt(true);
      if (queryInputRef.current) {
        queryInputRef.current.focus();
      }
    }
  };

  const handleDelegationSubmit = async () => {
    if (!currentUser) return;
    setIsSubmittingDelegation(true);
    try {
      let finalCriteria = { ...searchCriteria };
      if (delegationMessage.trim()) {
        finalCriteria.query += ` (Доп. комментарий: ${delegationMessage.trim()})`;
      }
      await apiService.submitDelegationRequest({
          clientId: currentUser.id,
          clientName: currentUser.name,
          searchCriteria: finalCriteria,
      });
      alert('Ваша заявка на подбор отправлена администратору. Он свяжется с вами или подберет подходящие варианты.');
      setIsDelegationPanelOpen(false);
      setDelegationMessage('');
    } catch (err) {
      alert("Не удалось отправить заявку на подбор.");
    } finally {
      setIsSubmittingDelegation(false);
    }
  };
  
  const handleOpenTurnkeyModal = () => {
    setIsTurnkeyModalOpen(true);
  };

  const handleProjectCreated = (project: TurnkeyProject) => {
    setTurnkeyProjects(prev => [project, ...prev]);
    setIsTurnkeyModalOpen(false); // Close modal on success
  };

  const handleGuaranteedSelectionSubmit = async () => {
    if (!currentUser) {
        alert("Пожалуйста, войдите в систему, чтобы отправить заявку.");
        return;
    }
    if (!searchCriteria.query && !searchCriteria.productCategory) {
        alert("Пожалуйста, укажите критерии поиска для подбора.");
        return;
    }
    
    setIsSubmittingGuaranteed(true);
    try {
        await apiService.submitDelegationRequest({
            clientId: currentUser.id,
            clientName: currentUser.name,
            searchCriteria: searchCriteria,
        });
        setGuaranteedRequestSent(true);
    } catch (err) {
        alert("Не удалось отправить заявку на подбор.");
        console.error(err);
    } finally {
        setIsSubmittingGuaranteed(false);
    }
  };

  const handleOpenOfferDetails = (offer: SpecialOffer) => {
    setSelectedOffer(offer);
    // Notify API that offer was viewed
    if (currentUser) {
        apiService.recordSpecialOfferView(offer.id, currentUser.id, currentUser.name);
    }
  };

  const TABS_CONFIG = [
    { view: 'search' as ClientView, label: 'Поиск' },
    { view: 'projects' as ClientView, label: 'Проекты "под ключ"' },
    { view: 'inquiries' as ClientView, label: 'Мои запросы' },
    { view: 'favorites' as ClientView, label: 'Избранное' },
    { view: 'offers' as ClientView, label: 'Спецпредложения' }
  ];
  
  const renderSearchView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <aside className="lg:col-span-2">
        <Card title="Фильтры Поиска">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
                <Input
                    ref={queryInputRef}
                    label="Ключевые слова"
                    name="query"
                    value={searchCriteria.query}
                    onChange={handleSearchChange}
                    placeholder="Напр., лазерная резка"
                />
                <Select
                    label="Категория"
                    name="productCategory"
                    value={searchCriteria.productCategory}
                    onChange={handleSearchChange}
                    options={[{value: '', label: 'Все'}, ...PRODUCT_CATEGORIES_OPTIONS.map(o => ({value: o, label: o}))]}
                />
                
                <div className="flex items-center space-x-2">
                    <Button type="button" onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} variant="secondary" size="sm" className="w-full">
                        <FilterIcon /> {showAdvancedSearch ? 'Скрыть доп. фильтры' : 'Больше фильтров'}
                    </Button>
                </div>
                
                {showAdvancedSearch && (
                  <div className="space-y-4 pt-2 border-t mt-4">
                     <label className="block text-sm font-medium text-gray-700">Загрузка (%)</label>
                     <div className="flex gap-2">
                         <Input type="number" name="minLoad" placeholder="От" value={searchCriteria.minLoad || ''} onChange={handleSearchChange} />
                         <Input type="number" name="maxLoad" placeholder="До" value={searchCriteria.maxLoad || ''} onChange={handleSearchChange} />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Сертификации</label>
                         <div className="space-y-1">
                            {MOCK_CERTIFICATIONS_OPTIONS.map(cert => (
                                <label key={cert} className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" value={cert} checked={searchCriteria.certifications?.includes(cert)} onChange={handleCertificationChange} className="focus:ring-gray-500 h-4 w-4 text-black border-gray-300 rounded"/>
                                    <span className="text-sm">{cert}</span>
                                </label>
                            ))}
                         </div>
                     </div>
                     <Button type="button" onClick={requestGeolocation} variant="outline" size="sm" disabled={clientGeo.status === 'pending'}>
                        {clientGeo.status === 'pending' ? 'Определение...' : clientGeo.status === 'success' ? 'Местоположение ✓' : 'Уточнить по геолокации'}
                    </Button>
                    {clientGeo.error && <p className="text-xs text-red-600">{clientGeo.error}</p>}
                  </div>  
                )}

                <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                    Найти
                </Button>
                 <Button type="button" variant="outline" className="w-full" onClick={handleOpenDelegationPanel}>
                    Делегировать подбор
                </Button>
                 {showDelegationQueryPrompt && <p className="text-xs text-red-600">Для делегирования подбора, пожалуйста, заполните поле "Ключевые слова".</p>}
            </form>
        </Card>
      </aside>
      <main className="lg:col-span-3">
        {isLoading && <div className="text-center py-10"><Spinner size="lg" /></div>}
        {!isLoading && error && <p className="text-red-500">{error}</p>}
        
        {!isLoading && !error && facilities.length === 0 && (
            <div className="text-center py-10">
                {guaranteedRequestSent ? (
                    <Card>
                        <div className="text-center p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Заявка отправлена!</h3>
                            <p className="mt-1 text-sm text-gray-500">Наши специалисты уже ищут для вас исполнителя. Мы сообщим вам о результатах.</p>
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-800">Ничего не найдено?</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Мы не смогли найти автоматических совпадений по вашему запросу.
                                Но не волнуйтесь! Наши специалисты могут вручную подобрать для вас идеального исполнителя.
                            </p>
                            <div className="mt-4">
                                <Button
                                    variant="primary"
                                    onClick={handleGuaranteedSelectionSubmit}
                                    isLoading={isSubmittingGuaranteed}
                                >
                                    Подобрать исполнителя для меня
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        )}
        
        {!isLoading && !error && facilities.length > 0 && (
          <div className="space-y-4">
            {facilities.map(facility => (
              <ProductionCard 
                key={facility.id} 
                facility={facility} 
                onSendInquiry={handleOpenInquiryModal} 
                onViewDetails={handleViewDetails}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );

  const renderProjectsView = () => (
    <Card title="Проекты 'под ключ'" actions={<Button onClick={handleOpenTurnkeyModal} variant="primary">Создать новый проект</Button>}>
        {turnkeyProjects.length === 0 && <p className="text-gray-500">У вас пока нет проектов.</p>}
        <div className="space-y-4">
            {turnkeyProjects.map(project => (
                <TurnkeyProjectCard key={project.id} project={project} />
            ))}
        </div>
    </Card>
  );

  const renderInquiriesView = () => (
    <Card title="Мои отправленные запросы">
        {isLoading && <Spinner />}
        {!isLoading && myInquiries.length === 0 && <p className="text-gray-500">Вы еще не отправляли запросов.</p>}
        <ul className="space-y-3">
            {myInquiries.map(inq => (
              <li key={inq.id} className="p-3 bg-gray-50 rounded-md border">
                <p className="font-semibold">Кому: {inq.productionFacilityName}</p>
                <p className="text-sm text-gray-700 mt-1">{inq.message}</p>
                {inq.response && <p className="text-sm text-green-700 mt-1 pl-2 border-l-2 border-green-500"><strong>Ответ:</strong> {inq.response}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(inq.timestamp).toLocaleString('ru-RU')} - <span className="font-medium">{inq.status}</span></p>
              </li>
            ))}
        </ul>
    </Card>
  );

  const renderFavoritesView = () => (
    <Card title="Избранные производства">
        {favoriteFacilities.length === 0 && <p className="text-gray-500">Вы еще не добавили производства в избранное.</p>}
        <ul className="space-y-2">
            {favoriteFacilities.map(fav => (
                <li key={fav.facilityId} className="p-3 flex justify-between items-center bg-gray-50 rounded-md border">
                    <span className="font-semibold">{fav.facilityName}</span>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/facility/${fav.facilityId}`)}>Перейти</Button>
                </li>
            ))}
        </ul>
    </Card>
  );
  
  const renderOffersView = () => (
    <Card title="Активные спецпредложения от производств">
        {isLoading && <Spinner />}
        {!isLoading && allSpecialOffers.length === 0 && <p className="text-gray-500">На данный момент активных спецпредложений нет.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allSpecialOffers.map(offer => (
                <div key={offer.id} className="border rounded-lg p-4 flex flex-col hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleOpenOfferDetails(offer)}>
                    {offer.imageUrl && <img src={offer.imageUrl} alt={offer.title} className="w-full h-32 object-cover rounded-md mb-3"/>}
                    <h4 className="font-bold text-lg flex-grow">{offer.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{offer.facilityName}</p>
                    <p className="text-sm text-gray-600 mt-2">{offer.description}</p>
                </div>
            ))}
        </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-black">Панель управления Клиента</h1>
      
      <div className="mb-6 flex gap-2 border-b border-gray-300 pb-2 flex-wrap">
        {TABS_CONFIG.map(tab => (
            <Button
                key={tab.view}
                onClick={() => setActiveView(tab.view)}
                variant={activeView === tab.view ? "primary" : "outline"}
                className={`p-2 text-sm ${activeView === tab.view ? 'bg-black text-white' : 'text-black border-gray-300 hover:bg-gray-100'}`}
            >
                {tab.label}
            </Button>
        ))}
      </div>

      <div>
        {activeView === 'search' && renderSearchView()}
        {activeView === 'projects' && renderProjectsView()}
        {activeView === 'inquiries' && renderInquiriesView()}
        {activeView === 'favorites' && renderFavoritesView()}
        {activeView === 'offers' && renderOffersView()}
      </div>

      {selectedFacilityForEnquiry && (
        <InquiryModal
          isOpen={isEnquiryModalOpen}
          onClose={() => setIsEnquiryModalOpen(false)}
          facility={selectedFacilityForEnquiry}
          onInquirySent={handleInquirySent}
        />
      )}
      
      {isTurnkeyModalOpen && (
        <TurnkeyProjectModal 
            isOpen={isTurnkeyModalOpen}
            onClose={() => setIsTurnkeyModalOpen(false)}
            onProjectCreated={handleProjectCreated}
        />
      )}
      
      <SidePanel 
        isOpen={isDelegationPanelOpen}
        onClose={() => setIsDelegationPanelOpen(false)}
        title="Делегировать подбор Администратору"
        footer={
            <>
                <Button variant="secondary" onClick={() => setIsDelegationPanelOpen(false)} disabled={isSubmittingDelegation}>Отмена</Button>
                <Button variant="primary" onClick={handleDelegationSubmit} isLoading={isSubmittingDelegation}>Отправить заявку</Button>
            </>
        }
       >
        <div className="space-y-4">
            <p className="text-sm text-gray-600">Администратор получит ваши критерии поиска и подберет для вас лучшие варианты. Вы можете добавить дополнительный комментарий.</p>
            <Card title="Текущие критерии поиска" className="bg-gray-50">
                <ul className="text-sm space-y-1">
                    <li><strong>Запрос:</strong> {searchCriteria.query || 'не указан'}</li>
                    <li><strong>Категория:</strong> {searchCriteria.productCategory || 'любая'}</li>
                </ul>
            </Card>
            <TextArea label="Дополнительный комментарий" value={delegationMessage} onChange={(e) => setDelegationMessage(e.target.value)} rows={4} placeholder="Например, 'Ищу только производства с опытом работы с титаном'."/>
        </div>
      </SidePanel>
      
      {selectedOffer && (
        <SidePanel 
            isOpen={!!selectedOffer}
            onClose={() => setSelectedOffer(null)}
            title={selectedOffer.title}
            size="lg"
        >
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
        </SidePanel>
      )}

    </div>
  );
};
