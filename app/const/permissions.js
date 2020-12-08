module.exports = {
  adminPermissions: [
    'USER_READ',
    'USER_DELETE',
    'USER_UPDATE',
    'ADMIN_CREATE',
    'TABLE_CREATE',
    'TABLE_READ',
    'TABLE_UPDATE',
    'TABLE_DELETE',
    'MATCH_CREATE',
    'MATCH_READ',
    'MATCH_UPDATE',
    'MATCH_DELETE',
  ],
  userPermissions: ['USER_READ', 'TABLE_READ', 'MATCH_CREATE', 'MATCH_READ', 'MATCH_UPDATE'],
};
