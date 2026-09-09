import React from 'react';

const StatCard = ({ data }) => {
  if (!Array.isArray(data)) return null;
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center p-5 rounded-xl shadow-md bg-white transition-transform duration-200"
          >
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-sm text-gray-400">{item.subText}</p>
            </div>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                item.iconBg || "bg-gray-100"
              }`}
            >
              {item.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { StatCard };
