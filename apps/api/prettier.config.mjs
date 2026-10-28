import baseConfig from '@avenro/prettier-config';

export default {
  ...baseConfig,
  importOrder: [
    '^@nestjs/(.*)$',
    '^@prisma/(.*)$',
    '<THIRD_PARTY_MODULES>',
    '^src/(.*)$',
    '^@/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'decorators-legacy', 'jsx'],
};
