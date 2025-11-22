import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    // D1 uses adapter, but Prisma requires a URL for schema validation
    url: 'file:./dev.db',
  },
});
