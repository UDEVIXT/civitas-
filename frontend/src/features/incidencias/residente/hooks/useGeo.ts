import { useQuery } from '@tanstack/react-query';
import { Location } from './useLocationStore';

export const useReverseGeocoding = (position: Location | null) => {
    return useQuery({
        queryKey: ['locationName', position?.lat, position?.lng],
        queryFn: async () => {
            if (!position) return null;

            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.lat}&lon=${position.lng}`
            );
            
            if (!res.ok) throw new Error('Error al obtener la dirección');
            const data = await res.json();
            return data.display_name;
        },
        enabled: !!position, 
        staleTime: 1000 * 60 * 5, 
    });
};