import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TurnkeyProject } from '../types';
import { Button, Spinner } from './ui';

interface TurnkeyProjectCardProps {
  project: TurnkeyProject;
}

const statusConfig: Record<string, any> = {
    processing_ai: {
        label: "Идет анализ AI...",
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        textColor: 'text-yellow-800',
        showSpinner: true,
    },
    pending_review: {
        label: "Готов к просмотру",
        bgColor: 'bg-green-50',
        borderColor: 'border-green-400',
        textColor: 'text-green-800',
        showSpinner: false,
    },
     published: {
        label: "Опубликован",
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-300',
        textColor: 'text-indigo-800',
        showSpinner: false,
    },
    in_progress: {
        label: "В работе",
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-800',
        showSpinner: false,
    },
    completed: {
        label: "Завершен",
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        textColor: 'text-gray-800',
        showSpinner: false,
    },
    cancelled: {
        label: "Отменен",
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        textColor: 'text-red-800',
        showSpinner: false,
    }
};


export const TurnkeyProjectCard: React.FC<TurnkeyProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  const config = statusConfig[project.status] || statusConfig.completed;

  const handleManageProject = () => {
      navigate(`/project/${project.id}`);
  };

  const canManageProject = ['pending_review', 'published', 'in_progress'].includes(project.status);

  return (
    <div className={`p-4 border-l-4 rounded-r-lg shadow-sm transition-colors duration-500 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
        <div className="flex-grow">
            <h3 className="font-bold text-lg text-gray-900">{project.projectName}</h3>
            <p className="text-sm text-gray-600 italic mt-1">"{project.productDescription}"</p>
        </div>
        <div className={`flex items-center text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${config.textColor}`}>
           {config.showSpinner && <Spinner size="sm" className="mr-2" />}
           {config.label}
        </div>
      </div>

      <div className="mt-4">
        {project.status === 'pending_review' && project.stages.length > 0 && (
             <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Сгенерированные этапы:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-800">
                    {project.stages.map(stage => (
                        <li key={stage.stage}>{stage.name}</li>
                    ))}
                </ol>
             </div>
        )}
        {project.status === 'cancelled' && project.adminNotes && (
             <p className="text-xs text-red-700 bg-red-100 p-2 rounded-md">Причина: {project.adminNotes}</p>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        {canManageProject && (
            <Button variant="outline" size="sm" onClick={handleManageProject}>
                Управлять проектом
            </Button>
        )}
      </div>
    </div>
  );
};
