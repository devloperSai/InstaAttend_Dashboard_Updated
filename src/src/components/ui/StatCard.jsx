//updated
import React from 'react';

const StatCard = ({ data }) => {
  return (
    <div className="p-3 md:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 stagger-children">
        {/* Card 1 */}
        <div className="group flex justify-between items-center p-4 md:p-4 surface-card">
          <div className="mr-2">
            <p className="text-xs md:text-sm text-muted-foreground">{data[0].title}</p>
            <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums animate-count-up">{data[0].value}</p>
            <p className="text-xs md:text-sm text-muted-foreground/80">{data[0].subText}</p>
          </div>
          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-spring group-hover:scale-110 group-hover:rotate-6 ${data[0].iconBg}`}>
            {React.cloneElement(data[0].icon, { className: "w-4 h-4 md:w-5 md:h-5" })}
          </div>
        </div>

        {/* Card 2 */}
        <div className="group flex justify-between items-center p-4 md:p-4 surface-card">
          <div className="mr-2">
            <p className="text-xs md:text-sm text-muted-foreground">{data[1].title}</p>
            <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums animate-count-up">{data[1].value}</p>
            <p className="text-xs md:text-sm text-muted-foreground/80">{data[1].subText}</p>
          </div>
          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-spring group-hover:scale-110 group-hover:rotate-6 ${data[1].iconBg}`}>
            {React.cloneElement(data[1].icon, { className: "w-4 h-4 md:w-5 md:h-5" })}
          </div>
        </div>

        {/* Card 3 */}
        <div className="group flex justify-between items-center p-4 md:p-4 surface-card">
          <div className="mr-2">
            <p className="text-xs md:text-sm text-muted-foreground">{data[2].title}</p>
            <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums animate-count-up">{data[2].value}</p>
            <p className="text-xs md:text-sm text-muted-foreground/80">{data[2].subText}</p>
          </div>
          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-spring group-hover:scale-110 group-hover:rotate-6 ${data[2].iconBg}`}>
            {React.cloneElement(data[2].icon, { className: "w-4 h-4 md:w-5 md:h-5" })}
          </div>
        </div>

        {/* Card 4 */}
        <div className="group flex justify-between items-center p-4 md:p-4 surface-card">
          <div className="mr-2">
            <p className="text-xs md:text-sm text-muted-foreground">{data[3].title}</p>
            <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums animate-count-up">{data[3].value}</p>
            <p className="text-xs md:text-sm text-muted-foreground/80">{data[3].subText}</p>
          </div>
          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-spring group-hover:scale-110 group-hover:rotate-6 ${data[3].iconBg}`}>
            {React.cloneElement(data[3].icon, { className: "w-4 h-4 md:w-5 md:h-5" })}
          </div>
        </div>
      </div>
    </div>
  );
};

export { StatCard };