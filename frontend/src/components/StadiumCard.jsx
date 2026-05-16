import { Link } from 'react-router-dom';

export default function StadiumCard({ stadium }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out overflow-hidden border border-gray-100">
      {stadium.photos?.[0] ? (
        <img src={`${import.meta.env.VITE_API_URL}${stadium.photos[0]}`} alt={stadium.name} className="w-full h-44 object-cover" />
      ) : (
        <div className="w-full h-44 bg-green-50 flex items-center justify-center text-5xl">
          &#9917;
        </div>
      )}
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 leading-snug">{stadium.name}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{stadium.location}</p>
        {stadium.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">{stadium.description}</p>
        )}
        <Link
          to={`/stadiums/${stadium._id}`}
          className="mt-3 inline-block bg-green-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-800 transition-colors duration-150 font-medium"
        >
          View Schedule
        </Link>
      </div>
    </div>
  );
}
