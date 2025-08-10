import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TurnkeyProject, ProjectStage } from '../types';
import { apiService } from '../services/apiService';
import { Spinner, Card, Button } from '../components/ui';
import { ProjectStageCard } from '../components/ProjectStageCard';

export const TurnkeyProjectDetailPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<TurnkeyProject | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLaunching, setIsLaunching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProject = useCallback(async () => {
        if (!projectId) {
            setError("ID проекта не указан.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiService.getTurnkeyProjectById(projectId);
            if (data) {
                setProject(data);
            } else {
                setError("Проект не найден.");
            }
        } catch (err) {
            setError("Не удалось загрузить данные проекта.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    const handleStageUpdate = (updatedStage: ProjectStage) => {
        setProject(prevProject => {
            if (!prevProject) return null;
            const newStages = prevProject.stages.map(s =>
                s.stage === updatedStage.stage ? updatedStage : s
            );
            return { ...prevProject, stages: newStages };
        });
    };

    const handleLaunchProject = async () => {
        if (!project || !projectId) return;

        setIsLaunching(true);
        setError(null);
        try {
            await apiService.launchTurnkeyProject(projectId, project.stages);
            alert("Проект успешно запущен! Запросы отправлены выбранным исполнителям.");
            fetchProject(); // Re-fetch project to get updated statuses
        } catch (err) {
            setError("Не удалось запустить проект.");
            console.error(err);
        } finally {
            setIsLaunching(false);
        }
    };
    
    if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
    if (error) return <div className="text-center text-red-500 py-10 text-xl">{error}</div>;
    if (!project) return <div className="text-center text-gray-600 py-10 text-xl">Проект не найден.</div>;

    const canLaunch = project.status !== 'in_progress' && project.status !== 'completed' && project.status !== 'cancelled' && project.stages.every(s => s.selectedFacilityId);

    const getStatusLabel = (status: TurnkeyProject['status']) => {
        const labels = {
            processing_ai: "Обработка AI",
            pending_review: "Ожидает рассмотрения",
            published: "Опубликован на бирже",
            in_progress: "В работе",
            completed: "Завершен",
            cancelled: "Отменен",
        };
        return labels[status] || status;
    }

    return (
        <div className="space-y-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>&larr; Назад к проектам</Button>
            
            <Card>
                <div className="p-2">
                    <h1 className="text-3xl font-bold text-black">{project.projectName}</h1>
                    <p className="mt-2 text-sm text-gray-600">{project.productDescription}</p>
                    <div className="mt-3 text-sm">
                        Статус: <span className="font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-800">{getStatusLabel(project.status)}</span>
                    </div>
                </div>
            </Card>

            {project.stages.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-black">Производственная цепочка</h2>
                    {project.stages.map(stage => (
                        <ProjectStageCard 
                            key={stage.stage} 
                            stage={stage} 
                            onUpdate={handleStageUpdate}
                        />
                    ))}
                </div>
            )}
            
            {(project.status === 'pending_review' || project.status === 'published') && (
                 <Card>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="font-semibold">Запуск проекта</h3>
                            <p className="text-sm text-gray-600">
                            {canLaunch 
                                ? 'Все этапы распределены. Можно запускать проект!' 
                                : 'Назначьте исполнителя для каждого этапа, чтобы запустить проект.'
                            }
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleLaunchProject}
                            disabled={!canLaunch || isLaunching}
                            isLoading={isLaunching}
                        >
                            Запустить проект
                        </Button>
                    </div>
                </Card>
            )}

            {project.status === 'in_progress' && (
                 <Card>
                    <h3 className="font-semibold text-lg text-green-700">Проект в работе</h3>
                    <p className="text-sm text-gray-600 mt-1">Запросы по этапам были отправлены выбранным исполнителям. Вы можете отслеживать их ответы во вкладке "Мои запросы".</p>
                </Card>
            )}
           
        </div>
    );
};
