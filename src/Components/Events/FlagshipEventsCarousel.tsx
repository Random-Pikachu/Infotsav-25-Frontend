import { useEffect, useState, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import flagshipEvents from "../../constants/EventData/FlagShipEvents.json";
import { FlagshipEventCard } from "./FlagshipEventCard";

// Define the event type
interface FlagshipEvent {
  id: number;
  name: string;
  category: string;
  about: string;
  img?: string;
  prize?: string;
  date?: string;
  fee?: number;
  contact?: Array<{
    name: string;
    phone: string;
    email: string;
  }>;
  description?: {
    overview: string;
    rules: Record<string, unknown>;
  };
}

const ONE_SECOND = 1000;
const AUTO_DELAY = ONE_SECOND * 5;

const SMOOTH_TRANSITION = {
  type: "tween" as const,
  duration: 0.4,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

export const FlagshipEventsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const controls = useAnimation();
  
  const events = flagshipEvents as FlagshipEvent[];
  
  // Create extended array with duplicates for infinite effect
  const extendedEvents = [...events, ...events, ...events];
  const startIndex = events.length; // Start from the middle set

  const moveToNext = useCallback(async () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const nextIndex = currentIndex + 1;
    
    // Animate to the next position
    await controls.start({
      translateX: `-${nextIndex * 100}%`,
    }, SMOOTH_TRANSITION);
    
    // Check if we need to reset position seamlessly
    if (nextIndex >= startIndex + events.length) {
      // Small delay to ensure animation is complete
      setTimeout(() => {
        // Instantly reset to the start of the middle set without animation
        controls.set({
          translateX: `-${startIndex * 100}%`,
        });
        setCurrentIndex(startIndex);
        setIsTransitioning(false);
      }, 50);
    } else {
      setCurrentIndex(nextIndex);
      setIsTransitioning(false);
    }
  }, [controls, currentIndex, events.length, startIndex, isTransitioning]);

  const jumpToIndex = useCallback(async (targetIndex: number) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const actualIndex = startIndex + targetIndex;
    
    // Animate to the target position
    await controls.start({
      translateX: `-${actualIndex * 100}%`,
    }, SMOOTH_TRANSITION);
    
    setCurrentIndex(actualIndex);
    setIsTransitioning(false);
  }, [controls, startIndex, isTransitioning]);

  // Auto-advance carousel
  useEffect(() => {
    if (isHovered || isTransitioning) return;
    
    const intervalRef = setInterval(() => {
      moveToNext();
    }, AUTO_DELAY);

    return () => clearInterval(intervalRef);
  }, [isHovered, isTransitioning, moveToNext]);

  // Initialize position
  useEffect(() => {
    const initializeCarousel = async () => {
      // Set initial position without animation
      await controls.set({
        translateX: `-${startIndex * 100}%`,
      });
      setCurrentIndex(startIndex);
    };
    
    initializeCarousel();
  }, [controls, startIndex]);

  // Get the current active event index for dots
  const activeEventIndex = (currentIndex - startIndex + events.length) % events.length;

  return (
    <div 
      className="relative overflow-hidden pb-4 pt-10 h-[70vh] flex flex-col justify-start items-center max-w-[76rem] mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-full">
        <motion.div
          animate={controls}
          className="flex w-full h-full"
        >
          <EventCards events={extendedEvents} currentIndex={currentIndex} />
        </motion.div>
      </div>

      <Dots 
        activeIndex={activeEventIndex} 
        onDotClick={jumpToIndex} 
        events={events} 
      />
    </div>
  );
};

const EventCards = ({ 
  events, 
  currentIndex
}: { 
  events: FlagshipEvent[]; 
  currentIndex: number;
}) => {
  return (
    <>
      {events.map((event, idx) => {
        // Calculate if this card should be active (visible in viewport)
        const isActive = idx === currentIndex;
        
        return (
          <div key={`${event.id}-${Math.floor(idx / (events.length / 3))}`} className="w-full h-full shrink-0">
            <FlagshipEventCard 
              event={event} 
              isActive={isActive}
            />
          </div>
        );
      })}
    </>
  );
};

const Dots = ({
  activeIndex,
  onDotClick,
  events,
}: {
  activeIndex: number;
  onDotClick: (targetIndex: number) => Promise<void>;
  events: FlagshipEvent[];
}) => {
  return (
    <div className="mt-2 flex w-full justify-center gap-1">
      {events.map((_, idx) => {
        return (
          <button
            key={idx}
            onClick={() => onDotClick(idx)}
            className={`h-2 w-2 rounded-full transition-colors ${
              idx === activeIndex ? "bg-red-400" : "bg-red-800/50"
            }`}
          />
        );
      })}
    </div>
  );
};
