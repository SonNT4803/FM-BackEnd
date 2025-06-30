import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const seedService = app.get(SeedService);

    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
      case 'seed':
        await seedService.runAllSeeds();
        break;
      case 'clear':
        await seedService.clearAllData();
        break;
      default:
        console.log('Usage: npm run seed:run [seed|clear]');
        console.log('  seed  - Run all seeds');
        console.log('  clear - Clear all seeded data');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
