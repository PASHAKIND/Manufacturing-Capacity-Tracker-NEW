
import React, { useState, useEffect, useCallback } from 'react';
import { ProjectStage, ProductionFacility } from '../types';
import { apiService } from '../services/apiService';
import { Button, Spinner } from './ui';

interface ProjectStageCardProps {
  stage: ProjectStage;
  onUpdate: (stage: ProjectStage) => void;
}

const FacilityMiniCard: React.FC<{facility: ProductionFacility, onSelect: () => void, isSelected: boolean}> = ({ facility, onSelect, isSelected }) => (
    <div 
        className={`p-2 border rounded-md cursor-pointer transition-all ${isSelected ? 'bg-gray-200 border-black shadow-inner' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
        onClick={onSelect}
    >
        <p className="font-semibold text-sm">{facility.name}</p>
        <p className="text-xs text-gray-500">{facility.city} | Загрузка: {facility.productionLoad}%</p>
    </div>
);

export const ProjectStageCard: React.FC<ProjectStageCardProps> = ({ stage, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedFacilities, setSuggestedFacilities] = useState<ProductionFacility[]>([]);
  const [error, setError] = useState<string | null>(null);

  const findContractors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await apiService.getProductionFacilities({
        query: stage.keywords.join(' '),
        productCategory: stage.requiredCategory,
        maxLoad: 90, // Don't suggest fully booked facilities
      });
      setSuggestedFacilities(results);
    } catch (err) {
      setError("Ошибка поиска подрядчиков");
    } finally {
      setIsLoading(false);
    }
  }, [stage.keywords, stage.requiredCategory]);

  useEffect(() => {
    // Automatically search for contractors when component mounts
    findContractors();
  }, [findContractors]);

  const handleSelectFacility = (facility: ProductionFacility) => {
    onUpdate({
        ...stage,
        selectedFacilityId: facility.id,
        selectedFacilityName: facility.name
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
                {stage.stage}
            </div>
            <div className="flex-grow">
                <h4 className="font-bold text-gray-800">{stage.name}</h4>
                <p className="text-sm text-gray-600">{stage.description}</p>
            </div>
        </div>

        <div className="mt-3 pl-12">
            {isLoading && <div className="flex items-center text-sm text-gray-500"><Spinner size="sm" className="mr-2"/>Идет подбор подрядчиков...</div>}
            {error && <p className="text-xs text-red-500">{error}</p>}
            
            {!isLoading && suggestedFacilities.length === 0 && (
                <p className="text-sm text-gray-500">Подходящих подрядчиков не найдено. Можно будет назначить вручную позже.</p>
            )}

            {!isLoading && suggestedFacilities.length > 0 && (
                 <div>
                    <h5 className="text-xs font-semibold text-gray-500 mb-2">РЕКОМЕНДУЕМЫЕ ИСПОЛНИТЕЛИ:</h5>
                    <div className="space-y-2">
                        {suggestedFacilities.slice(0, 3).map(fac => (
                            <FacilityMiniCard 
                                key={fac.id} 
                                facility={fac}
                                onSelect={() => handleSelectFacility(fac)}
                                isSelected={stage.selectedFacilityId === fac.id}
                            />
                        ))}
                    </div>
                 </div>
            )}
        </div>
    </div>
  );
};
