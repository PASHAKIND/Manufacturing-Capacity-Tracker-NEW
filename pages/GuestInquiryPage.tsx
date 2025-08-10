
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Input, Button, TextArea } from '../components/ui';
import { apiService } from '../services/apiService';
import { SearchCriteria } from '../types';

export const GuestInquiryPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [telegram, setTelegram] = useState('');
    const [notes, setNotes] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (location.state?.searchCriteria) {
            setSearchCriteria(location.state.searchCriteria);
        }
    }, [location.state]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Пожалуйста, укажите ваше имя.');
            return;
        }
        if (!email.trim() && !phone.trim() && !telegram.trim()) {
            setError('Пожалуйста, укажите хотя бы один способ связи (Email, телефон или Telegram).');
            return;
        }
        if (!searchCriteria) {
            setError('Отсутствуют критерии поиска для заявки.');
            return;
        }

        setIsLoading(true);
        try {
            const finalSearchCriteria: SearchCriteria = {
                ...searchCriteria,
                query: notes ? `${searchCriteria.query} (Комментарий гостя: ${notes})` : searchCriteria.query,
            };

            await apiService.submitDelegationRequest({
                clientName: name.trim(),
                searchCriteria: finalSearchCriteria,
                contactEmail: email.trim() || undefined,
                contactPhone: phone.trim() || undefined,
                contactTelegram: telegram.trim() || undefined,
            });
            setSuccess(true);
        } catch (err) {
            setError('Не удалось отправить заявку. Пожалуйста, попробуйте еще раз.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card title="Заявка успешно отправлена!">
                    <div className="text-center p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-4 text-gray-600">Спасибо за ваше обращение! Наши специалисты свяжутся с вами в ближайшее время по указанным контактам.</p>
                        <Button variant="primary" onClick={() => navigate('/')} className="mt-6">Вернуться на главную</Button>
                    </div>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <Card title="Оставить заявку на подбор">
                <p className="text-sm text-gray-600 mb-6">Не нашли подходящее производство? Опишите вашу задачу, и мы подберем для вас исполнителей. Регистрация не требуется.</p>
                {searchCriteria?.query && (
                    <div className="mb-4 p-3 bg-gray-50 border rounded-md">
                        <p className="text-sm font-medium">Ваш поисковый запрос:</p>
                        <p className="text-sm text-gray-700">"{searchCriteria.query}" в категории "{searchCriteria.productCategory || 'Любая'}"</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Ваше имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Как к вам обращаться?"
                        required
                        disabled={isLoading}
                    />
                    <TextArea
                        label="Дополнительные детали или комментарии"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Любые уточнения, которые помогут нам в поиске"
                        rows={3}
                        disabled={isLoading}
                    />
                    <div>
                        <p className="block text-sm font-medium text-gray-700 mb-2">Контактные данные (укажите хотя бы один)</p>
                        <div className="space-y-3">
                            <Input
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@mail.com"
                                disabled={isLoading}
                            />
                            <Input
                                label="Телефон"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+7 (999) 123-45-67"
                                disabled={isLoading}
                            />
                            <Input
                                label="Telegram"
                                value={telegram}
                                onChange={(e) => setTelegram(e.target.value)}
                                placeholder="@username"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="flex justify-end pt-2 space-x-3">
                        <Button variant="secondary" type="button" onClick={() => navigate(-1)} disabled={isLoading}>Назад</Button>
                        <Button variant="primary" type="submit" isLoading={isLoading}>Отправить заявку</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
