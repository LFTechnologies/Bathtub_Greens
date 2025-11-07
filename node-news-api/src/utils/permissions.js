export const Roles = Object.freeze({
  ADMIN: 'admin',
  EDITOR: 'editor',
  MODERATOR: 'moderator',
  USER: 'user'
})

export const Actions = Object.freeze({
  MANAGE_USERS: 'manage:users',
  MANAGE_ROLES: 'manage:roles',
  ARTICLE_CREATE: 'article:create',
  ARTICLE_EDIT: 'article:edit',
  ARTICLE_APPROVE: 'article:approve',
  ARTICLE_PUBLISH: 'article:publish',
  ARTICLE_DELETE: 'article:delete',
  ARTICLE_READ: 'article:read',
  COMMENT_CREATE: 'comment:create',
  COMMENT_MODERATE: 'comment:moderate'
})

export const RolePermissions = {
  [Roles.ADMIN]: Object.values(Actions),
  [Roles.EDITOR]: [Actions.ARTICLE_CREATE, Actions.ARTICLE_EDIT, Actions.ARTICLE_READ],
  [Roles.MODERATOR]: [Actions.ARTICLE_APPROVE, Actions.ARTICLE_PUBLISH, Actions.ARTICLE_DELETE, Actions.COMMENT_MODERATE, Actions.ARTICLE_READ],
  [Roles.USER]: [Actions.ARTICLE_READ, Actions.COMMENT_CREATE]
}

export function can(user, action) {
  if (!user) return false
  const perms = RolePermissions[user.role] || []
  return perms.includes(action)
}
