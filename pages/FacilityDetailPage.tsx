


import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductionFacility, UserRole, Inquiry } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { Spinner, Card, Button, Lightbox } from '../components/ui';
import { InquiryModal } from '../components/InquiryModal';
import { favoriteService } from '../services/favoriteService';

// SVG Heart Icons
const HeartIconFilledMini = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

const HeartIconOutlineMini = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);


export const FacilityDetailPage: React.FC = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [facility, setFacility] = useState<ProductionFacility | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false); 
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0); 

  const fetchFacilityDetails = useCallback(async () => {
    if (!facilityId) {
      setError("ID производства не указан.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getProductionFacilityById(facilityId);
      if (data) {
        setFacility(data);
        if (currentUser && currentUser.role === UserRole.CLIENT) {
          setIsFavorite(favoriteService.isFavorite(currentUser.id, data.id));
        }
      } else {
        setError("Производство не найдено.");
      }
    } catch (err) {
      setError("Не удалось загрузить данные о производстве.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [facilityId, currentUser]);

  useEffect(() => {
    fetchFacilityDetails();
  }, [fetchFacilityDetails]);

  const handleOpenInquiryModal = () => {
    if (currentUser?.role === UserRole.CLIENT) {
      setIsModalOpen(true);
    }
  };

  const handleInquirySent = (newInquiry: Inquiry) => {
    alert(`Запрос отправлен в ${newInquiry.productionFacilityName}!`);
    // Optionally refresh some data or navigate
  };

  const handleToggleFavorite = () => {
    if (!currentUser || currentUser.role !== UserRole.CLIENT || !facility) return;

    if (isFavorite) {
      favoriteService.removeFavorite(currentUser.id, facility.id);
      setIsFavorite(false);
    } else {
      favoriteService.addFavorite(currentUser.id, facility.id, facility.name);
      setIsFavorite(true);
    }
     // Dispatch event for Navbar or other components
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
  };
  
  const handleEditFacility = () => {
    if (currentUser?.role === UserRole.MANUFACTURER && facility?.ownerId === currentUser.id) {
        navigate('/manufacturer');
    }
  };

  const openLightbox = (index: number) => { 
    setLightboxStartIndex(index);
    setIsLightboxOpen(true);
  };


  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  if (error) return <div className="text-center text-gray-700 py-10 text-xl">{error}</div>;
  if (!facility) return <div className="text-center text-gray-600 py-10 text-xl">Производство не найдено.</div>;

  const showContactDetails = currentUser?.role === UserRole.ADMIN || (currentUser?.role === UserRole.MANUFACTURER && currentUser.id === facility.ownerId);
  
  let loadStyles = 'bg-gray-100 text-black border-gray-300';
  let loadTextStyles = 'text-black';
  if (facility.productionLoad > 70) {
    loadStyles = 'bg-gray-600 border-gray-700';
    loadTextStyles = 'text-white';
  } else if (facility.productionLoad > 40) {
    loadStyles = 'bg-gray-300 border-gray-400';
    loadTextStyles = 'text-black';
  }


  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-black mb-2 md:mb-0">{facility.name}</h1>
            <div className={`px-4 py-2 rounded-md text-md font-semibold ${loadStyles} ${loadTextStyles}`}>
              Загрузка: {facility.productionLoad}%
            </div>
          </div>

          {facility.images && facility.images.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Галерея</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {facility.images.map((imgUrl, index) => (
                  <img 
                    key={index} 
                    src={imgUrl} 
                    alt={`${facility.name} - изображение ${index + 1}`} 
                    className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => openLightbox(index)}
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x200.png?text=Image+Not+Found')}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6 text-sm">
            <div><strong className="text-gray-700">Местоположение:</strong> {facility.location}</div>
            <div><strong className="text-gray-700">Город:</strong> {facility.city}</div>
            {showContactDetails && (
              <div><strong className="text-gray-700">Контактная информация:</strong> {facility.contactInfo}</div>
            )}
            <div><strong className="text-gray-700">Категории продукции:</strong> {facility.productCategories.join(', ') || 'Не указаны'}</div>
            {facility.certifications && facility.certifications.length > 0 && (
                <div><strong className="text-gray-700">Сертификации:</strong> {facility.certifications.join(', ')}</div>
            )}
            {currentUser?.role === UserRole.CLIENT && (
                <>
                <div><strong className="text-gray-700">Примерное время в пути:</strong> {facility.estimatedTravelTime || 'Н/Д'}</div>
                <div><strong className="text-gray-700">Общее время оборота:</strong> {facility.generalTurnaroundTime || 'Н/Д'}</div>
                </>
            )}
          </div>

          <div className="flex space-x-3 mb-6">
            {currentUser?.role === UserRole.CLIENT && (
              <>
                <Button onClick={handleOpenInquiryModal} variant="primary">Отправить запрос</Button>
                <Button onClick={handleToggleFavorite} variant={isFavorite ? "secondary" : "outline"} className="flex items-center">
                  {isFavorite ? <HeartIconFilledMini /> : <HeartIconOutlineMini />}
                  {isFavorite ? 'В избранном' : 'В избранное'}
                </Button>
              </>
            )}
            {currentUser?.role === UserRole.MANUFACTURER && facility.ownerId === currentUser.id && (
                <Button onClick={handleEditFacility} variant="primary">Редактировать мое производство</Button>
            )}
          </div>
        </div>
      </Card>

      {facility.products && facility.products.length > 0 && (
        <Card title="Продукты и Услуги">
          <div className="space-y-4 p-1">
            {facility.products.map(product => (
              <div key={product.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-black">{product.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 text-xs text-gray-500 mt-2">
                  <p><strong>Время изготовления:</strong> {product.estimatedProductionTime}</p>
                  {product.materials && product.materials.length > 0 && (
                    <p><strong>Материалы:</strong> {product.materials.join(', ')}</p>
                  )}
                  {product.capacityPerWeek && (
                    <p><strong>Производительность:</strong> {product.capacityPerWeek}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {facility && currentUser?.role === UserRole.CLIENT && (
        <InquiryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          facility={facility}
          onInquirySent={handleInquirySent}
        />
      )}

      {facility && facility.images && facility.images.length > 0 && (
        <Lightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={facility.images}
          startIndex={lightboxStartIndex}
        />
      )}
    </div>
  );
};