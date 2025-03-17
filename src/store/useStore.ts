import { create } from "zustand";

interface Event {
  _id: string;
  title: string;
  description: string;
  caption?: string;
  key: string;
  year: number;
  files: string[];
  thumbnail?: string;
  position?: [number, number, number];
  categoryKey?: string;
  visible?: boolean;
}

interface StoreState {
  // Event List State
  eventList: Event[];
  setEventsList: (events: Event[]) => void;

  // General State
  startBtnClicked: boolean;
  setStartBtnClicked: (clicked: boolean) => void;

  // Info Modal State
  isInfoModalOpen: boolean;
  toggleInfoModal: () => void;
}

const useStore = create<StoreState>((set) => ({
  // Event List State
  eventList: [],
  setEventsList: (events) => set({ eventList: events }),

  // General State
  startBtnClicked: false,
  setStartBtnClicked: (clicked) => set({ startBtnClicked: clicked }),

  // Info Modal State
  isInfoModalOpen: false,
  toggleInfoModal: () =>
    set((state) => ({ isInfoModalOpen: !state.isInfoModalOpen })),
}));

export default useStore;
