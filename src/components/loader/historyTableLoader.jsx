export function HistoryTableSkeleton() {
    const skeletonRows = Array.from({ length: 3 }); // To show 3 placeholder rows

    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-pulse">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-4"><div className="h-4 bg-gray-600 rounded w-20"></div></th>
                            <th scope="col" className="px-6 py-4"><div className="h-4 bg-gray-600 rounded w-24"></div></th>
                            <th scope="col" className="px-6 py-4"><div className="h-4 bg-gray-600 rounded w-32"></div></th>
                            <th scope="col" className="px-6 py-4 text-right"><div className="h-4 bg-gray-600 rounded w-28 ml-auto"></div></th>
                            <th scope="col" className="px-6 py-4 text-right"><div className="h-4 bg-gray-600 rounded w-32 ml-auto"></div></th>
                            <th scope="col" className="px-6 py-4 text-center"><div className="h-4 bg-gray-600 rounded w-16 mx-auto"></div></th>
                        </tr>
                    </thead>
                    <tbody>
                        {skeletonRows.map((_, index) => (
                            <tr key={index} className="border-b border-gray-700">
                                <td className="px-6 py-4"><div className="h-5 bg-gray-700 rounded w-24"></div></td>
                                <td className="px-6 py-4"><div className="h-5 bg-gray-700 rounded w-32"></div></td>
                                <td className="px-6 py-4"><div className="h-5 bg-gray-700 rounded w-48"></div></td>
                                <td className="px-6 py-4"><div className="h-5 bg-gray-700 rounded w-28 ml-auto"></div></td>
                                <td className="px-6 py-4"><div className="h-5 bg-gray-700 rounded w-36 ml-auto"></div></td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="h-8 w-8 bg-gray-700 rounded"></div>
                                        <div className="h-8 w-8 bg-gray-700 rounded"></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 flex justify-between items-center">
                <div className="h-5 bg-gray-700 rounded w-48"></div>
                <div className="h-5 bg-gray-700 rounded w-36"></div>
            </div>
        </div>
    );
}