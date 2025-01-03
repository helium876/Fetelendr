export default function EventSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse border border-gray-100">
      {/* Image Skeleton */}
      <div className="aspect-[16/9] bg-gradient-to-br from-gray-200 to-gray-300" />
      
      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4" />
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2" />
        </div>
        
        {/* Date & Time */}
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3" />
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2" />
        </div>
        
        {/* Venue */}
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4" />
        
        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20" />
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24" />
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-24" />
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-28" />
        </div>
      </div>
    </div>
  );
} 