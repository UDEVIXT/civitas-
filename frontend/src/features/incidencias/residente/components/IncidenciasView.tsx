"use client";

import { useCallback, useEffect } from 'react';

// My components
import { toast } from "sonner"

// Components UI
import { IncidenciaDialog } from './IncidenciaDialog';

// Hooks
import { useLocationStore } from '../hooks/useLocationStore';
import { useReverseGeocoding } from '../hooks/useGeo';
import { useIncidenciaForm } from '../hooks/useIncidenciaForm';
import { useSubmitIncidencia } from '../hooks/useSubmitIncidencia';

function IncidenciasView() {
    const { position, setPosition } = useLocationStore();
    const { data: address, isLoading: isAddressLoading } = useReverseGeocoding(position);
    
    const {
        formData,
        errors,
        isSubmitting,
        setField,
        setErrors,
        clearErrors,
        validateForm
    } = useIncidenciaForm();
    
    const submitMutation = useSubmitIncidencia();

    const handleFile = useCallback((files: File[]) => {
        if (files && setField) {
            setTimeout(() => {
                setField('imagen', files);
            }, 0);
        }
    }, [setField]);

    const handleLocationSelect = useCallback((coords: { longitude: number; latitude: number }) => {
        if (setPosition) {
            setPosition({ lat: coords.latitude, lng: coords.longitude });
        }
        if (setField) {
            setField('ubicacion', {
                lat: coords.latitude,
                lng: coords.longitude,
                direccion: address || ''
            });

            setTimeout(() => {
                if (errors.ubicacion && setErrors) {
                    setErrors({ ...errors, ubicacion: '' });
                }
            }, 500);
        }
    }, [setPosition, address, setField, errors.ubicacion, setErrors]);

    const handleMapClick = useCallback((lng: number, lat: number) => {
        if (setPosition) {
            setPosition({ lat, lng });
        }
        if (setField) {
            setField('ubicacion', {
                lat,
                lng,
                direccion: address || ''
            });

            setTimeout(() => {
                if (errors.ubicacion && setErrors) {
                    setErrors({ ...errors, ubicacion: '' });
                }
            }, 500);
        }
    }, [setPosition, address, setField, errors.ubicacion, setErrors]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        const isValid = validateForm();

        if (!isValid) return;

        submitMutation.mutate(formData as any, {
            onSuccess: (data) => {
                if (data?.success) {
                    toast.success("Reporte creado exitosamente");
                }
            },
            onError: (error: any) => {
                toast.error(
                    error.response?.data?.message || 
                    "Error al crear el reporte"
                );
            }
        });

    }, [validateForm, submitMutation, formData]);

    const handleFieldChange = useCallback((field: string, value: any) => {
        if (setField && field) {
            setField(field as any, value);
        }

        if (errors[field] && setErrors) {
            setErrors({ ...errors, [field]: '' });
        }
    }, [setField, errors, setErrors]);

    useEffect(() => {
        if (address && position && setField) {
            setField('ubicacion', {
                lat: position.lat,
                lng: position.lng,
                direccion: address
            });
        }
    }, [address, position, setField]);

    return (
        <IncidenciaDialog
          formData={formData}
          errors={errors}
          address={address}
          isAddressLoading={isAddressLoading}
          isSubmitting={isSubmitting}
          isPending={submitMutation.isPending}
          onFieldChange={handleFieldChange}
          onFileChange={handleFile}
          onMapClick={handleMapClick}
          onLocationSelect={handleLocationSelect}
          selectedCoords={position ? { longitude: position.lng, latitude: position.lat } : undefined}
          onSubmit={handleSubmit}
        />
    );
}

export default IncidenciasView;
