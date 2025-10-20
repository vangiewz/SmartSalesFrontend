// src/components/common/RoleBadge.tsx
import { getRoleColor, getRoleIcon } from '../../utils/roles'

interface RoleBadgeProps {
  roleName: string
}

export default function RoleBadge({ roleName }: RoleBadgeProps) {
  const colorClass = getRoleColor(roleName)
  const icon = getRoleIcon(roleName)

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-semibold bg-gradient-to-r ${colorClass} shadow-sm`}>
      <span>{icon}</span>
      <span>{roleName}</span>
    </span>
  )
}
