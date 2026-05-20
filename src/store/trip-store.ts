"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MOCK_TRIPS, type Trip } from "@/mocks/trips";

type TripStore = {
  trips: Trip[];
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  getTrip: (id: string) => Trip | undefined;
  createTrip: (trip: Trip) => void;
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  resetToMocks: () => void;
};

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      trips: MOCK_TRIPS,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      getTrip: (id) => get().trips.find((t) => t.id === id),
      createTrip: (trip) =>
        set((state) => ({ trips: [...state.trips, trip] })),
      updateTrip: (id, patch) =>
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
          ),
        })),
      deleteTrip: (id) =>
        set((state) => ({ trips: state.trips.filter((t) => t.id !== id) })),
      resetToMocks: () => set({ trips: MOCK_TRIPS }),
    }),
    {
      name: "smarttraveler-trips",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
