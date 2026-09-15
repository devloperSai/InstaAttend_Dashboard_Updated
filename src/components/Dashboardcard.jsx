import React from 'react';
import PageTile from './PageTile';
import { StatCard } from './StatCard'; // must match named export
import { FaUser, FaClock, FaCalendarAlt } from "react-icons/fa";

const stats = [
  {
    title: "Total Employees",
    value: "52",
    subText: "+2 this month",
    icon: <FaUser className="text-white" />,
    iconBg: "bg-blue-500",
  },
  {
    title: "Present Today",
    value: "47",
    subText: "90.3%",
    icon: <FaClock className="text-white" />,
    iconBg: "bg-green-500",
  },
  {
    title: "On Leave",
    value: "3",
    subText: "5.7%",
    icon: <FaCalendarAlt className="text-white" />,
    iconBg: "bg-orange-500",
  },
  {
    title: "Avg. Working Hours",
    value: "8.1",
    subText: "+0.3 hrs from last week",
    icon: <FaClock className="text-white" />,
    iconBg: "bg-instattend-500",
  },
];

const Dashboardcard = () => {
  const tile = {
    name: "Dashboard",
    description: "Welcome back, Akshay",
  };

  return (
    <div className="p-6">
      <PageTile tile={tile} />
      <StatCard data={stats} />
    </div>
  );
};

export default Dashboardcard;
