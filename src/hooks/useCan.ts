import { useAuth } from '../hooks/useAuth'
import { validateUserPermissions } from '../utils/validateUserPermissions'

type UseCanParams = {
  permissions?: string[]
  roles?: string[]
}

export function useCan({ permissions, roles }: UseCanParams) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return false
  }

  return validateUserPermissions({ roles, permissions, user })
}
