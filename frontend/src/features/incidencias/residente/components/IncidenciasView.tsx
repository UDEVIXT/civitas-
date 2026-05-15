"use client";

// Components
import { IncidenciaDialog } from './IncidenciaDialog';

// Hooks
import { useLocationStore } from '../hooks/useLocationStore';
import { useReverseGeocoding } from '../hooks/useGeo';
import { useIncidenciaForm } from '../hooks/useIncidenciaForm';
import { useSubmitIncidencia } from '../hooks/useSubmitIncidencia';
import { useCallback } from 'react';

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
                setField('evidencia', files);
            }, 0);
        }
    }, [setField]);

    const handleLocationSelect = useCallback((coords: { longitude: number; latitude: number }) => {
        if (setPosition) {
            setPosition({ lat: coords.latitude, lng: coords.longitude });
        }
        if (address) {
            if (setField) {
                setField('ubicacion', {
                    lat: coords.latitude,
                    lng: coords.longitude,
                    direccion: address
                });

                setTimeout(() => {
                    if (errors.ubicacion && setErrors) {
                        setErrors({ ...errors, ubicacion: '' });
                    }
                }, 500);
            }
        }
    }, [setPosition, address, setField, errors.ubicacion, setErrors]);

    const handleMapClick = useCallback((lng: number, lat: number) => {
        if (setPosition) {
            setPosition({ lat, lng });
        }
        if (address) {
            if (setField) {
                setField('ubicacion', {
                    lat,
                    lng,
                    direccion: address
                });

                setTimeout(() => {
                    if (errors.ubicacion && setErrors) {
                        setErrors({ ...errors, ubicacion: '' });
                    }
                }, 500);
            }
        }
    }, [setPosition, address, setField, errors.ubicacion, setErrors]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        
        const isValid = validateForm();
        
        if (isValid && submitMutation && formData) {
            submitMutation.mutate(formData as any);
        }
    }, [validateForm, submitMutation, formData]);

    const handleFieldChange = useCallback((field: string, value: any) => {
        if (setField && field) {
            setField(field as any, value);
        }

        if (errors[field] && setErrors) {
            setErrors({ ...errors, [field]: '' });
        }
    }, [setField, errors, setErrors]);

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
