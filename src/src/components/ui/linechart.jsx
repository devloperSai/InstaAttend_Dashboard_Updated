
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
  } from "recharts";
  const Graph1 = ({ data }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 w-[497px] h-[336px] flex flex-col">
        <h2 className="text-start text-xl text-black">Average Working Hours</h2>
        <p className="text-start mb-4 text-sm text-[#647589]">Last 7 days</p>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" axisLine tickLine />
              <YAxis domain={[6, 9]} axisLine tickLine />
              <Tooltip />
              <Line type="monotone" dataKey="hour" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  export default Graph1;