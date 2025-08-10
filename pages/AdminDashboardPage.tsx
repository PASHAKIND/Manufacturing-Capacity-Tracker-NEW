

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Added
import { ProductionFacility, Inquiry, User, UserRole, DelegationRequest, SearchCriteria, TurnkeyProject } from '../types';
import { apiService } from '../services/apiService';
import { ProductionCard } from '../components/ProductionCard';
import { Spinner, Card, Button, Select, TextArea, Modal, Input } from '../components/ui';
import { useAuth } from '../contexts/AuthContext'; // Added for admin user context

type AdminView = 'users' | 'facilities' | 'inquiries' | 'delegations' | 'turnkey_projects';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser: adminUser } = useAuth(); // Get current admin user
  const [allFacilities, setAllFacilities] = useState<ProductionFacility[]>([]);
  const [allInquiries, setAllInquiries] = useState<Inquiry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [delegationRequests, setDelegationRequests] = useState<DelegationRequest[]>([]);
  const [allTurnkeyProjects, setAllTurnkeyProjects] = useState<TurnkeyProject[]>([]);

  
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isUpdatingDelegation, setIsUpdatingDelegation] = useState<string | null>(null); 
  
  // States for Automated Match Preview
  const [isSearchingForMatches, setIsSearchingForMatches] = useState<string | null>(null); // ID of request being searched
  const [isSendingFinalMatches, setIsSendingFinalMatches] = useState<string | null>(null); // ID of request for which inquiries are being sent
  const [showAutomatedMatchPreviewModal, setShowAutomatedMatchPreviewModal] = useState(false); // This state now controls the side panel
  const [proposedMatchesForPreview, setProposedMatchesForPreview] = useState<ProductionFacility[]>([]);
  const [currentDelegationForPreview, setCurrentDelegationForPreview] = useState<DelegationRequest | null>(null);
  const [automatedMatchError, setAutomatedMatchError] = useState<string | null>(null);

  // States for Turnkey Project Management
  const [selectedTurnkeyProject, setSelectedTurnkeyProject] = useState<TurnkeyProject | null>(null);
  const [isUpdatingTurnkeyProject, setIsUpdatingTurnkeyProject] = useState<string | null>(null);
  const [turnkeyProjectNewStatus, setTurnkeyProjectNewStatus] = useState<TurnkeyProject['status'] | ''>('');
  const [turnkeyProjectAdminNotes, setTurnkeyProjectAdminNotes] = useState('');


  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); 
  const [activeView, setActiveView] = useState<AdminView>('delegations'); // Default to delegations

  const [selectedDelegation, setSelectedDelegation] = useState<DelegationRequest | null>(null);
  const [delegationAdminNotes, setDelegationAdminNotes] = useState('');
  const [delegationNewStatus, setDelegationNewStatus] = useState<DelegationRequest['status'] | ''>('');


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [facilitiesData, inquiriesData, usersData, delegationsData, turnkeyProjectsData] = await Promise.all([
        apiService.getProductionFacilities(),
        apiService.getAllInquiries(),
        apiService.getAllUsers(),
        apiService.getDelegationRequests(),
        apiService.getAllTurnkeyProjects()
      ]);
      setAllFacilities(facilitiesData);
      setAllInquiries(inquiriesData);
      setAllUsers(usersData);
      setDelegationRequests(delegationsData);
      setAllTurnkeyProjects(turnkeyProjectsData);
    } catch (err) {
      setError('Не удалось загрузить данные.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean | undefined) => {
    setIsUpdatingUser(true);
    try {
      const updatedUser = await apiService.updateUser(userId, { isActive: !currentStatus });
      setAllUsers(prevUsers => prevUsers.map(u => u.id === userId ? updatedUser : u));
    } catch (err) {
      alert("Не удалось обновить статус пользователя.");
      console.error(err);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleViewFacilityDetails = (facility: ProductionFacility) => {
    navigate(`/facility/${facility.id}`);
  };

  const getStatusStyling = (status: Inquiry['status'] | DelegationRequest['status'] | TurnkeyProject['status']): {label: string, classes: string} => {
    switch (status) {
      case 'New': 
      case 'Новая': 
        return { label: status, classes: 'bg-blue-100 text-blue-800 border border-blue-300'};
      case 'processing_ai':
        return { label: 'Обработка AI', classes: 'bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse'};
      case 'pending_review':
        return { label: 'Ожидает проверки', classes: 'bg-yellow-100 text-yellow-800 border border-yellow-300'};
      case 'published':
        return { label: 'Опубликован', classes: 'bg-purple-100 text-purple-800 border border-purple-300'};
      case 'Viewed': 
      case 'В работе':
      case 'in_progress':
        return { label: status, classes: 'bg-yellow-100 text-yellow-800 border border-yellow-300'};
      case 'Предложения отправлены':
        return { label: status, classes: 'bg-indigo-100 text-indigo-800 border border-indigo-300'};
      case 'Responded': 
      case 'Выполнена':
      case 'completed': 
        return { label: status, classes: 'bg-green-100 text-green-800 border border-green-300'};
      case 'Отменена':
      case 'cancelled':
        return { label: status, classes: 'bg-red-100 text-red-800 border border-red-300'};
      default: return {label: status, classes: 'bg-gray-100 text-gray-800 border border-gray-300'};
    }
  }
  
  const delegationStatusOptions: { value: DelegationRequest['status'], label: string }[] = [
    { value: 'Новая', label: 'Новая' },
    { value: 'В работе', label: 'В работе' },
    { value: 'Предложения отправлены', label: 'Предложения отправлены (авто)' },
    { value: 'Выполнена', label: 'Выполнена' },
    { value: 'Отменена', label: 'Отменена' },
  ];

  const turnkeyProjectStatusOptions: { value: TurnkeyProject['status'], label: string }[] = [
    { value: 'processing_ai', label: 'Обработка AI' },
    { value: 'pending_review', label: 'Ожидает проверки' },
    { value: 'published', label: 'Опубликован (виден производителям)' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'completed', label: 'Завершен' },
    { value: 'cancelled', label: 'Отменен' },
  ];

  const handleOpenDelegationModal = (request: DelegationRequest) => {
    setSelectedDelegation(request);
    setDelegationAdminNotes(request.adminNotes || '');
    setDelegationNewStatus(request.status);
  };

  const handleSaveDelegationUpdate = async () => {
    if (!selectedDelegation || !delegationNewStatus) return;

    setIsUpdatingDelegation(selectedDelegation.id);
    try {
      await apiService.updateDelegationRequestStatus(selectedDelegation.id, delegationNewStatus, delegationAdminNotes);
      fetchData(); 
      setSelectedDelegation(null); 
    } catch (err: any) {
      alert(`Не удалось обновить заявку на подбор: ${err.message}`);
      console.error(err);
    } finally {
      setIsUpdatingDelegation(null);
    }
  };
  
  const handleShowAutomatedMatchPreview = async (delegationRequest: DelegationRequest) => {
    if (!adminUser) {
        alert("Ошибка: не удалось определить администратора для выполнения операции.");
        return;
    }
    if (delegationRequest.status !== 'Новая' && delegationRequest.status !== 'В работе') {
        alert(`Автоматический подбор не может быть запущен для заявки со статусом "${delegationRequest.status}".`);
        return;
    }

    setIsSearchingForMatches(delegationRequest.id);
    setAutomatedMatchError(null);
    setCurrentDelegationForPreview(delegationRequest);

    try {
        const matchedFacilities = await apiService.getProductionFacilities(delegationRequest.searchCriteria);
        setProposedMatchesForPreview(matchedFacilities);
        if (matchedFacilities.length === 0) {
            setAutomatedMatchError("Подходящих производств по указанным критериям не найдено.");
        }
        setShowAutomatedMatchPreviewModal(true); // Show side panel
    } catch (err: any) {
        console.error("Error fetching facilities for automated match preview:", err);
        setAutomatedMatchError(`Ошибка при поиске производств: ${err.message}`);
        setShowAutomatedMatchPreviewModal(true); // Show side panel to display error
    } finally {
        setIsSearchingForMatches(null);
    }
  };

  const handleConfirmAndSendAutomatedInquiries = async () => {
    if (!currentDelegationForPreview || !adminUser) {
        setAutomatedMatchError("Ошибка: отсутствует заявка или информация об администраторе для отправки.");
        return;
    }
    if (proposedMatchesForPreview.length === 0) {
        setAutomatedMatchError("Нет производств для отправки запросов. Операция отменена.");
        return;
    }

    setIsSendingFinalMatches(currentDelegationForPreview.id);
    setAutomatedMatchError(null);
    try {
        const result = await apiService.sendAutomatedInquiriesForDelegation(
            currentDelegationForPreview,
            proposedMatchesForPreview,
            adminUser
        );
        alert(`Автоматический подбор завершен. Отправлено запросов: ${result.inquiriesSentCount}. Статус заявки обновлен.`);
        setShowAutomatedMatchPreviewModal(false); // Close side panel
        setCurrentDelegationForPreview(null);
        setProposedMatchesForPreview([]);
        fetchData(); // Refresh all data
    } catch (err: any) {
        console.error("Error sending automated inquiries:", err);
        setAutomatedMatchError(`Ошибка при отправке запросов: ${err.message}`);
    } finally {
        setIsSendingFinalMatches(null);
    }
  };

  const closeAutomatedMatchPreviewPanel = () => {
    if (isSendingFinalMatches) return; // Don't close if sending
    setShowAutomatedMatchPreviewModal(false);
    setCurrentDelegationForPreview(null);
    setProposedMatchesForPreview([]);
    setAutomatedMatchError(null);
  };

  const handleOpenTurnkeyProjectModal = (project: TurnkeyProject) => {
    setSelectedTurnkeyProject(project);
    setTurnkeyProjectAdminNotes(project.adminNotes || '');
    setTurnkeyProjectNewStatus(project.status);
  };
  
  const handleSaveTurnkeyProjectUpdate = async () => {
    if (!selectedTurnkeyProject || !turnkeyProjectNewStatus) return;
    setIsUpdatingTurnkeyProject(selectedTurnkeyProject.id);
    try {
        await apiService.updateTurnkeyProject(selectedTurnkeyProject.id, {
            status: turnkeyProjectNewStatus,
            adminNotes: turnkeyProjectAdminNotes
        });
        await fetchData();
        setSelectedTurnkeyProject(null);
    } catch (err: any) {
        alert(`Не удалось обновить проект: ${err.message}`);
    } finally {
        setIsUpdatingTurnkeyProject(null);
    }
  };


  const renderSearchCriteria = (criteria: SearchCriteria) => (
    <ul className="list-disc list-inside text-xs text-gray-600 mt-1 space-y-0.5">
      {criteria.query && <li><strong>Запрос:</strong> {criteria.query}</li>}
      {criteria.productCategory && <li><strong>Категория:</strong> {criteria.productCategory}</li>}
      {criteria.minLoad !== undefined && <li><strong>Мин. загрузка:</strong> {criteria.minLoad}%</li>}
      {criteria.maxLoad !== undefined && <li><strong>Макс. загрузка:</strong> {criteria.maxLoad}%</li>}
      {criteria.certifications && criteria.certifications.length > 0 && (
        <li><strong>Сертификации:</strong> {criteria.certifications.join(', ')}</li>
      )}
      {criteria.latitude && criteria.longitude && (
        <li><strong>Локация (прибл.):</strong> {criteria.latitude.toFixed(3)}, {criteria.longitude.toFixed(3)}</li>
      )}
       {!(criteria.query || criteria.productCategory || criteria.minLoad !== undefined || criteria.maxLoad !== undefined || (criteria.certifications && criteria.certifications.length > 0)) && (
        <li>Критерии не указаны или общие.</li>
      )}
    </ul>
  );


  const renderUsersView = () => (
    <Card title={`Управление пользователями (${allUsers.length})`}>
      {allUsers.length === 0 && <p className="text-gray-500">Нет зарегистрированных пользователей.</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button
                    variant={user.isActive ? "danger" : "secondary"}
                    size="sm"
                    onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                    isLoading={isUpdatingUser}
                  >
                    {user.isActive ? 'Деактивировать' : 'Активировать'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderFacilitiesView = () => (
    <Card title={`Все производственные объекты (${allFacilities.length})`}>
      {allFacilities.length === 0 && <p className="text-gray-500">Нет зарегистрированных производственных объектов.</p>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[600px] overflow-y-auto p-1">
        {allFacilities.map(facility => (
          <ProductionCard
            key={facility.id}
            facility={facility}
            onViewDetails={handleViewFacilityDetails}
          />
        ))}
      </div>
    </Card>
  );

  const renderInquiriesView = () => (
     <Card title={`Все запросы клиентов (${allInquiries.length})`}>
        {allInquiries.length === 0 && <p className="text-gray-500">Запросы не найдены.</p>}
        <ul className="space-y-3 max-h-[600px] overflow-y-auto p-1">
            {allInquiries.map(inq => {
                const statusInfo = getStatusStyling(inq.status);
                return (
                    <li key={inq.id} className={`p-3 bg-white rounded-md border shadow-sm ${inq.isAutoGenerated ? 'border-indigo-300' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-black">Кому: {inq.productionFacilityName}</p>
                            <p className="text-sm text-gray-500">От: {inq.clientName} {inq.isAutoGenerated && <span className="text-xs text-indigo-600">(Подобран Администратором)</span>}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${statusInfo.classes}`}>
                              {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{inq.message}</p>
                        {inq.response && <p className="text-sm text-black mt-1 pl-2 border-l-2 border-gray-400"><strong>Ответ:</strong> {inq.response}</p>}
                        <p className="text-xs text-gray-400 mt-1">{new Date(inq.timestamp).toLocaleString('ru-RU')}</p>
                        {inq.originalDelegationRequestId && <p className="text-xs text-gray-400">Связанная заявка на подбор: #{inq.originalDelegationRequestId.slice(-6)}</p>}
                    </li>
                );
            })}
        </ul>
      </Card>
  );

  const renderDelegationsView = () => (
    <Card title={`Заявки на подбор от клиентов (${delegationRequests.length})`}>
      {delegationRequests.length === 0 && <p className="text-gray-500">Заявок на делегированный подбор нет.</p>}
      <ul className="space-y-4 max-h-[700px] overflow-y-auto p-1">
        {delegationRequests.map(req => {
          const statusInfo = getStatusStyling(req.status);
          const canAutomatch = (req.status === 'Новая' || req.status === 'В работе') && !!req.clientId;
          return (
            <li key={req.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                <div>
                  {req.clientId ? (
                     <p className="font-semibold text-black">Клиент: {req.clientName} (ID: <span className="font-normal text-xs">{req.clientId}</span>)</p>
                  ) : (
                     <p className="font-semibold text-black">Клиент (гость): {req.clientName}</p>
                  )}
                  <p className="text-xs text-gray-500">Дата заявки: {new Date(req.timestamp).toLocaleString('ru-RU')}</p>
                  {!req.clientId && (
                      <div className="mt-2 text-xs text-gray-600 border-l-2 border-gray-300 pl-2">
                        <p className="font-medium">Контакты гостя:</p>
                        {req.contactEmail && <p>Email: <a href={`mailto:${req.contactEmail}`} className="text-black hover:underline">{req.contactEmail}</a></p>}
                        {req.contactPhone && <p>Телефон: <a href={`tel:${req.contactPhone}`} className="text-black hover:underline">{req.contactPhone}</a></p>}
                        {req.contactTelegram && <p>Telegram: {req.contactTelegram}</p>}
                      </div>
                  )}
                </div>
                <span className={`mt-2 sm:mt-0 px-3 py-1 text-xs rounded-full self-start ${statusInfo.classes}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-700">Критерии поиска:</p>
                {renderSearchCriteria(req.searchCriteria)}
              </div>
              {req.adminNotes && (
                 <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700">Заметки администратора:</p>
                    <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded whitespace-pre-wrap">{req.adminNotes}</p>
                 </div>
              )}
              <div className="flex space-x-2 mt-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDelegationModal(req)}
                    isLoading={isUpdatingDelegation === req.id}
                    disabled={(!!isUpdatingDelegation && isUpdatingDelegation !== req.id) || !!isSearchingForMatches || !!isSendingFinalMatches}
                >
                    {isUpdatingDelegation === req.id ? "Обновление..." : "Управление заявкой"}
                </Button>
                {canAutomatch && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleShowAutomatedMatchPreview(req)}
                        isLoading={isSearchingForMatches === req.id}
                        disabled={(!!isSearchingForMatches && isSearchingForMatches !== req.id) || !!isUpdatingDelegation || !!isSendingFinalMatches}
                    >
                        {isSearchingForMatches === req.id ? "Поиск..." : "Подобрать предложения"}
                    </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );

  const renderTurnkeyProjectsView = () => (
    <Card title={`Проекты "под ключ" (${allTurnkeyProjects.length})`}>
        {allTurnkeyProjects.length === 0 && <p className="text-gray-500">Проекты 'под ключ' еще не создавались.</p>}
        <ul className="space-y-4 max-h-[700px] overflow-y-auto p-1">
            {allTurnkeyProjects.map(project => {
                const statusInfo = getStatusStyling(project.status);
                return (
                    <li key={project.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                            <div>
                                <p className="font-semibold text-black">{project.projectName}</p>
                                <p className="text-sm text-gray-500">От: {project.clientName} {project.clientId ? `(ID: ${project.clientId})` : '(Гость)'}</p>
                                <p className="text-xs text-gray-500">Создан: {new Date(project.createdAt).toLocaleString('ru-RU')}</p>
                            </div>
                             <span className={`mt-2 sm:mt-0 px-3 py-1 text-xs rounded-full self-start ${statusInfo.classes}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                        <p className="text-sm my-2 p-2 bg-white border rounded-md">{project.productDescription}</p>
                        {!project.clientId && (
                             <div className="my-2 text-xs text-gray-600 border-l-2 border-gray-300 pl-2">
                                <p className="font-medium">Контакты гостя:</p>
                                {project.contactEmail && <p>Email: <a href={`mailto:${project.contactEmail}`} className="text-black hover:underline">{project.contactEmail}</a></p>}
                                {project.contactPhone && <p>Телефон: <a href={`tel:${project.contactPhone}`} className="text-black hover:underline">{project.contactPhone}</a></p>}
                                {project.contactTelegram && <p>Telegram: {project.contactTelegram}</p>}
                            </div>
                        )}
                        {project.adminNotes && (
                            <div className="my-2">
                                <p className="text-sm font-medium text-gray-700">Заметки администратора:</p>
                                <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded whitespace-pre-wrap">{project.adminNotes}</p>
                            </div>
                        )}
                        <div className="flex justify-end mt-3">
                            <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenTurnkeyProjectModal(project)}
                                disabled={!!isUpdatingTurnkeyProject}
                            >
                                Управление проектом
                            </Button>
                        </div>
                    </li>
                );
            })}
        </ul>
    </Card>
  );


  if (isLoading) return <div className="text-center py-10"><Spinner size="lg" /></div>;
  if (error) return <p className="text-gray-700 text-center">{error}</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-black">Панель Администратора</h1>
        <div className="mb-6 flex gap-2 border-b border-gray-300 pb-2 flex-wrap">
            {(['users', 'facilities', 'inquiries', 'delegations', 'turnkey_projects'] as AdminView[]).map(view => (
                <Button
                    key={view}
                    onClick={() => setActiveView(view)}
                    variant={activeView === view ? "primary" : "outline"}
                    className={`
                        p-2 text-sm
                        ${activeView === view ? 'bg-black text-white' : 'text-black border-gray-300 hover:bg-gray-100'}
                    `}
                >
                    {view === 'users' && 'Пользователи'}
                    {view === 'facilities' && 'Объекты'}
                    {view === 'inquiries' && 'Запросы'}
                    {view === 'delegations' && 'Заявки на подбор'}
                    {view === 'turnkey_projects' && 'Проекты "под ключ"'}
                </Button>
            ))}
        </div>

        {activeView === 'users' && renderUsersView()}
        {activeView === 'facilities' && renderFacilitiesView()}
        {activeView === 'inquiries' && renderInquiriesView()}
        {activeView === 'delegations' && renderDelegationsView()}
        {activeView === 'turnkey_projects' && renderTurnkeyProjectsView()}


      {selectedDelegation && (
        <Modal 
            isOpen={!!selectedDelegation} 
            onClose={() => setSelectedDelegation(null)} 
            title={`Управление заявкой #${selectedDelegation.id.slice(-6)} от ${selectedDelegation.clientName}`}
        >
            <div className="space-y-4">
                <div>
                    <p className="text-sm font-medium text-gray-700">Критерии поиска клиента:</p>
                    {renderSearchCriteria(selectedDelegation.searchCriteria)}
                </div>
                <Select
                    label="Статус заявки"
                    options={delegationStatusOptions}
                    value={delegationNewStatus}
                    onChange={(e) => setDelegationNewStatus(e.target.value as DelegationRequest['status'])}
                    disabled={!!isUpdatingDelegation}
                />
                <TextArea
                    label="Заметки администратора"
                    value={delegationAdminNotes}
                    onChange={(e) => setDelegationAdminNotes(e.target.value)}
                    rows={4}
                    placeholder="Ваши комментарии по работе с заявкой..."
                    disabled={!!isUpdatingDelegation}
                />
                 <div className="flex justify-end space-x-2 pt-2">
                    <Button 
                        variant="secondary" 
                        onClick={() => setSelectedDelegation(null)} 
                        disabled={!!isUpdatingDelegation}
                    >
                        Отмена
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSaveDelegationUpdate} 
                        isLoading={isUpdatingDelegation === selectedDelegation.id}
                        disabled={!!isUpdatingDelegation && isUpdatingDelegation !== selectedDelegation.id}
                    >
                        Сохранить изменения
                    </Button>
                </div>
            </div>
        </Modal>
      )}
      
      {selectedTurnkeyProject && (
          <Modal
            isOpen={!!selectedTurnkeyProject}
            onClose={() => setSelectedTurnkeyProject(null)}
            title={`Управление проектом #${selectedTurnkeyProject.id.slice(-6)}`}
          >
              <div className="space-y-4">
                  <p><strong>Проект:</strong> {selectedTurnkeyProject.projectName}</p>
                   <Select
                    label="Статус проекта"
                    options={turnkeyProjectStatusOptions}
                    value={turnkeyProjectNewStatus}
                    onChange={(e) => setTurnkeyProjectNewStatus(e.target.value as TurnkeyProject['status'])}
                    disabled={!!isUpdatingTurnkeyProject}
                />
                <TextArea
                    label="Заметки администратора"
                    value={turnkeyProjectAdminNotes}
                    onChange={(e) => setTurnkeyProjectAdminNotes(e.target.value)}
                    rows={4}
                    placeholder="Комментарии по проекту..."
                    disabled={!!isUpdatingTurnkeyProject}
                />
                 <div className="flex justify-end space-x-2 pt-2">
                    <Button 
                        variant="secondary" 
                        onClick={() => setSelectedTurnkeyProject(null)} 
                        disabled={!!isUpdatingTurnkeyProject}
                    >
                        Отмена
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSaveTurnkeyProjectUpdate} 
                        isLoading={isUpdatingTurnkeyProject === selectedTurnkeyProject.id}
                        disabled={!!isUpdatingTurnkeyProject && isUpdatingTurnkeyProject !== selectedTurnkeyProject.id}
                    >
                        Сохранить изменения
                    </Button>
                </div>
              </div>
          </Modal>
      )}

      {/* Automated Match Preview Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-3/5 bg-white shadow-2xl z-50 p-6 overflow-y-auto transition-transform duration-300 ease-in-out transform ${
          showAutomatedMatchPreviewModal && currentDelegationForPreview ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="automated-match-panel-title"
      >
        {currentDelegationForPreview && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 id="automated-match-panel-title" className="text-xl font-semibold text-gray-800">
                Предварительный просмотр для заявки #{currentDelegationForPreview.id.slice(-6)}
              </h2>
              <Button
                onClick={closeAutomatedMatchPreviewPanel}
                variant="outline"
                size="sm"
                className="p-1"
                aria-label="Закрыть панель предпросмотра"
                disabled={isSendingFinalMatches === currentDelegationForPreview.id}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Критерии клиента ({currentDelegationForPreview.clientName}):</p>
                {renderSearchCriteria(currentDelegationForPreview.searchCriteria)}
              </div>
              {automatedMatchError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{automatedMatchError}</p>}
              
              {proposedMatchesForPreview.length > 0 && !automatedMatchError && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Предложенные производства ({proposedMatchesForPreview.length}):</p>
                  <ul className="max-h-60 overflow-y-auto space-y-2 text-xs border p-2 rounded-md bg-gray-50">
                    {proposedMatchesForPreview.map(facility => (
                      <li key={facility.id} className="p-1.5 border-b last:border-b-0">
                        <span className="font-semibold">{facility.name}</span> ({facility.city}) - Загрузка: {facility.productionLoad}%
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {proposedMatchesForPreview.length === 0 && !automatedMatchError && (
                <p className="text-sm text-gray-600">Подходящих производств не найдено по текущим критериям.</p>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t mt-6">
                <Button
                  variant="secondary"
                  onClick={closeAutomatedMatchPreviewPanel}
                  disabled={isSendingFinalMatches === currentDelegationForPreview.id}
                >
                  Отмена
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmAndSendAutomatedInquiries}
                  isLoading={isSendingFinalMatches === currentDelegationForPreview.id}
                  disabled={
                    proposedMatchesForPreview.length === 0 || 
                    (!!isSendingFinalMatches && isSendingFinalMatches !== currentDelegationForPreview.id) || 
                    (!!automatedMatchError && !automatedMatchError.startsWith("Подходящих производств не найдено"))
                  }
                >
                  {isSendingFinalMatches === currentDelegationForPreview.id ? "Отправка..." : "Отправить запросы"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      {/* End Automated Match Preview Side Panel */}
    </div>
  );
};