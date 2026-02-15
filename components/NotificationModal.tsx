import React from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void; // New prop for confirmation action
    title: string;
    message: string;
    type?: NotificationType;
    confirmText?: string;
    cancelText?: string;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="w-12 h-12 text-green-500" />;
            case 'error': return <AlertCircle className="w-12 h-12 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
            case 'info': return <Info className="w-12 h-12 text-blue-500" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success': return 'bg-green-50';
            case 'error': return 'bg-red-50';
            case 'warning': return 'bg-yellow-50';
            case 'info': return 'bg-blue-50';
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'success': return 'bg-green-500 hover:bg-green-600';
            case 'error': return 'bg-red-500 hover:bg-red-600';
            case 'warning': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'info': return 'bg-blue-500 hover:bg-blue-600';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`p-6 flex flex-col items-center text-center ${getBgColor()}`}>
                    <div className="mb-4 p-3 bg-white rounded-full shadow-sm">
                        {getIcon()}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                    <p className="text-slate-600 leading-relaxed">{message}</p>
                </div>

                <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
                    {onConfirm ? (
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 py-3 px-4 rounded-xl text-white font-bold transition-colors shadow-lg active:scale-95 ${getButtonColor()}`}
                            >
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className={`w-full py-3 px-4 rounded-xl text-white font-bold transition-colors shadow-lg active:scale-95 ${getButtonColor()}`}
                        >
                            Entendi
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
