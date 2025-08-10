
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { TurnkeyProject } from '../types';
import { TextArea, Button, Input, SidePanel } from './ui';

interface TurnkeyProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: TurnkeyProject) => void;
}

export const TurnkeyProjectModal: React.FC<TurnkeyProjectModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const { currentUser } = useAuth();
  const [description, setDescription] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetAndClose = () => {
    if (isLoading) return;
    setDescription('');
    setProjectName('');
    setError(null);
    setIsLoading(false);
    onClose();
  };
  
  // Reset state if the panel is closed externally
  useEffect(() => {
      if (!isOpen) {
          resetAndClose();
      }
  }, [isOpen]);


  const handleSubmit = async () => {
    if (!projectName.trim() || !description.trim()) {
      setError('Название проекта и описание обязательны.');
      return;
    }
    if (!currentUser) {
      setError('Не удалось определить пользователя. Пожалуйста, войдите снова.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const newProjectData = {
        clientId: currentUser.id,
        clientName: currentUser.name,
        productDescription: description.trim(),
        projectName: projectName.trim(),
      };
      const newProject = await apiService.createTurnkeyProject(newProjectData);
      onProjectCreated(newProject); // Parent will close the modal
    } catch (err: any) {
      setError(err.message || "Не удалось отправить проект на обработку.");
      setIsLoading(false); // Stop loading on error
    }
  };


  return (
    <SidePanel
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Создание проекта 'под ключ'"
      footer={
        <>
          <Button variant="secondary" onClick={resetAndClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {isLoading ? 'Отправка...' : 'Отправить на анализ'}
          </Button>
        </>
      }
    >
        <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Опишите конечный продукт, который вы хотите изготовить. AI проанализирует описание в фоновом режиме и разложит его на производственные этапы. Вы получите уведомление, когда проект будет готов к просмотру.
            </p>
            <Input
              label="Название проекта"
              placeholder="Напр., Журнальный столик 'Лофт'"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              disabled={isLoading}
              required
            />
            <TextArea
              label="Описание изделия"
              rows={6}
              placeholder="Например: Мне нужен небольшой журнальный столик: круглая столешница из светлого дуба диаметром 60 см, на трех тонких металлических ножках черного цвета..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={isLoading}
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
    </SidePanel>
  );
};
