export default function SlotGrid({ slots, onReserve, onCancel, currentUser }) {
  if (!slots.length) {
    return (
      <p className="text-gray-400 text-center py-10 text-sm">No slots added for this date.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {slots.map(slot => {
        const isReserved = slot.status === 'reserved';
        const isMyReservation =
          isReserved && slot.reservedBy?._id?.toString() === currentUser?.id?.toString();

        return (
          <div
            key={slot._id}
            className={`rounded-xl p-4 text-white ${isReserved ? 'bg-red-500' : 'bg-green-600'}`}
          >
            <div className="font-semibold text-sm tabular-nums">
              {slot.startTime} &ndash; {slot.endTime}
            </div>
            <div className="text-xs mt-1 opacity-80">
              {isReserved ? (isMyReservation ? 'Reserved by you' : 'Reserved') : 'Available'}
            </div>

            {currentUser?.role === 'organizer' && !isReserved && (
              <button
                onClick={() => onReserve(slot._id)}
                className="mt-2.5 bg-white text-green-700 text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-100"
              >
                Reserve
              </button>
            )}

            {currentUser?.role === 'organizer' && isMyReservation && (
              <button
                onClick={() => onCancel(slot._id)}
                className="mt-2.5 bg-white text-red-600 text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-red-50 transition-colors duration-100"
              >
                Cancel
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
