import React from 'react'

const ProductGrid = ({PRODUCTS}) => {
  return (
            <div className="flex flex-col gap-4 px-5">
          {PRODUCTS?.map((product) => (
            <div
              key={product.id}
              className="flex rounded-lg border border-gray-200 bg-white overflow-hidden"
            >
              <ImageSlider
                images={product.images}
                alt={product.title}
                className="w-[110px] h-[110px] shrink-0"
                arrowSize={11}
              />
              <div className="flex-1 flex flex-col justify-center px-4 py-3 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[15.5px] font-bold leading-snug truncate">
                    {product.title}
                  </h3>
                  <button
                    type="button"
                    aria-label="Product options"
                    className="shrink-0 text-gray-500"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 mb-2.5">
                  <StatusDot status={product.status} />
                  <span className="text-[12px] font-medium text-gray-500">
                    {product.status === 'In-Stock'
                      ? `IN STOCK (${product.stock})`
                      : 'OUT OF STOCK'}
                  </span>
                </div>
                <div className="text-[17px] font-bold">${product.price.amount}</div>
              </div>
            </div>
          ))}
        </div>
  )
}

export default ProductGrid