import 'dotenv/config';

import { AppModule } from './app.module.js';
import { createApplication } from './bootstrap.js';

const app = await createApplication(AppModule);
await app.listen(Number(process.env.PORT));
