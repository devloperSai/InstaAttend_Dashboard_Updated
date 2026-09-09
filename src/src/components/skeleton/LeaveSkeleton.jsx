import { Button } from "../ui/button";
import { Calendar, Search, Filter} from "lucide-react";
import { Input } from "../ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/Select";
import { Card, CardContent} from "../ui/card";

const LeaveSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
                <Button className="bg-instattend-500 hover:bg-instattend-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Apply for Leave
                </Button>
            </div>

            {/* Leave Type Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {["Sick Leave", "Vacation", "Personal Leave", "Other"].map((type, index) => (
                    <Card key={index} className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{type}</p>
                                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded mt-1" />
                                </div>
                                <div className="p-3 rounded-full bg-gray-100 text-gray-400">
                                    <Calendar className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters and Table */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input className="pl-10" placeholder="Search leaves..." disabled />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" disabled>
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[
                                    "Employee",
                                    "Leave Type",
                                    "From",
                                    "To",
                                    "Days",
                                    "Status",
                                    "Reason",
                                    "Actions",
                                ].map((head, idx) => (
                                    <TableHead key={idx}>{head}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <TableRow key={index}>
                                    {Array.from({ length: 8 }).map((_, col) => (
                                        <TableCell key={col}>
                                            <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default LeaveSkeleton;
