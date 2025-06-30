import { Injectable } from '@nestjs/common';
import { RoleSeed } from './role.seed';

@Injectable()
export class SeedService {
  constructor(private readonly roleSeed: RoleSeed) {}

  async runAllSeeds(): Promise<void> {
    console.log('🚀 Starting database seeding...');

    try {
      // Run role seeding
      await this.roleSeed.seed();

      console.log('🎉 All seeds completed successfully!');
    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    console.log('🗑️  Starting database cleanup...');

    try {
      // Clear role data
      await this.roleSeed.clear();

      console.log('✅ All data cleared successfully!');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      throw error;
    }
  }
}
