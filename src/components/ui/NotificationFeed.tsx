import { useGameStore } from '../../store/gameStore';

export function NotificationFeed() {
  const notifications = useGameStore(s => s.notifications);
  const dismissNotification = useGameStore(s => s.dismissNotification);

  if (notifications.length === 0) return null;

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-1 items-center pointer-events-none">
      {notifications.slice(-5).map((msg, i) => (
        <div
          key={i}
          className="pointer-events-auto bg-black/80 border border-blue-600 text-white text-xs px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-[slideUp_0.3s_ease-out]"
        >
          <span>{msg}</span>
          <button
            onClick={() => dismissNotification(i)}
            className="text-gray-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
