// src/components/productos/StockBadge.tsx

interface StockBadgeProps {
  stock: number
}

export default function StockBadge({ stock }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm">
        Sin stock
      </span>
    )
  }
  
  if (stock < 10) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm">
        Stock bajo: {stock}
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm">
      Stock: {stock}
    </span>
  )
}
