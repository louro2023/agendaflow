import React, { useState, useEffect } from 'react';
import { EventRequest, EventStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { X, Check, Trash2, Edit2 } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  existingEvent?: EventRequest | null;
  onSubmit: (title: string, description: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, title: string, description: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  existingEvent, 
  onSubmit,
  onApprove,
  onReject,
  onDelete,
  onEdit
}) => {
  const { isAdmin, currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setDescription(existingEvent.description);
      setIsEditing(false);
    } else {
      setTitle('');
      setDescription('');
      setIsEditing(true); // New event is always "editing" mode
    }
  }, [existingEvent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingEvent && isEditing && onEdit) {
      onEdit(existingEvent.id, title, description);
      setIsEditing(false);
    } else {
      onSubmit(title, description);
      onClose();
    }
  };

  const getStatusColor = (status: EventStatus) => {
    switch(status) {
      case EventStatus.APPROVED: return 'bg-green-100 text-green-800 border-green-200';
      case EventStatus.REJECTED: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const translateStatus = (status: EventStatus) => {
    switch(status) {
      case EventStatus.APPROVED: return 'Aprovado';
      case EventStatus.REJECTED: return 'Rejeitado';
      default: return 'Pendente';
    }
  };

  // Determine if the current user can edit this event
  const canEdit = isAdmin || (existingEvent?.status === EventStatus.PENDING && existingEvent?.requesterId === currentUser?.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white font-semibold text-lg">
            {existingEvent ? 'Detalhes do Evento' : 'Solicitar Novo Evento'}
          </h2>
          <button onClick={onClose} className="text-white hover:bg-indigo-700 p-1 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {existingEvent && !isEditing && (
            <div className={`mb-4 px-3 py-1.5 rounded-md border text-sm font-medium inline-block ${getStatusColor(existingEvent.status)}`}>
              Status: {translateStatus(existingEvent.status)}
            </div>
          )}

          {!existingEvent || isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <div className="text-gray-900 font-semibold">
                  {selectedDate?.split('-').reverse().join('/') || existingEvent?.date.split('-').reverse().join('/')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Evento</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Reunião de Vendas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Detalhes sobre o evento..."
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                 {existingEvent && isAdmin && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onDelete) onDelete(existingEvent.id);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded transition"
                    >
                        <Trash2 size={16} /> Excluir
                    </button>
                 )}
                 <div className="flex ml-auto">
                    <button
                    type="button"
                    onClick={() => {
                        if(existingEvent) setIsEditing(false);
                        else onClose();
                    }}
                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
                    >
                    Cancelar
                    </button>
                    <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm transition"
                    >
                    {existingEvent ? 'Salvar Alterações' : 'Enviar Solicitação'}
                    </button>
                 </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {existingEvent && (
                  <>
                    <div>
                        <p className="text-sm text-gray-500">Data</p>
                        <p className="font-medium text-gray-900">{existingEvent.date.split('-').reverse().join('/')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Título</p>
                        <p className="text-lg font-bold text-gray-900">{existingEvent.title}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Descrição</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{existingEvent.description}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Solicitante</p>
                        <p className="text-gray-700">{existingEvent.requesterName}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
                        {/* Admin Actions for Pending */}
                        {isAdmin && existingEvent.status === EventStatus.PENDING && (
                        <>
                            <button 
                            type="button"
                            onClick={() => onApprove && onApprove(existingEvent.id)}
                            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                            >
                            <Check size={16} /> Aprovar
                            </button>
                            <button 
                            type="button"
                            onClick={() => onReject && onReject(existingEvent.id)}
                            className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
                            >
                            <X size={16} /> Rejeitar
                            </button>
                        </>
                        )}

                        {/* Edit Action */}
                        {canEdit && (
                            <button 
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                <Edit2 size={16} /> Editar
                            </button>
                        )}

                        {/* Admin Explicit Delete Action (Any Status) */}
                        {isAdmin ? (
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (onDelete) onDelete(existingEvent.id);
                                }}
                                className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} /> Excluir
                            </button>
                        ) : (
                            // Common User Cancel Action (Only Pending & Own)
                            existingEvent.status === EventStatus.PENDING && existingEvent.requesterId === currentUser?.id && (
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (onDelete) onDelete(existingEvent.id);
                                    }}
                                    className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-md hover:bg-gray-700 flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} /> Cancelar
                                </button>
                            )
                        )}
                    </div>
                  </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;