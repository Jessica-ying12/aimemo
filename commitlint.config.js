export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['collector', 'db', 'ai', 'ui', 'ipc', 'export', 'rag', 'config', 'privacy', 'updater'],
    ],
    'subject-max-length': [2, 'always', 72],
  },
};
