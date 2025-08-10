
import React, { useState, useEffect } from 'react';
import { ProductionFacility, UserRole } from '../types';
import { Card, Button } from './ui';
import { useAuth } from '../contexts/AuthContext';
import { favoriteService } from '../services/favoriteService'; // Added

interface ProductionCardProps {
  facility: ProductionFacility;
  onSendInquiry?: (facility: ProductionFacility) => void;
  onViewDetails?: (facility: ProductionFacility) => void;
  onFavoriteToggle?: (facilityId: string, isFavorite: boolean) => void; // Callback for parent to update its state
}

// SVG Heart Icons
const HeartIconFilled = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline-block" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
  </svg>
);

const HeartIconOutline = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);


export const ProductionCard: React.FC<ProductionCardProps> = ({ facility, onSendInquiry, onViewDetails, onFavoriteToggle }) => {
  const { currentUser } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role === UserRole.CLIENT) {
      setIsFavorite(favoriteService.isFavorite(currentUser.id, facility.id));
    }
  }, [currentUser, facility.id]);

  const handleToggleFavorite = () => {
    if (!currentUser || currentUser.role !== UserRole.CLIENT) return;

    if (isFavorite) {
      favoriteService.removeFavorite(currentUser.id, facility.id);
      setIsFavorite(false);
      if (onFavoriteToggle) onFavoriteToggle(facility.id, false);
    } else {
      favoriteService.addFavorite(currentUser.id, facility.id, facility.name);
      setIsFavorite(true);
      if (onFavoriteToggle) onFavoriteToggle(facility.id, true);
    }
  };

  const showContactDetails = currentUser?.role === UserRole.ADMIN || (currentUser?.role === UserRole.MANUFACTURER && currentUser.id === facility.ownerId);

  let loadStyles = 'bg-gray-100 text-black border border-gray-300';
  if (facility.productionLoad > 70) {
    loadStyles = 'bg-gray-600 text-white border border-gray-700';
  } else if (facility.productionLoad > 40) {
    loadStyles = 'bg-gray-300 text-black border border-gray-400';
  }

  const firstImage = facility.images && facility.images.length > 0 ? facility.images[0] : null;

  return (
    <Card className="mb-4 hover:shadow-xl transition-shadow duration-200 flex flex-col">
      {firstImage && (
        <img 
          src={firstImage} 
          alt={`${facility.name} image`} 
          className="w-full h-40 object-cover cursor-pointer" 
          onClick={onViewDetails ? () => onViewDetails(facility) : undefined}
          onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x200.png?text=Image+Not+Found')}
        />
      )}
      <div className="p-4 flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
          <div>
            <h3 
              className="text-xl font-semibold text-black cursor-pointer hover:underline"
              onClick={onViewDetails ? () => onViewDetails(facility) : undefined}
            >
              {facility.name}
            </h3>
            <p className="text-sm text-gray-500">{showContactDetails ? facility.location : `Город: ${facility.city}`}</p>
          </div>
          <div className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-sm font-medium ${loadStyles} self-start`}>
            Загрузка: {facility.productionLoad}%
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700 mb-2">
          <div>
            <span className="font-medium">Категории: </span>
            {facility.productCategories.join(', ') || 'Н/Д'}
          </div>
          {facility.certifications && facility.certifications.length > 0 && (
            <div>
              <span className="font-medium">Сертификаты: </span>
              {facility.certifications.join(', ') || 'Н/Д'}
            </div>
          )}
          {currentUser?.role === UserRole.CLIENT && (
            <>
              <div><span className="font-medium">Прим. время в пути: </span>{facility.estimatedTravelTime || 'Н/Д'}</div>
              <div><span className="font-medium">Среднее время оборота: </span>{facility.generalTurnaroundTime || 'Н/Д'}</div>
            </>
          )}
          {showContactDetails && (
              <div><span className="font-medium">Контакты: </span>{facility.contactInfo}</div>
          )}
        </div>

        {facility.products && facility.products.length > 0 && (showContactDetails || currentUser?.role === UserRole.CLIENT) && (
          <div className="mt-2 mb-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ключевые продукты/услуги:</h4>
            <ul className="list-disc list-inside pl-1 text-sm text-gray-600 max-h-24 overflow-y-auto">
              {facility.products.slice(0, 3).map(p => (
                <li key={p.id}>
                  {p.name} ({p.estimatedProductionTime})
                  {p.materials && p.materials.length > 0 && <span className="text-xs block text-gray-500">Материалы: {p.materials.join(', ')}</span>}
                  {p.capacityPerWeek && <span className="text-xs block text-gray-500">Произв-ть: {p.capacityPerWeek}</span>}
                </li>
              ))}
              {facility.products.length > 3 && <li>...и другие</li>}
            </ul>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-gray-200 flex justify-end items-center space-x-2">
        {!currentUser && onViewDetails && (
            <Button onClick={() => onViewDetails(facility)} variant="primary" size="sm">Узнать больше</Button>
        )}
        {currentUser?.role === UserRole.CLIENT && (
            <>
                <Button onClick={handleToggleFavorite} variant={isFavorite ? "secondary" : "outline"} size="sm" className="flex items-center">
                  {isFavorite ? <HeartIconFilled /> : <HeartIconOutline />} {isFavorite ? 'В избранном' : 'В избранное'}
                </Button>
                {onSendInquiry && <Button onClick={() => onSendInquiry(facility)} variant="primary" size="sm">Отправить запрос</Button>}
                {onViewDetails && <Button onClick={() => onViewDetails(facility)} variant="outline" size="sm">Подробнее</Button>}
            </>
        )}
        {(currentUser?.role === UserRole.ADMIN || (currentUser?.role === UserRole.MANUFACTURER && currentUser.id === facility.ownerId)) && onViewDetails && (
           <Button onClick={() => onViewDetails(facility)} variant="outline" size="sm">Подробнее</Button>
        )}
      </div>
    </Card>
  );
};
