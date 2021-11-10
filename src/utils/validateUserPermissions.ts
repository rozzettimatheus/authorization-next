type User = {
  permissions?: string[]
  roles?: string[]
}

type ValidateUserPermissionsParams = {
  user: User
  permissions?: string[]
  roles?: string[]
}

export function validateUserPermissions({
  roles,
  permissions,
  user,
}: ValidateUserPermissionsParams) {
  if (permissions?.length > 0) {
    const hasAllPermissions = permissions.every(permission =>
      user.permissions.includes(permission)
    )

    if (!hasAllPermissions) {
      return false
    }
  }

  if (roles?.length > 0) {
    const hasAllRoles = roles.some(permission =>
      user.roles.includes(permission)
    )

    if (!hasAllRoles) {
      return false
    }
  }

  return true
}
