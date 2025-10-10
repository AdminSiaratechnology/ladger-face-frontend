import { Skeleton } from "@/components/ui/skeleton";

export const TableViewSkeleton = () => (
  <div className="bg-gray-200 rounded-2xl shadow-lg overflow-hidden">
    <div className="overflow-x-auto">
      <div className="min-w-full divide-y divide-gray-400">
        {/* Skeleton Rows */}
        {[...Array(5)].map((_, index) => (
          <div key={index} className="grid grid-cols-6 gap-4 p-6 hover:bg-gray-30 transition-colors duration-200 border-b border-gray-100">
            {/* Company Column */}
            <div className="flex items-center">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            
            {/* Contact Column */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Skeleton className="h-3 w-3 rounded mr-2" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-3 w-3 rounded mr-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-3 w-3 rounded mr-2" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            
            {/* Location Column */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            
            {/* Registration Column */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-6 w-28 rounded" />
              <Skeleton className="h-6 w-24 rounded" />
            </div>
            
            {/* Status Column */}
            <div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            
            {/* Actions Column */}
            <div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);