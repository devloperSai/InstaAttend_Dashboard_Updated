import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
const Graph2 = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-[497px] h-[336px] flex flex-col">
      <h2 className="text-start text-xl text-black">Daily Attendance</h2>
      <p className="text-start mb-4 text-sm text-[#647589]">Last 7 days</p>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            barCategoryGap="20%"
          >
            <XAxis dataKey="date" axisLine tickLine />
            <YAxis axisLine tickLine />
            <Tooltip />
            <Legend verticalAlign="bottom" height={24} />
            <Bar dataKey="present" name="Present" fill="#16A34A" />
            <Bar dataKey="late" name="Late" fill="#F59E0B" />
            <Bar dataKey="absent" name="Absent" fill="#C46464" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Graph2;
