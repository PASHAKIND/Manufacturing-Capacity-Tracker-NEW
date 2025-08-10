

import React, { useState, useEffect, useCallback } from 'react';
import { ProductionFacility, ProductItem, Inquiry, UserRole, Employee, WorkLogEntry, ArchivedEmployee, ArchivedWorkLogEntry, SpecialOffer, SpecialOfferViewLog, TurnkeyProject } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, TextArea, Select, Spinner, Card, Modal, SidePanel } from '../components/ui';
import { PRODUCT_CATEGORIES_OPTIONS, MOCK_CERTIFICATIONS_OPTIONS } from '../constants';

// --- Product Form Component ---
interface ProductFormProps {
  facilityId: string;
  product?: ProductItem | null;
  onSave: (product: ProductItem) => void;
  onCancel: () => void;
  isProcessing: boolean; 
}

const ProductForm: React.FC<ProductFormProps> = ({ facilityId, product, onSave, onCancel, isProcessing }) => {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [estimatedProductionTime, setEstimatedProductionTime] = useState(product?.estimatedProductionTime || '');
  const [materials, setMaterials] = useState(product?.materials?.join(', ') || '');
  const [capacityPerWeek, setCapacityPerWeek] = useState(product?.capacityPerWeek || '');
  const [productError, setProductError] = useState('');

  useEffect(() => {
    if (product) {
        setName(product.name);
        setDescription(product.description);
        setEstimatedProductionTime(product.estimatedProductionTime);
        setMaterials(product.materials?.join(', ') || '');
        setCapacityPerWeek(product.capacityPerWeek || '');
    } else {
        setName('');
        setDescription('');
        setEstimatedProductionTime('');
        setMaterials('');
        setCapacityPerWeek('');
    }
    setProductError('');
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !estimatedProductionTime) {
      setProductError('Название, описание и время производства обязательны.');
      return;
    }
    setProductError('');
    try {
      const productData = {
        name,
        description,
        estimatedProductionTime,
        materials: materials.split(',').map(m => m.trim()).filter(m => m),
        capacityPerWeek,
      };
      let savedProduct;
      if (product?.id) {
        savedProduct = await apiService.updateProductInFacility(facilityId, { ...productData, id: product.id });
      } else {
        savedProduct = await apiService.addProductToFacility(facilityId, productData);
      }
      onSave(savedProduct);
    } catch (err) {
      setProductError('Не удалось сохранить продукт.');
      console.error(err);
    } 
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Название продукта" value={name} onChange={e => setName(e.target.value)} required disabled={isProcessing} />
      <TextArea label="Описание" value={description} onChange={e => setDescription(e.target.value)} required disabled={isProcessing} />
      <Input label="Примерное время производства (например, 3-5 дней)" value={estimatedProductionTime} onChange={e => setEstimatedProductionTime(e.target.value)} required disabled={isProcessing} />
      <Input label="Материалы (через запятую)" value={materials} onChange={e => setMaterials(e.target.value)} placeholder="Напр: Сталь, Алюминий" disabled={isProcessing} />
      <Input label="Производительность в неделю" value={capacityPerWeek} onChange={e => setCapacityPerWeek(e.target.value)} placeholder="Напр: 100 шт./неделю" disabled={isProcessing} />
      {productError && <p className="text-gray-700 text-sm">{productError}</p>}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isProcessing}>Отмена</Button>
        <Button type="submit" variant="primary" isLoading={isProcessing}>Сохранить продукт</Button>
      </div>
    </form>
  );
};

// --- Employee Modal ---
interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    facilityOwnerId: string;
    employeeToEdit?: Employee | null;
    onEmployeeSaved: (employee: Employee) => void;
    isProcessing: boolean; 
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, facilityOwnerId, employeeToEdit, onEmployeeSaved, isProcessing }) => {
    const [name, setName] = useState('');
    const [defaultHourlyRate, setDefaultHourlyRate] = useState<number | ''>('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (employeeToEdit) {
            setName(employeeToEdit.name);
            setDefaultHourlyRate(employeeToEdit.defaultHourlyRate);
        } else {
            setName('');
            setDefaultHourlyRate('');
        }
        setError(''); 
    }, [employeeToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || defaultHourlyRate === '' || Number(defaultHourlyRate) <= 0) {
            setError('Имя и корректная ставка обязательны.');
            return;
        }
        try {
            const employeeData = { name: name.trim(), defaultHourlyRate: Number(defaultHourlyRate) };
            let savedEmployee;
            if (employeeToEdit?.id) {
                savedEmployee = await apiService.updateEmployee(employeeToEdit.id, employeeData);
            } else {
                savedEmployee = await apiService.addEmployee(facilityOwnerId, employeeData);
            }
            onEmployeeSaved(savedEmployee);
        } catch (err) {
            console.error("Failed to save employee:", err);
            setError('Не удалось сохранить данные сотрудника.');
        } 
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={employeeToEdit ? "Редактировать сотрудника" : "Добавить сотрудника"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Имя сотрудника" value={name} onChange={e => setName(e.target.value)} required disabled={isProcessing} />
                <Input type="number" label="Ставка по умолчанию (₽/час)" value={defaultHourlyRate} onChange={e => setDefaultHourlyRate(e.target.value === '' ? '' : Number(e.target.value))} min="0" step="10" required disabled={isProcessing} />
                {error && <p className="text-sm text-gray-700">{error}</p>}
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>Отмена</Button>
                    <Button type="submit" variant="primary" isLoading={isProcessing}>Сохранить</Button>
                </div>
            </form>
        </Modal>
    );
};

// --- Work Log Modal ---
interface WorkLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    facilityOwnerId: string;
    employees: Employee[];
    workLogToEdit?: WorkLogEntry | null;
    onWorkLogSaved: (workLog: WorkLogEntry) => void;
    isProcessing: boolean; 
}

const WorkLogModal: React.FC<WorkLogModalProps> = ({ isOpen, onClose, facilityOwnerId, employees, workLogToEdit, onWorkLogSaved, isProcessing }) => {
    const [employeeId, setEmployeeId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
    const [hoursWorked, setHoursWorked] = useState<number | ''>('');
    const [hourlyRate, setHourlyRate] = useState<number | ''>('');
    const [workDescription, setWorkDescription] = useState('');
    const [calculatedPay, setCalculatedPay] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
      if (workLogToEdit) {
        setEmployeeId(workLogToEdit.employeeId);
        setDate(workLogToEdit.date);
        setHoursWorked(workLogToEdit.hoursWorked);
        setHourlyRate(workLogToEdit.hourlyRate);
        setWorkDescription(workLogToEdit.workDescription || '');
      } else {
        setEmployeeId(employees.length > 0 ? employees[0].id : '');
        setDate(new Date().toISOString().split('T')[0]);
        setHoursWorked('');
        setWorkDescription('');
      }
      setError('');
    }, [workLogToEdit, isOpen, employees]);
    
    useEffect(() => {
        if (!workLogToEdit && employeeId) {
            const selectedEmp = employees.find(emp => emp.id === employeeId);
            if (selectedEmp) {
                setHourlyRate(selectedEmp.defaultHourlyRate);
            }
        }
    }, [employeeId, employees, workLogToEdit]);

    useEffect(() => {
        const h = Number(hoursWorked);
        const r = Number(hourlyRate);
        if (h > 0 && r > 0) {
            setCalculatedPay(parseFloat((h * r).toFixed(2)));
        } else {
            setCalculatedPay(0);
        }
    }, [hoursWorked, hourlyRate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!employeeId || !date || hoursWorked === '' || Number(hoursWorked) <= 0 || hourlyRate === '' || Number(hourlyRate) <= 0) {
            setError('Все поля, включая часы и ставку (больше 0), обязательны.');
            return;
        }
        if (!workDescription.trim()) {
            setError('Описание работы не может быть пустым.');
            return;
        }

        const selectedEmployee = employees.find(emp => emp.id === employeeId);
        if (!selectedEmployee && !workLogToEdit) { 
            setError('Выбранный сотрудник не найден.');
            return;
        }
        
        try {
            let savedEntry;
            const entryDataCore = {
                date,
                hoursWorked: Number(hoursWorked),
                hourlyRate: Number(hourlyRate),
                workDescription: workDescription.trim(),
            };

            if (workLogToEdit?.id) {
                savedEntry = await apiService.updateWorkLogEntry(workLogToEdit.id, entryDataCore);
            } else {
                const addPayload = {
                    ...entryDataCore,
                    employeeId,
                    employeeName: selectedEmployee!.name, 
                };
                savedEntry = await apiService.addWorkLogEntry(facilityOwnerId, addPayload);
            }
            onWorkLogSaved(savedEntry);
        } catch (err) {
            console.error("Failed to save work log:", err);
            setError('Не удалось сохранить запись о работе.');
        } 
    };

    const employeeOptions = employees.map(emp => ({ value: emp.id, label: emp.name }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={workLogToEdit ? "Редактировать запись о работе" : "Добавить запись о работе"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select label="Сотрудник" value={employeeId} onChange={e => setEmployeeId(e.target.value)} options={employeeOptions} required disabled={!!workLogToEdit || isProcessing} />
                <Input type="date" label="Дата" value={date} onChange={e => setDate(e.target.value)} required disabled={isProcessing} />
                <Input type="number" label="Часы работы" value={hoursWorked} onChange={e => setHoursWorked(e.target.value === '' ? '' : Number(e.target.value))} min="0.1" step="0.1" required disabled={isProcessing} />
                <Input type="number" label="Почасовая ставка (₽)" value={hourlyRate} onChange={e => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))} min="0" step="10" required disabled={isProcessing} />
                <TextArea label="Описание работы" value={workDescription} onChange={e => setWorkDescription(e.target.value)} rows={3} placeholder="Опишите выполненную работу" required disabled={isProcessing} />
                <div className="text-sm">
                    <strong>Расчетная оплата:</strong> {calculatedPay.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
                </div>
                {error && <p className="text-sm text-gray-700">{error}</p>}
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>Отмена</Button>
                    <Button type="submit" variant="primary" isLoading={isProcessing}>Сохранить</Button>
                </div>
            </form>
        </Modal>
    );
};


// --- Special Offer Modal ---
interface SpecialOfferFormProps {
    isOpen: boolean;
    onClose: () => void;
    facilityId: string;
    facilityOwnerId: string;
    facilityName: string;
    offerToEdit?: SpecialOffer | null;
    onOfferSaved: (offer: SpecialOffer) => void;
    isProcessing: boolean;
}

const SpecialOfferFormModal: React.FC<SpecialOfferFormProps> = ({
    isOpen, onClose, facilityId, facilityOwnerId, facilityName, offerToEdit, onOfferSaved, isProcessing
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState<number | ''>('');
    const [fixedDiscountAmount, setFixedDiscountAmount] = useState<number | ''>('');
    const [applicableServices, setApplicableServices] = useState(''); // Comma-separated
    const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);
    const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]); // Default to 30 days from now
    const [promoCode, setPromoCode] = useState('');
    const [termsAndConditions, setTermsAndConditions] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (offerToEdit) {
            setTitle(offerToEdit.title);
            setDescription(offerToEdit.description);
            setDiscountPercentage(offerToEdit.discountPercentage ?? '');
            setFixedDiscountAmount(offerToEdit.fixedDiscountAmount ?? '');
            setApplicableServices(offerToEdit.applicableServices?.join(', ') || '');
            setValidFrom(offerToEdit.validFrom);
            setValidUntil(offerToEdit.validUntil);
            setPromoCode(offerToEdit.promoCode || '');
            setTermsAndConditions(offerToEdit.termsAndConditions || '');
            setImageUrl(offerToEdit.imageUrl || '');
            setIsActive(offerToEdit.isActive);
        } else {
            setTitle('');
            setDescription('');
            setDiscountPercentage('');
            setFixedDiscountAmount('');
            setApplicableServices('');
            setValidFrom(new Date().toISOString().split('T')[0]);
            setValidUntil(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
            setPromoCode('');
            setTermsAndConditions('');
            setImageUrl('');
            setIsActive(true);
        }
        setFormError('');
    }, [offerToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!title.trim() || !description.trim() || !validFrom || !validUntil) {
            setFormError('Заголовок, описание и даты действия обязательны.');
            return;
        }
        if (validFrom > validUntil) {
            setFormError('Дата начала не может быть позже даты окончания.');
            return;
        }
        if (discountPercentage && (Number(discountPercentage) <= 0 || Number(discountPercentage) > 100)) {
            setFormError('Процент скидки должен быть от 1 до 100.');
            return;
        }
        if (fixedDiscountAmount && Number(fixedDiscountAmount) <= 0) {
            setFormError('Фиксированная скидка должна быть больше 0.');
            return;
        }

        const offerData: Omit<SpecialOffer, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'> & { id?: string } = {
            facilityId,
            facilityOwnerId,
            facilityName,
            title: title.trim(),
            description: description.trim(),
            discountPercentage: discountPercentage ? Number(discountPercentage) : undefined,
            fixedDiscountAmount: fixedDiscountAmount ? Number(fixedDiscountAmount) : undefined,
            applicableServices: applicableServices.split(',').map(s => s.trim()).filter(s => s),
            validFrom,
            validUntil,
            promoCode: promoCode.trim() || undefined,
            termsAndConditions: termsAndConditions.trim() || undefined,
            imageUrl: imageUrl.trim() || undefined,
            isActive,
        };

        try {
            let savedOffer;
            if (offerToEdit?.id) {
                savedOffer = await apiService.updateSpecialOffer(offerToEdit.id, offerData);
            } else {
                savedOffer = await apiService.createSpecialOffer(offerData as Omit<SpecialOffer, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>);
            }
            onOfferSaved(savedOffer);
        } catch (err) {
            console.error("Failed to save special offer:", err);
            setFormError('Не удалось сохранить спецпредложение.');
        }
    };

    return (
        <SidePanel
          isOpen={isOpen}
          onClose={onClose}
          title={offerToEdit ? "Редактировать спецпредложение" : "Создать спецпредложение"}
          size="lg"
          footer={
            <>
              <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing}>Отмена</Button>
              <Button type="submit" form="special-offer-form" variant="primary" isLoading={isProcessing}>Сохранить</Button>
            </>
          }
        >
            <form id="special-offer-form" onSubmit={handleSubmit} className="space-y-3">
                <Input label="Заголовок" value={title} onChange={e => setTitle(e.target.value)} required disabled={isProcessing} />
                <TextArea label="Описание" value={description} onChange={e => setDescription(e.target.value)} rows={3} required disabled={isProcessing} />
                <div className="grid grid-cols-2 gap-3">
                    <Input type="number" label="Скидка (%)" value={discountPercentage} onChange={e => {setDiscountPercentage(e.target.value ? Number(e.target.value) : ''); setFixedDiscountAmount('');}} placeholder="Напр. 10" min="1" max="100" disabled={isProcessing || !!fixedDiscountAmount} />
                    <Input type="number" label="Фикс. скидка (₽)" value={fixedDiscountAmount} onChange={e => {setFixedDiscountAmount(e.target.value ? Number(e.target.value) : ''); setDiscountPercentage('');}} placeholder="Напр. 500" min="1" disabled={isProcessing || !!discountPercentage} />
                </div>
                <Input label="Применимые услуги/продукты (через запятую)" value={applicableServices} onChange={e => setApplicableServices(e.target.value)} placeholder="Напр: Фрезеровка, Сборка" disabled={isProcessing} />
                <div className="grid grid-cols-2 gap-3">
                    <Input type="date" label="Действует с" value={validFrom} onChange={e => setValidFrom(e.target.value)} required disabled={isProcessing} />
                    <Input type="date" label="Действует до" value={validUntil} onChange={e => setValidUntil(e.target.value)} required disabled={isProcessing} />
                </div>
                <Input label="Промокод (необязательно)" value={promoCode} onChange={e => setPromoCode(e.target.value)} disabled={isProcessing} />
                <TextArea label="Условия и положения (необязательно)" value={termsAndConditions} onChange={e => setTermsAndConditions(e.target.value)} rows={2} disabled={isProcessing} />
                <Input type="url" label="URL изображения (необязательно)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" disabled={isProcessing} />
                <label className="flex items-center space-x-2 cursor-pointer pt-2">
                    <input type="checkbox" className="focus:ring-gray-500 h-4 w-4 text-black border-gray-300 rounded" checked={isActive} onChange={e => setIsActive(e.target.checked)} disabled={isProcessing} />
                    <span>Активно (будет видно клиентам)</span>
                </label>
                {formError && <p className="text-sm text-red-700">{formError}</p>}
            </form>
        </SidePanel>
    );
};


// --- View Logs Modal ---
interface ViewLogsModalProps {
    isOpen: boolean;
    onClose: () => void;
    offer: SpecialOffer | null;
    viewLogs: SpecialOfferViewLog[];
    onSendFollowUp: (log: SpecialOfferViewLog) => void;
    isLoadingLogs: boolean;
}

const ViewLogsModal: React.FC<ViewLogsModalProps> = ({ isOpen, onClose, offer, viewLogs, onSendFollowUp, isLoadingLogs }) => {
    if (!offer) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Просмотры предложения: "${offer.title.substring(0,30)}..."`}>
            {isLoadingLogs && <Spinner />}
            {!isLoadingLogs && viewLogs.length === 0 && <p className="text-gray-500">Это предложение еще никто не просматривал.</p>}
            {!isLoadingLogs && viewLogs.length > 0 && (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {viewLogs.map(log => (
                        <li key={log.id} className="p-2 border rounded-md bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{log.clientName}</p>
                                    <p className="text-xs text-gray-500">Просмотрено: {new Date(log.viewedAt).toLocaleString('ru-RU')}</p>
                                </div>
                                {!log.followUpSent ? (
                                    <Button size="sm" variant="outline" onClick={() => onSendFollowUp(log)}>Отправить доп. предложение</Button>
                                ) : (
                                    <span className="text-xs text-green-600">Доп. предложение отправлено</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Modal>
    );
};

// --- Follow-Up Modal ---
interface FollowUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    viewLog: SpecialOfferViewLog | null; // The specific view log entry
    offerTitle: string;
    onSend: (viewLogId: string, message: string) => void;
    isSending: boolean;
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({ isOpen, onClose, viewLog, offerTitle, onSend, isSending }) => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setMessage(`Здравствуйте, ${viewLog?.clientName}! Вы интересовались нашим предложением "${offerTitle}". Хотели бы уточнить детали или есть вопросы?`);
        setError('');
    }, [viewLog, offerTitle, isOpen]);

    const handleSubmit = () => {
        if (!message.trim()) {
            setError('Сообщение не может быть пустым.');
            return;
        }
        if (viewLog) {
            onSend(viewLog.id, message.trim());
        }
    };

    if (!viewLog) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Доп. предложение для ${viewLog.clientName}`}>
            <p className="text-sm text-gray-600 mb-1">По спецпредложению: <span className="font-medium">{offerTitle}</span></p>
            
            <TextArea label="Ваше сообщение" value={message} onChange={e => setMessage(e.target.value)} rows={4} disabled={isSending} />
            {error && <p className="text-sm text-gray-700 mt-1">{error}</p>}
            <div className="flex justify-end space-x-2 mt-4">
                <Button variant="secondary" onClick={onClose} disabled={isSending}>Отмена</Button>
                <Button variant="primary" onClick={handleSubmit} isLoading={isSending}>Отправить</Button>
            </div>
        </Modal>
    );
};

const CameraIconSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);


// --- Main Manufacturer Page ---
type ManufacturerView = 'facility' | 'products' | 'inquiries' | 'marketplace' | 'workHours' | 'specialOffers' | 'cameras' | 'archive';

export const ManufacturerDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [facility, setFacility] = useState<ProductionFacility | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workLogEntries, setWorkLogEntries] = useState<WorkLogEntry[]>([]);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isWorkLogModalOpen, setIsWorkLogModalOpen] = useState(false);
  const [workLogToEdit, setWorkLogToEdit] = useState<WorkLogEntry | null>(null);

  const [archivedEmployees, setArchivedEmployees] = useState<ArchivedEmployee[]>([]);
  const [archivedWorkLogEntries, setArchivedWorkLogEntries] = useState<ArchivedWorkLogEntry[]>([]);

  // Marketplace state
  const [marketplaceProjects, setMarketplaceProjects] = useState<TurnkeyProject[]>([]);
  const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(false);
  const [interestSendingFor, setInterestSendingFor] = useState<string | null>(null);
  
  // Special Offers State
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);
  const [isSpecialOfferModalOpen, setIsSpecialOfferModalOpen] = useState(false);
  const [offerToEdit, setOfferToEdit] = useState<SpecialOffer | null>(null);
  const [isProcessingSpecialOffer, setIsProcessingSpecialOffer] = useState(false);
  const [deletingSpecialOfferId, setDeletingSpecialOfferId] = useState<string | null>(null);
  const [isViewLogsModalOpen, setIsViewLogsModalOpen] = useState(false);
  const [selectedOfferForLogs, setSelectedOfferForLogs] = useState<SpecialOffer | null>(null);
  const [currentViewLogs, setCurrentViewLogs] = useState<SpecialOfferViewLog[]>([]);
  const [isLoadingOfferLogs, setIsLoadingOfferLogs] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [targetViewLogForFollowUp, setTargetViewLogForFollowUp] = useState<SpecialOfferViewLog | null>(null);
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);

  // Camera State
  const [connectedCameraUrl, setConnectedCameraUrl] = useState<string | null>(null);
  const [isCameraConnectModalOpen, setIsCameraConnectModalOpen] = useState(false);
  const [cameraUrlInput, setCameraUrlInput] = useState('');
  const [cameraConnectError, setCameraConnectError] = useState<string | null>(null);
  const [isProcessingCamera, setIsProcessingCamera] = useState(false);


  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSavingFacilityDetails, setIsSavingFacilityDetails] = useState(false);
  const [isProcessingProduct, setIsProcessingProduct] = useState(false); 
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [isProcessingEmployee, setIsProcessingEmployee] = useState(false); 
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);
  const [isProcessingWorkLog, setIsProcessingWorkLog] = useState(false); 
  const [deletingWorkLogId, setDeletingWorkLogId] = useState<string | null>(null);
  const [isRespondingToInquiry, setIsRespondingToInquiry] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] = useState<ProductItem | null | undefined>(undefined); 
  const [respondingToInquiry, setRespondingToInquiry] = useState<Inquiry | null>(null);
  const [inquiryResponseText, setInquiryResponseText] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  
  const [activeView, setActiveView] = useState<ManufacturerView>('facility');
  const firstLoadDone = React.useRef(false);

  // Load camera URL from localStorage on mount
  useEffect(() => {
    if (currentUser) {
      const storedUrl = localStorage.getItem(`camera_url_${currentUser.id}`);
      if (storedUrl) {
        setConnectedCameraUrl(storedUrl);
      }
    }
  }, [currentUser]);


  const fetchFacilityData = useCallback(async (isInitial = false) => {
    if (!currentUser || currentUser.role !== UserRole.MANUFACTURER) return;
    
    if (isInitial) {
        setIsInitialLoading(true);
    }
    setError(null);

    try {
      const facData = await apiService.getProductionFacilityByOwnerId(currentUser.id);
      if (facData) {
        setFacility({
          ...facData,
          certifications: facData.certifications || [],
          images: facData.images || [],
        });
        const [inqData, empData, logData, archivedEmpData, archivedLogData, offersData] = await Promise.all([
            apiService.getInquiriesForFacility(facData.id),
            apiService.getEmployeesByFacilityOwner(currentUser.id),
            apiService.getWorkLogEntriesByFacilityOwner(currentUser.id),
            apiService.getArchivedEmployeesByFacilityOwner(currentUser.id),
            apiService.getArchivedWorkLogEntriesByFacilityOwner(currentUser.id),
            apiService.getSpecialOffers({ facilityOwnerId: currentUser.id })
        ]);
        
        setEmployees([...empData]);
        setWorkLogEntries([...logData].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt.getTime() - a.createdAt.getTime()));
        setArchivedEmployees([...archivedEmpData]);
        setArchivedWorkLogEntries([...archivedLogData]);
        setInquiries([...inqData]);
        setSpecialOffers([...offersData]);

      } else {
        setError("Не удалось загрузить данные вашего производства. Возможно, оно еще не создано.");
      }
    } catch (err) {
      setError('Не удалось загрузить данные.');
      console.error("[MFP] Error fetching facility data:", err);
    } finally {
      if (isInitial) {
        setIsInitialLoading(false);
        firstLoadDone.current = true;
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!firstLoadDone.current) {
        fetchFacilityData(true);
    }
  }, [fetchFacilityData]);

  // Facility form handlers (no changes)
  const handleFacilityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!facility) return;
    const { name, value } = e.target;
    if (name === "productionLoad") {
       setFacility({ ...facility, [name]: parseInt(value, 10) });
    } else {
       setFacility({ ...facility, [name]: value });
    }
  };
  const handleCategoryChange = (selectedCategories: string[]) => {
    if (!facility) return;
    setFacility({ ...facility, productCategories: selectedCategories });
  };
  const handleCertificationChange = (selectedCerts: string[]) => {
    if (!facility) return;
    setFacility({ ...facility, certifications: selectedCerts });
  };
  const handleAddImageUrl = () => {
    if (!facility || !newImageUrl.trim()) return;
    if (facility.images && facility.images.includes(newImageUrl.trim())) {
        alert("Этот URL изображения уже добавлен.");
        return;
    }
    const updatedImages = [...(facility.images || []), newImageUrl.trim()];
    setFacility({ ...facility, images: updatedImages });
    setNewImageUrl("");
  };
  const handleRemoveImageUrl = (urlToRemove: string) => {
    if (!facility) return;
    const updatedImages = facility.images?.filter(url => url !== urlToRemove) || [];
    setFacility({ ...facility, images: updatedImages });
  };
  const handleSaveFacility = async () => {
    if (!facility) return;
    setIsSavingFacilityDetails(true);
    setError(null);
    try {
      const updatedFacility = await apiService.updateProductionFacility(facility);
      setFacility(updatedFacility); 
      alert('Данные производства успешно обновлены!');
    } catch (err) {
      setError('Не удалось сохранить данные производства.');
      console.error(err);
    } finally {
      setIsSavingFacilityDetails(false);
    }
  };

  // Product handlers (no changes)
  const handleOpenProductModal = (product?: ProductItem) => {
    setEditingProduct(product); 
  };
  const handleProductSaved = async (savedProduct: ProductItem) => {
    setIsProcessingProduct(true);
    try {
        await fetchFacilityData(); 
        setEditingProduct(null); 
    } catch (e) {
        console.error("Error refreshing data after product save", e);
    } finally {
        setIsProcessingProduct(false);
    }
  };
  const handleDeleteProduct = async (productId: string) => {
    if (!facility || !window.confirm("Вы уверены, что хотите удалить этот продукт?")) return;
    setDeletingProductId(productId);
    try {
      await apiService.deleteProductFromFacility(facility.id, productId);
      await fetchFacilityData(); 
    } catch (err) {
      alert("Не удалось удалить продукт.");
      console.error("Error deleting product:", err);
    } finally {
      setDeletingProductId(null);
    }
  };

  // Inquiry handlers (no changes)
  const handleRespondToInquiry = async () => {
    if (!respondingToInquiry || !inquiryResponseText.trim()) return;
    setIsRespondingToInquiry(true);
    try {
        await apiService.updateInquiryStatus(respondingToInquiry.id, 'Responded', inquiryResponseText.trim());
        await fetchFacilityData();
        setRespondingToInquiry(null);
        setInquiryResponseText("");
    } catch (err) {
        alert("Не удалось отправить ответ.");
    } finally {
        setIsRespondingToInquiry(false);
    }
  };
  const handleMarkInquiryViewed = async (inquiry: Inquiry) => {
    if (inquiry.status === 'New') {
      try {
        await apiService.updateInquiryStatus(inquiry.id, 'Viewed');
        await fetchFacilityData(); 
      } catch (err) {
        console.error("Не удалось отметить запрос как просмотренный:", err);
      }
    }
  };
  const getStatusStyling = (status: Inquiry['status']): {label: string, classes: string} => {
    switch (status) {
      case 'New': return { label: 'Новый', classes: 'bg-gray-200 text-black border border-gray-300'};
      case 'Viewed': return { label: 'Просмотрен', classes: 'bg-gray-300 text-black border border-gray-400'};
      case 'Responded': return { label: 'Отвечен', classes: 'bg-gray-500 text-white border border-gray-600'};
      default: return {label: status, classes: 'bg-gray-200 text-black border border-gray-300'};
    }
  };

  // Employee Handlers (no changes)
  const handleOpenEmployeeModal = (employee?: Employee) => {
    setEmployeeToEdit(employee || null);
    setIsEmployeeModalOpen(true);
  };
  const handleEmployeeSaved = async (savedEmployee: Employee) => {
     setIsProcessingEmployee(true);
     try {
        await fetchFacilityData(); 
        setIsEmployeeModalOpen(false);
        setEmployeeToEdit(null); 
     } finally {
        setIsProcessingEmployee(false);
     }
  };
  const handleDeleteEmployee = async (employeeId: string) => {
    if (!currentUser) return;
    if (!window.confirm("Вы уверены, что хотите архивировать этого сотрудника и все его записи?")) {
        return;
    }
    setDeletingEmployeeId(employeeId);
    try {
      await apiService.deleteEmployee(employeeId); 
      await fetchFacilityData(); 
      alert("Сотрудник и его записи о работе перемещены в архив.");
    } catch (err) {
      alert("Не удалось архивировать сотрудника.");
      console.error(`[MFP] Error archiving employee ID: ${employeeId}:`, err);
    } finally {
      setDeletingEmployeeId(null);
    }
  };

  // Work Log Handlers (no changes)
  const handleOpenWorkLogModal = (logEntry?: WorkLogEntry) => {
    if (employees.length === 0) {
        alert("Сначала добавьте хотя бы одного сотрудника.");
        return;
    }
    setWorkLogToEdit(logEntry || null);
    setIsWorkLogModalOpen(true);
  };
  const handleWorkLogSaved = async (savedLog: WorkLogEntry) => {
    setIsProcessingWorkLog(true);
    try {
        await fetchFacilityData(); 
        setIsWorkLogModalOpen(false);
        setWorkLogToEdit(null);
    } finally {
        setIsProcessingWorkLog(false);
    }
  };
  const handleDeleteWorkLog = async (entryId: string) => {
    if (!window.confirm("Вы уверены, что хотите архивировать эту запись о работе?")) {
        return;
    }
    setDeletingWorkLogId(entryId);
    try {
      await apiService.deleteWorkLogEntry(entryId);
      await fetchFacilityData(); 
      alert("Запись о работе перемещена в архив.");
    } catch (err) {
      alert("Не удалось архивировать запись о работе.");
      console.error(`[MFP] Error archiving work log ID: ${entryId}:`, err);
    } finally {
      setDeletingWorkLogId(null);
    }
  };

  // --- Special Offer Handlers ---
  const handleOpenSpecialOfferModal = (offer?: SpecialOffer) => {
    setOfferToEdit(offer || null);
    setIsSpecialOfferModalOpen(true);
  };

  const handleSpecialOfferSaved = async (savedOffer: SpecialOffer) => {
    setIsProcessingSpecialOffer(true);
    try {
        await fetchFacilityData(); // Refresh all data, including special offers
        setIsSpecialOfferModalOpen(false);
        setOfferToEdit(null);
    } catch (e) {
        console.error("Error refreshing data after special offer save", e);
    } finally {
        setIsProcessingSpecialOffer(false);
    }
  };

  const handleDeleteSpecialOffer = async (offerId: string) => {
    if (!window.confirm("Вы уверены, что хотите удалить это спецпредложение?")) return;
    setDeletingSpecialOfferId(offerId);
    try {
        await apiService.deleteSpecialOffer(offerId);
        await fetchFacilityData();
        alert("Спецпредложение удалено.");
    } catch (err) {
        alert("Не удалось удалить спецпредложение.");
        console.error("Error deleting special offer:", err);
    } finally {
        setDeletingSpecialOfferId(null);
    }
  };

  const handleOpenViewLogsModal = async (offer: SpecialOffer) => {
    setSelectedOfferForLogs(offer);
    setIsViewLogsModalOpen(true);
    setIsLoadingOfferLogs(true);
    try {
        const logs = await apiService.getSpecialOfferViewLogs(offer.id);
        setCurrentViewLogs(logs);
    } catch (err) {
        console.error("Error fetching view logs:", err);
        setCurrentViewLogs([]);
        alert("Не удалось загрузить просмотры.");
    } finally {
        setIsLoadingOfferLogs(false);
    }
  };
  
  const handleOpenFollowUpModal = (log: SpecialOfferViewLog) => {
    setTargetViewLogForFollowUp(log);
    setIsFollowUpModalOpen(true);
    setIsViewLogsModalOpen(false); // Close the logs modal
  };

  const handleSendFollowUp = async (viewLogId: string, message: string) => {
    setIsSendingFollowUp(true);
    try {
        await apiService.sendFollowUpToOfferViewer(viewLogId, message);
        alert("Дополнительное предложение успешно отправлено клиенту.");
        setIsFollowUpModalOpen(false);
        setTargetViewLogForFollowUp(null);
        // Optionally, re-fetch view logs for the offer if the 'Просмотры' modal is still relevant or re-opened
        if (selectedOfferForLogs) {
             handleOpenViewLogsModal(selectedOfferForLogs); // Re-opens and refreshes logs
        }
    } catch (err) {
        alert("Не удалось отправить дополнительное предложение.");
        console.error("Error sending follow-up:", err);
    } finally {
        setIsSendingFollowUp(false);
    }
  };

   // --- Camera Handlers ---
  const handleOpenCameraConnectModal = () => {
    setCameraUrlInput(connectedCameraUrl || ''); // Pre-fill if already connected
    setCameraConnectError(null);
    setIsCameraConnectModalOpen(true);
  };

  const handleConnectCamera = () => {
    if (!cameraUrlInput.trim()) {
      setCameraConnectError("URL потока камеры не может быть пустым.");
      return;
    }
    // Basic URL validation (optional, can be more complex)
    try {
      new URL(cameraUrlInput); // Check if it's a valid URL structure
    } catch (_) {
      setCameraConnectError("Введен некорректный URL.");
      return;
    }

    setIsProcessingCamera(true);
    setCameraConnectError(null);
    
    // Simulate connection delay
    setTimeout(() => {
        if (currentUser) {
            localStorage.setItem(`camera_url_${currentUser.id}`, cameraUrlInput);
            setConnectedCameraUrl(cameraUrlInput);
        }
        setIsCameraConnectModalOpen(false);
        setCameraUrlInput('');
        setIsProcessingCamera(false);
        alert("Камера успешно подключена (имитация).");
    }, 500);
  };

  const handleDisconnectCamera = () => {
    if (!window.confirm("Вы уверены, что хотите отключить камеру?")) return;
    setIsProcessingCamera(true);
     // Simulate disconnection delay
    setTimeout(() => {
        if (currentUser) {
            localStorage.removeItem(`camera_url_${currentUser.id}`);
            setConnectedCameraUrl(null);
        }
        setIsProcessingCamera(false);
        alert("Камера отключена.");
    }, 300);
  };


  if (isInitialLoading) return <div className="text-center py-10"><Spinner size="lg" /></div>;
  
  const generalErrorDisplay = error && !facility && (activeView === 'facility' || activeView === 'products' || activeView === 'specialOffers' || activeView === 'cameras' || activeView === 'marketplace');
  const noFacilityDisplay = !facility && (activeView === 'facility' || activeView === 'products' || activeView === 'specialOffers' || activeView === 'cameras' || activeView === 'marketplace');

  const handleViewChange = (view: ManufacturerView) => {
    setActiveView(view);
    if (view === 'marketplace') {
        setIsLoadingMarketplace(true);
        apiService.getPublishedTurnkeyProjects()
            .then(setMarketplaceProjects)
            .catch(() => setError("Не удалось загрузить проекты с биржи."))
            .finally(() => setIsLoadingMarketplace(false));
    }
  };
  
  const handleShowInterest = async (project: TurnkeyProject) => {
    if (!facility || !project.clientId) {
        alert("Невозможно отправить запрос: отсутствует информация о вашем производстве или о клиенте проекта.");
        return;
    }
    setInterestSendingFor(project.id);
    try {
        const inquiryData = {
            clientId: project.clientId,
            clientName: project.clientName,
            productionFacilityId: facility.id,
            productionFacilityName: facility.name,
            message: `Здравствуйте, ${project.clientName}. Наше производство '${facility.name}' заинтересовано в выполнении вашего проекта '${project.projectName}'. Мы готовы обсудить детали.`,
            turnkeyProjectId: project.id,
        };
        await apiService.submitInquiry(inquiryData);
        alert("Ваш интерес к проекту успешно отправлен клиенту!");
    } catch (err) {
        alert("Не удалось отправить ваш интерес к проекту.");
        console.error(err);
    } finally {
        setInterestSendingFor(null);
    }
  };

  const renderFacilityView = () => facility && (
    <Card title="Управление вашим производством">
      <div className="space-y-4">
        <Input label="Название производства" name="name" value={facility.name} onChange={handleFacilityChange} disabled={isSavingFacilityDetails} />
        <TextArea label="Полный адрес" name="location" value={facility.location} onChange={handleFacilityChange} disabled={isSavingFacilityDetails} />
        <Input label="Город (для поиска)" name="city" value={facility.city} onChange={handleFacilityChange} disabled={isSavingFacilityDetails} />
        <TextArea label="Контактная информация" name="contactInfo" value={facility.contactInfo} onChange={handleFacilityChange} disabled={isSavingFacilityDetails} />
        <Input label="Загрузка производства (%)" name="productionLoad" type="number" min="0" max="100" value={facility.productionLoad} onChange={handleFacilityChange} disabled={isSavingFacilityDetails} />
        <Input label="Примерное время в пути (например, Около 30 мин.)" name="estimatedTravelTime" value={facility.estimatedTravelTime || ''} onChange={handleFacilityChange} disabled={isSavingFacilityDetails} />
        <Input label="Общее время выполнения заказа (например, В среднем 1 неделя)" name="generalTurnaroundTime" value={facility.generalTurnaroundTime || ''} onChange={handleFacilityChange} disabled={isSavingFacilityDetails} />
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категории продукции</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {PRODUCT_CATEGORIES_OPTIONS.map(cat => (
                    <label key={cat} className={`flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 ${isSavingFacilityDetails ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                        <input type="checkbox" className="focus:ring-gray-500 h-4 w-4 text-black border-gray-300 rounded"
                            checked={facility.productCategories.includes(cat)}
                            disabled={isSavingFacilityDetails}
                            onChange={(e) => {
                                const newCategories = e.target.checked ? [...facility.productCategories, cat] : facility.productCategories.filter(c => c !== cat);
                                handleCategoryChange(newCategories);
                            }} />
                        <span>{cat}</span>
                    </label>
                ))}
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Сертификации</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {MOCK_CERTIFICATIONS_OPTIONS.map(cert => (
                    <label key={cert} className={`flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 ${isSavingFacilityDetails ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                        <input type="checkbox" className="focus:ring-gray-500 h-4 w-4 text-black border-gray-300 rounded"
                            checked={facility.certifications?.includes(cert) || false}
                            disabled={isSavingFacilityDetails}
                            onChange={(e) => {
                                const currentCerts = facility.certifications || [];
                                const newCerts = e.target.checked ? [...currentCerts, cert] : currentCerts.filter(c => c !== cert);
                                handleCertificationChange(newCerts);
                            }} />
                        <span>{cert}</span>
                    </label>
                ))}
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL-адреса изображений</label>
            <div className="space-y-2">
                {(facility.images || []).map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <Input type="text" value={url} readOnly className="flex-grow bg-gray-100"/>
                        <Button variant="danger" size="sm" onClick={() => handleRemoveImageUrl(url)} disabled={isSavingFacilityDetails}>Удалить</Button>
                    </div>
                ))}
                <div className="flex items-center space-x-2">
                    <Input type="url" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="https://example.com/image.png" className="flex-grow" disabled={isSavingFacilityDetails}/>
                    <Button variant="secondary" size="sm" onClick={handleAddImageUrl} disabled={isSavingFacilityDetails}>Добавить URL</Button>
                </div>
            </div>
        </div>
        <Button onClick={handleSaveFacility} variant="primary" isLoading={isSavingFacilityDetails}>Сохранить данные производства</Button>
        {error && !isSavingFacilityDetails && <p className="text-gray-700 text-sm mt-2">{error}</p>}
      </div>
    </Card>
  );

  const renderProductsView = () => facility && (
    <Card title="Управление продуктами/услугами" actions={
        <Button onClick={() => handleOpenProductModal()} variant="primary" size="sm" disabled={isProcessingProduct || !!deletingProductId}>Добавить новый продукт</Button>
    }>
      {facility.products.length === 0 && <p className="text-gray-500">Продукты еще не добавлены.</p>}
      <ul className="space-y-3">
        {facility.products.map(p => (
          <li key={p.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{p.name} <span className="text-xs text-gray-500">({p.estimatedProductionTime})</span></p>
                <p className="text-sm text-gray-600">{p.description}</p>
                {p.materials && p.materials.length > 0 && <p className="text-xs text-gray-500 mt-1">Материалы: {p.materials.join(', ')}</p>}
                {p.capacityPerWeek && <p className="text-xs text-gray-500">Производительность: {p.capacityPerWeek}</p>}
              </div>
              <div className="space-x-2 flex-shrink-0 ml-2">
                <Button onClick={() => handleOpenProductModal(p)} variant="outline" size="sm" disabled={isProcessingProduct || !!deletingProductId}>Редакт.</Button>
                <Button 
                    onClick={() => handleDeleteProduct(p.id)} 
                    variant="danger" 
                    size="sm" 
                    isLoading={deletingProductId === p.id}
                    disabled={isProcessingProduct || (!!deletingProductId && deletingProductId !== p.id)}
                >
                    Удалить
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {editingProduct !== null && ( 
        <Modal 
            isOpen={editingProduct !== null} 
            onClose={() => !isProcessingProduct && setEditingProduct(null)} 
            title={editingProduct?.id ? "Редактировать продукт" : "Добавить новый продукт"}
        >
           <ProductForm 
                facilityId={facility.id} 
                product={editingProduct} 
                onSave={handleProductSaved} 
                onCancel={() => setEditingProduct(null)}
                isProcessing={isProcessingProduct}
            />
        </Modal>
      )}
    </Card>
  );

  const renderInquiriesView = () => (
    <Card title="Полученные запросы">
      {inquiries.length === 0 && <p className="text-gray-500">Запросы еще не поступали.</p>}
      <ul className="space-y-3 max-h-96 overflow-y-auto">
          {inquiries.map(inq => {
              const statusInfo = getStatusStyling(inq.status);
              return (
                  <li key={inq.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                      <div className="flex justify-between items-start">
                          <p className="font-semibold text-black">От: {inq.clientName}</p>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${statusInfo.classes}`}>{statusInfo.label}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{inq.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(inq.timestamp).toLocaleString('ru-RU')}</p>
                      {inq.response && <p className="text-sm text-black mt-1 pl-2 border-l-2 border-gray-400"><strong>Ваш ответ:</strong> {inq.response}</p>}
                      {inq.status !== 'Responded' && (
                          <div className="mt-2">
                              <Button 
                                onClick={() => {setRespondingToInquiry(inq); handleMarkInquiryViewed(inq);}} 
                                size="sm" 
                                variant="outline"
                                disabled={isRespondingToInquiry}
                              >
                                Ответить
                              </Button>
                          </div>
                      )}
                  </li>
              );
          })}
      </ul>
      {respondingToInquiry && (
        <Modal 
            isOpen={true} 
            onClose={() => !isRespondingToInquiry && setRespondingToInquiry(null)} 
            title={`Ответ клиенту ${respondingToInquiry.clientName}`}
        >
            <p className="text-sm text-gray-600 mb-2"><strong>Запрос:</strong> {respondingToInquiry.message}</p>
            <TextArea label="Ваш ответ" value={inquiryResponseText} onChange={(e) => setInquiryResponseText(e.target.value)} rows={4} disabled={isRespondingToInquiry} />
            <div className="mt-4 flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setRespondingToInquiry(null)} disabled={isRespondingToInquiry}>Отмена</Button>
                <Button variant="primary" onClick={handleRespondToInquiry} isLoading={isRespondingToInquiry}>Отправить ответ</Button>
            </div>
        </Modal>
      )}
    </Card>
  );

  const renderMarketplaceView = () => {
    return (
        <Card title="Биржа проектов 'под ключ'">
            {isLoadingMarketplace && <Spinner />}
            {!isLoadingMarketplace && marketplaceProjects.length === 0 && <p className="text-gray-500">В настоящее время нет опубликованных проектов. Загляните позже!</p>}
            {!isLoadingMarketplace && marketplaceProjects.length > 0 && (
                <div className="space-y-4">
                    {marketplaceProjects.map(project => (
                        <div key={project.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                            {project.productImageUrl && (
                                <img src={project.productImageUrl} alt={project.projectName} className="w-full md:w-48 h-40 object-cover rounded-md flex-shrink-0" />
                            )}
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg text-gray-900">{project.projectName}</h3>
                                <p className="text-sm text-gray-500 mb-2">от {project.clientName} (опубл. {new Date(project.createdAt).toLocaleDateString()})</p>
                                <p className="text-sm text-gray-700 mb-3">{project.productDescription}</p>
                                {project.stages && project.stages.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 mb-1">ТРЕБУЕМЫЕ ЭТАПЫ:</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {project.stages.map(stage => (
                                                <span key={stage.stage} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{stage.name} ({stage.requiredCategory})</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleShowInterest(project)}
                                        isLoading={interestSendingFor === project.id}
                                        disabled={!!interestSendingFor && interestSendingFor !== project.id}
                                    >
                                        Проявить интерес
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
  };


  const renderWorkHoursView = () => currentUser && (
    <div className="space-y-6">
        <Card title="Сотрудники" actions={
            <Button onClick={() => handleOpenEmployeeModal()} variant="primary" size="sm" disabled={isProcessingEmployee || !!deletingEmployeeId}>Добавить сотрудника</Button>
        }>
            {employees.length === 0 && <p className="text-gray-500">Сотрудники еще не добавлены.</p>}
            <ul className="space-y-2">
                {employees.map(emp => (
                    <li key={emp.id} className="p-3 bg-gray-50 rounded-md border border-gray-200 flex justify-between items-start">
                        <div>
                            <span className="font-semibold">{emp.name}</span>
                            <span className="text-sm text-gray-600 ml-2">({emp.defaultHourlyRate.toLocaleString('ru-RU')} ₽/час)</span>
                        </div>
                        <div className="space-x-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => handleOpenEmployeeModal(emp)} disabled={isProcessingEmployee || !!deletingEmployeeId}>Редакт.</Button>
                            <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleDeleteEmployee(emp.id)}
                                isLoading={deletingEmployeeId === emp.id}
                                disabled={isProcessingEmployee || (!!deletingEmployeeId && deletingEmployeeId !== emp.id)}
                            >
                                Удалить
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>

        <Card title="Учет рабочего времени" actions={
            <Button onClick={() => handleOpenWorkLogModal()} variant="primary" size="sm" disabled={employees.length === 0 || isProcessingWorkLog || !!deletingWorkLogId}>Добавить запись</Button>
        }>
            {employees.length === 0 && <p className="text-gray-500">Для добавления записей о работе сначала добавьте сотрудников.</p>}
            {workLogEntries.length === 0 && employees.length > 0 && <p className="text-gray-500">Записи о работе еще не добавлены.</p>}
            {workLogEntries.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сотрудник</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Часы</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ставка</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оплата</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание Работы</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {workLogEntries.map(log => (
                                <tr key={log.id}>
                                    <td className="px-3 py-2 whitespace-nowrap">{log.employeeName}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{new Date(log.date + 'T00:00:00').toLocaleDateString('ru-RU')}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{log.hoursWorked}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{log.hourlyRate.toLocaleString('ru-RU')} ₽</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{log.calculatedPay.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</td>
                                    <td className="px-3 py-2 whitespace-normal break-words max-w-xs">{log.workDescription || 'N/A'}</td>
                                    <td className="px-3 py-2 whitespace-nowrap space-x-1 align-top">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenWorkLogModal(log)} disabled={isProcessingWorkLog || !!deletingWorkLogId}>Редакт.</Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => handleDeleteWorkLog(log.id)}
                                            isLoading={deletingWorkLogId === log.id}
                                            disabled={isProcessingWorkLog || (!!deletingWorkLogId && deletingWorkLogId !== log.id)}
                                        >
                                            Удалить
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
        {currentUser && isEmployeeModalOpen && (
            <EmployeeModal 
                isOpen={isEmployeeModalOpen} 
                onClose={() => !isProcessingEmployee && (setIsEmployeeModalOpen(false), setEmployeeToEdit(null))}
                facilityOwnerId={currentUser.id}
                employeeToEdit={employeeToEdit}
                onEmployeeSaved={handleEmployeeSaved}
                isProcessing={isProcessingEmployee}
            />
        )}
        {currentUser && isWorkLogModalOpen && (
            <WorkLogModal
                isOpen={isWorkLogModalOpen}
                onClose={() => !isProcessingWorkLog && (setIsWorkLogModalOpen(false), setWorkLogToEdit(null))}
                facilityOwnerId={currentUser.id}
                employees={employees}
                workLogToEdit={workLogToEdit}
                onWorkLogSaved={handleWorkLogSaved}
                isProcessing={isProcessingWorkLog}
            />
        )}
    </div>
  );
  
  const renderArchiveView = () => (
    <div className="space-y-6">
        <Card title="Архив сотрудников">
            {archivedEmployees.length === 0 && <p className="text-gray-500">Архив сотрудников пуст.</p>}
            {archivedEmployees.length > 0 && (
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ставка (по умолч.)</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата архивации</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {archivedEmployees.map(emp => (
                                <tr key={emp.id}>
                                    <td className="px-3 py-2 whitespace-nowrap">{emp.name}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{emp.defaultHourlyRate.toLocaleString('ru-RU')} ₽/час</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{new Date(emp.archivedAt).toLocaleString('ru-RU')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
        <Card title="Архив записей о работе">
            {archivedWorkLogEntries.length === 0 && <p className="text-gray-500">Архив записей о работе пуст.</p>}
            {archivedWorkLogEntries.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сотрудник</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата работы</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Часы</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ставка</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Оплата</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата архивации</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {archivedWorkLogEntries.map(log => (
                                <tr key={log.id}>
                                    <td className="px-3 py-2 whitespace-nowrap">{log.employeeName}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{new Date(log.date + 'T00:00:00').toLocaleDateString('ru-RU')}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{log.hoursWorked}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{log.hourlyRate.toLocaleString('ru-RU')} ₽</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{log.calculatedPay.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</td>
                                    <td className="px-3 py-2 whitespace-normal break-words max-w-xs">{log.workDescription || 'N/A'}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{new Date(log.archivedAt).toLocaleString('ru-RU')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    </div>
  );

  const renderSpecialOffersView = () => facility && currentUser && (
    <Card title="Спецпредложения" actions={
        <Button onClick={() => handleOpenSpecialOfferModal()} variant="primary" size="sm" disabled={isProcessingSpecialOffer || !!deletingSpecialOfferId}>
            Создать предложение
        </Button>
    }>
        {specialOffers.length === 0 && <p className="text-gray-500">Вы еще не создавали спецпредложений.</p>}
        <ul className="space-y-3">
            {specialOffers.map(offer => (
                <li key={offer.id} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div className="flex-grow mb-2 sm:mb-0">
                            <p className="font-semibold text-lg">{offer.title}</p>
                            <p className="text-sm text-gray-600">{offer.description.substring(0, 100)}{offer.description.length > 100 ? '...' : ''}</p>
                            <div className="text-xs text-gray-500 mt-1 space-x-2">
                                <span>Срок: {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validUntil).toLocaleDateString()}</span>
                                <span className={`font-semibold ${offer.isActive && new Date(offer.validUntil) >= new Date() ? 'text-green-600' : 'text-red-600'}`}>
                                    {offer.isActive && new Date(offer.validUntil) >= new Date() ? 'Активно' : 'Неактивно'}
                                </span>
                                <span>Просмотров: {offer.viewCount}</span>
                            </div>
                        </div>
                        <div className="flex space-x-1 flex-shrink-0 self-start sm:self-center">
                            <Button onClick={() => handleOpenSpecialOfferModal(offer)} variant="outline" size="sm" disabled={isProcessingSpecialOffer || !!deletingSpecialOfferId}>Редакт.</Button>
                            <Button 
                                onClick={() => handleDeleteSpecialOffer(offer.id)} 
                                variant="danger" 
                                size="sm" 
                                isLoading={deletingSpecialOfferId === offer.id}
                                disabled={isProcessingSpecialOffer || (!!deletingSpecialOfferId && deletingSpecialOfferId !== offer.id)}
                            >
                                Удалить
                            </Button>
                             <Button onClick={() => handleOpenViewLogsModal(offer)} variant="secondary" size="sm" disabled={isProcessingSpecialOffer || !!deletingSpecialOfferId}>Просмотры</Button>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
        {facility && currentUser && isSpecialOfferModalOpen && (
            <SpecialOfferFormModal
                isOpen={isSpecialOfferModalOpen}
                onClose={() => {setIsSpecialOfferModalOpen(false); setOfferToEdit(null);}}
                facilityId={facility.id}
                facilityOwnerId={currentUser.id}
                facilityName={facility.name}
                offerToEdit={offerToEdit}
                onOfferSaved={handleSpecialOfferSaved}
                isProcessing={isProcessingSpecialOffer}
            />
        )}
        {selectedOfferForLogs && (
            <ViewLogsModal
                isOpen={isViewLogsModalOpen}
                onClose={() => setIsViewLogsModalOpen(false)}
                offer={selectedOfferForLogs}
                viewLogs={currentViewLogs}
                onSendFollowUp={handleOpenFollowUpModal}
                isLoadingLogs={isLoadingOfferLogs}
            />
        )}
        {targetViewLogForFollowUp && selectedOfferForLogs && (
            <FollowUpModal
                isOpen={isFollowUpModalOpen}
                onClose={() => {setIsFollowUpModalOpen(false); setTargetViewLogForFollowUp(null);}}
                viewLog={targetViewLogForFollowUp}
                offerTitle={selectedOfferForLogs.title}
                onSend={handleSendFollowUp}
                isSending={isSendingFollowUp}
            />
        )}
    </Card>
  );

  const renderCamerasView = () => facility && currentUser && (
    <Card title="Камеры на производстве">
      {!connectedCameraUrl ? (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-4">Камеры еще не подключены.</p>
          <Button onClick={handleOpenCameraConnectModal} variant="primary" disabled={isProcessingCamera}>
            Подключить камеру
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-black aspect-video w-full max-w-2xl mx-auto rounded-md flex flex-col items-center justify-center text-white p-4 shadow-lg">
            <CameraIconSVG />
            <p className="mt-2 text-lg font-semibold">Прямая трансляция (имитация)</p>
          </div>
          <p className="text-xs text-center text-gray-500 mt-1 break-all">
            URL: {connectedCameraUrl}
          </p>
          <div className="text-center">
            <Button variant="danger" onClick={handleDisconnectCamera} isLoading={isProcessingCamera} disabled={isProcessingCamera}>
              Отключить камеру
            </Button>
          </div>
        </div>
      )}
      {isCameraConnectModalOpen && (
        <Modal
          isOpen={isCameraConnectModalOpen}
          onClose={() => !isProcessingCamera && setIsCameraConnectModalOpen(false)}
          title="Подключение камеры"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsCameraConnectModalOpen(false)} disabled={isProcessingCamera}>
                Отмена
              </Button>
              <Button variant="primary" onClick={handleConnectCamera} isLoading={isProcessingCamera} className="ml-2">
                Подключить
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Введите URL для потока вашей камеры (например, RTSP, HLS или другой потоковый URL).
              Эта функция является имитацией и не будет отображать реальное видео.
            </p>
            <Input
              label="URL потока камеры"
              id="cameraUrl"
              value={cameraUrlInput}
              onChange={(e) => setCameraUrlInput(e.target.value)}
              placeholder="rtsp://your-camera-stream-url"
              disabled={isProcessingCamera}
            />
            {cameraConnectError && <p className="text-sm text-gray-700">{cameraConnectError}</p>}
          </div>
        </Modal>
      )}
    </Card>
  );


  const TABS_CONFIG: { view: ManufacturerView; label: string; condition?: () => boolean }[] = [
    { view: 'facility', label: 'Производство' },
    { view: 'products', label: 'Продукты' },
    { view: 'inquiries', label: 'Запросы' },
    { view: 'marketplace', label: 'Биржа проектов' },
    { view: 'workHours', label: 'Учет Часов' },
    { view: 'specialOffers', label: 'Спецпредложения' },
    { view: 'cameras', label: 'Камеры' },
    { view: 'archive', label: 'Архив' },
  ];

  return (
    <div className="space-y-6">
        <div className="mb-6 flex gap-2 border-b border-gray-300 pb-2 flex-wrap">
            {TABS_CONFIG.map(tab => {
                if (tab.condition && !tab.condition()) return null;
                return (
                    <Button
                        key={tab.view}
                        onClick={() => handleViewChange(tab.view)}
                        variant={activeView === tab.view ? "primary" : "outline"}
                        className={`
                            p-2 text-sm
                            ${activeView === tab.view ? 'bg-black text-white' : 'text-black border-gray-300 hover:bg-gray-100'}
                        `}
                    >
                        {tab.label}
                    </Button>
                );
            })}
        </div>
        
        {generalErrorDisplay && <p className="text-gray-700 text-center">{error}</p>}
        {noFacilityDisplay && !generalErrorDisplay && <p className="text-gray-600 text-center py-10">Данные о производстве не найдены. Для начала работы с большинством вкладок, пожалуйста, убедитесь, что информация о вашем производстве заполнена или создана (это могло произойти автоматически при первом входе).</p>}


        {activeView === 'facility' && !generalErrorDisplay && !noFacilityDisplay && renderFacilityView()}
        {activeView === 'products' && !generalErrorDisplay && !noFacilityDisplay && renderProductsView()}
        {activeView === 'marketplace' && !generalErrorDisplay && !noFacilityDisplay && renderMarketplaceView()}
        {activeView === 'specialOffers' && !generalErrorDisplay && !noFacilityDisplay && renderSpecialOffersView()}
        {activeView === 'cameras' && !generalErrorDisplay && !noFacilityDisplay && renderCamerasView()}
        {activeView === 'inquiries' && renderInquiriesView()}
        {activeView === 'workHours' && renderWorkHoursView()}
        {activeView === 'archive' && renderArchiveView()}
    </div>
  );
};