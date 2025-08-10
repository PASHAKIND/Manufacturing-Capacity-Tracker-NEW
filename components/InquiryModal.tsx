
import React, { useState, useEffect } from 'react';
import { ProductionFacility, Inquiry } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { SidePanel, TextArea, Button } from './ui';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: ProductionFacility | null;
  onInquirySent: (inquiry: Inquiry) => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({ isOpen, onClose, facility, onInquirySent }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const handleClose = () => {
    if (isLoading) return;
    setMessage('');
    setError('');
    onClose();
  };

  useEffect(() => {
      if (!isOpen) {
        // Reset state when panel is not open
        setMessage('');
        setError('');
        setIsLoading(false);
      }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!facility || !currentUser) {
      setError('Невозможно отправить запрос. Отсутствует информация.');
      return;
    }
    if (!message.trim()) {
      setError('Сообщение запроса не может быть пустым.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const inquiryData = {
        clientId: currentUser.id,
        clientName: currentUser.name,
        productionFacilityId: facility.id,
        productionFacilityName: facility.name,
        message: message.trim(),
      };
      const newInquiry = await apiService.submitInquiry(inquiryData);
      onInquirySent(newInquiry);
      handleClose();
    } catch (err) {
      console.error("Не удалось отправить запрос:", err);
      setError('Не удалось отправить запрос. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!facility) return null;

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={handleClose}
      title={`Отправить запрос в ${facility.name}`}
      footer={
        <>
          <Button onClick={handleClose} variant="secondary" disabled={isLoading}>Отмена</Button>
          <Button onClick={handleSubmit} variant="primary" isLoading={isLoading} className="ml-2">Отправить запрос</Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Вы отправляете запрос в <span className="font-semibold">{facility.name}</span>. 
          Пожалуйста, четко опишите ваши потребности.
        </p>
        <TextArea
          label="Ваше сообщение"
          id="inquiryMessage"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Например, меня интересует продукт/услуга X. Не могли бы вы предоставить детали по Y?"
          rows={5}
          disabled={isLoading}
        />
        {error && <p className="text-sm text-gray-700">{error}</p>}
      </div>
    </SidePanel>
  );
};
