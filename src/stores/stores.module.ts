import { Module } from '@nestjs/common';
import { ApplicationStore } from './applicationStore';
import { SchemeStore } from './schemeStore';
import { UserStore } from './userStore';

// Providers rather than module-level singletons. Swapping any of these for something real later is
// then a one-line change here.
@Module({
  providers: [ApplicationStore, SchemeStore, UserStore],
  exports: [ApplicationStore, SchemeStore, UserStore],
})
export class StoresModule {}
