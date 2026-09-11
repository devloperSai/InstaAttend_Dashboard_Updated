const PageTile = ({ tile }) => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  
    return (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{tile.name}</h1>
          <p className="text-sm text-gray-500">{tile.description}</p>
        </div>
        <div className="mt-2 md:mt-0">
          <span className="bg-instattend-100 text-instattend-700 text-sm font-medium px-3 py-1 rounded-full">
            Today: {today}
          </span>
        </div>
      </div>
    );
  };
  
  export default PageTile;
  