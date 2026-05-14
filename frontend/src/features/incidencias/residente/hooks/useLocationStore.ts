import { create } from 'zustand';
import { z } from 'zod';

export const LocationSchema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
});

export type Location = z.infer<typeof LocationSchema>;

interface LocationState {
    position: Location | null;
    setPosition: (pos: Location | null) => void;
    clearPosition: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
    position: null,
    setPosition: (pos) => set({ position: pos }),
    clearPosition: () => set({ position: null }),
}));