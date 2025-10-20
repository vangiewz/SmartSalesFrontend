// src/components/admin/SearchBar.tsx
import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  totalUsers: number
}

export default function SearchBar({ value, onChange, totalUsers }: SearchBarProps) {
  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl border-2 border-purple-200 p-3 sm:p-4 shadow-lg mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4 sm:h-5 sm:w-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-xl border-2 border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
          />
        </div>
        <div className="text-xs sm:text-sm text-gray-600 font-medium text-center sm:text-left whitespace-nowrap">
          Mostrando <span className="text-purple-600 font-bold">{totalUsers}</span> usuario{totalUsers !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
