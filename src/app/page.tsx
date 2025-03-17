"use client";

import { useEffect } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { extend } from "@react-three/fiber";
import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import useStore from "@/store/useStore";

// Import components (we'll create these next)
import AnimationCanvas from "@/components/AnimationCanvas";
import EventForm from "@/components/EventForm";
import EventsList from "@/components/EventsList";
import Loading from "@/components/Loading";
import InfoModal from "@/components/InfoModal";

extend({ OrbitControls });

function App() {
  useEffect(() => {
    const handleRightClick = (event: MouseEvent) => {
      event.preventDefault();
    };

    window.addEventListener("contextmenu", handleRightClick);
    return () => {
      window.removeEventListener("contextmenu", handleRightClick);
    };
  }, []);

  return (
    <SnackbarProvider autoHideDuration={2000}>
      <BrowserRouter basename="/milestone">
        <Routes>
          <Route path="/" element={<AnimationComponent />} />
          <Route path="/events" element={<EventsList />} />
          <Route path="/events/add" element={<EventForm context="create" />} />
          <Route
            path="/events/edit/:eventId"
            element={<EventForm context="edit" />}
          />
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  );
}

function AnimationComponent() {
  const backgroundImage = 'url("/milestone/content/Background_03.png")';
  const { eventList, setEventsList } = useStore();

  useEffect(() => {
    const handleEventsFetch = async () => {
      const events = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/events`
      ).then((res) => res.json());
      setEventsList(events);
    };

    handleEventsFetch();
  }, [setEventsList]);

  return (
    <>
      {eventList.length === 0 ? (
        <div
          style={{
            backgroundImage,
          }}
        >
          <Loading />
        </div>
      ) : (
        <div className="anim">
          <Suspense fallback={<div>Loading...</div>}>
            <AnimationCanvas
              eventsLength={eventList.length}
              backgroundImage={backgroundImage}
            />
          </Suspense>
        </div>
      )}

      <InfoModalChild />
    </>
  );
}

function InfoModalChild() {
  const { isInfoModalOpen, toggleInfoModal } = useStore();

  return (
    <>
      {isInfoModalOpen && (
        <InfoModal isOpen={isInfoModalOpen} onClose={toggleInfoModal} />
      )}
    </>
  );
}

export default App;
