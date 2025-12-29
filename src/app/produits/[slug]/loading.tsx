export default function ProductLoading() {
  return (
    <div className="bg-[#001E27] py-12 animate-pulse">
      <div className="container mx-auto px-4">
        {/* Breadcrumb skeleton */}
        <div className="mb-8 flex items-center space-x-2">
          <div className="h-4 w-16 bg-gray-700 rounded" />
          <div className="h-4 w-4 bg-gray-700 rounded" />
          <div className="h-4 w-20 bg-gray-700 rounded" />
          <div className="h-4 w-4 bg-gray-700 rounded" />
          <div className="h-4 w-32 bg-gray-700 rounded" />
        </div>
        
        <div className="bg-[#002935] rounded-xl overflow-hidden border border-[#3A4A4F]">
          <div className="md:flex">
            {/* Image skeleton */}
            <div className="md:w-1/2">
              <div className="aspect-square bg-gray-700" />
            </div>
            
            {/* Info skeleton */}
            <div className="md:w-1/2 p-8 space-y-6">
              {/* Categories */}
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-700 rounded-full" />
              </div>
              
              {/* Title */}
              <div className="h-10 w-3/4 bg-gray-700 rounded" />
              
              {/* Price */}
              <div className="h-8 w-28 bg-gray-700 rounded" />
              
              {/* Description lines */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-700 rounded" />
                <div className="h-4 w-5/6 bg-gray-700 rounded" />
                <div className="h-4 w-4/6 bg-gray-700 rounded" />
              </div>
              
              {/* Variant buttons */}
              <div className="flex gap-3 pt-4">
                <div className="h-12 w-20 bg-gray-700 rounded-lg" />
                <div className="h-12 w-20 bg-gray-700 rounded-lg" />
                <div className="h-12 w-20 bg-gray-700 rounded-lg" />
              </div>
              
              {/* Quantity + Add to cart */}
              <div className="flex gap-4 pt-4">
                <div className="h-12 w-32 bg-gray-700 rounded-lg" />
                <div className="h-12 flex-1 bg-gray-700 rounded-lg" />
              </div>
              
              {/* Trust badges */}
              <div className="flex gap-4 pt-4">
                <div className="h-10 w-28 bg-gray-700 rounded" />
                <div className="h-10 w-28 bg-gray-700 rounded" />
                <div className="h-10 w-28 bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews section skeleton */}
        <div className="mt-16 pt-12 border-t border-[#3A4A4F]">
          <div className="h-8 w-48 bg-gray-700 rounded mb-6" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-32 bg-gray-700 rounded-lg" />
            <div className="h-32 bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
