// components/Modal.tsx
'use client';

import { useState } from 'react';
import { X, LogIn, LogOut, UserCircle, Package, DoorOpen, CheckCircle } from 'lucide-react';


type ModalProps = {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    // Si el modal está cerrado, no renderiza nada
    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl">

                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Cerrar"
                >
                    <X size={20} />
                </button>

                <div className="p-5">
                    {/* Avatar + nombre */}
                    <div className="flex items-center gap-4 mb-5">
                        <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-medium text-lg ring-2 ring-amber-400 flex-shrink-0">
                            nombre
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm text-gray-500">
                                    proveedor
                                </span>
                                <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
                                    Activo
                                </span>
                            </div>
                            <p className="text-[1.1rem] font-semibold text-amber-600 leading-tight">
                                nombrevisitante
                            </p>
                        </div>
                    </div>

                    {/* Horario */}
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Horario de visita:</p>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2.5">
                                <LogIn size={18} className="text-amber-500 flex-shrink-0" />
                                <span className="text-sm text-gray-800">
                                    hora
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <LogOut size={18} className="text-amber-500 flex-shrink-0" />
                                salida
                            </div>
                        </div>
                    </div>

                    {/* Residente vinculado */}
                    <div className="border-t border-gray-100 pt-4 mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Residente vinculado:</p>
                        <div className="flex items-center gap-2.5">
                            <UserCircle size={18} className="text-amber-500 flex-shrink-0" />
                            <span className="text-sm text-gray-800">motivo</span>
                        </div>
                    </div>

                    {/* Motivo */}
                    <div className="border-t border-gray-100 pt-4 mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Motivo de visita:</p>
                        <div className="flex items-center gap-2.5">
                            <Package size={18} className="text-amber-500 flex-shrink-0" />
                            <span className="text-sm text-gray-800">motivo</span>
                        </div>
                    </div>

                    {/* Comentario */}
                    
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-sm font-medium text-gray-700 mb-1.5">
                                Comentario{' '}
                                <span className="text-gray-400 font-normal">(opcional)</span>
                            </p>
                            <textarea
                                value={""}
                               
                                placeholder="Ej. Salida sin incidentes..."
                                rows={2}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                    
                </div>

                {/* Botón */}
                <div className="px-5 pb-5">
                    
                        <p className="mb-2 text-center text-xs text-red-500">error</p>
                    
                   
                        <div className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-green-100 text-green-700 font-medium text-sm">
                            <CheckCircle size={18} />
                            Salida registrada correctamente
                        </div>
                   
                        <button
                            
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-400 text-amber-900 font-semibold text-sm hover:bg-amber-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                        >
                            <DoorOpen size={18} />
                            
                        </button>
                    
                </div>

            </div>
        </div>
    );
}