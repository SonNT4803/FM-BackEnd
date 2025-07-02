import { Injectable } from '@nestjs/common';
import { RoleSeed } from './role.seed';
import { UserSeed } from './user.seed';

@Injectable()
export class SeedService {
  constructor(
    private readonly roleSeed: RoleSeed,
    private readonly userSeed: UserSeed,
  ) {}

  async runAllSeeds(): Promise<void> {
    console.log('🚀 Starting database seeding...');

    try {
      // Run role seeding first
      await this.roleSeed.seed();

      // Run user seeding (depends on roles)
      await this.userSeed.seed();

      console.log('🎉 All seeds completed successfully!');
    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    console.log('🗑️  Starting database cleanup...');

    try {
      // Clear user data first (due to foreign key constraints)
      await this.userSeed.clear();

      // Clear role data
      await this.roleSeed.clear();

      console.log('✅ All data cleared successfully!');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      throw error;
    }
  }
}
