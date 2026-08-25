import { Module } from '@nestjs/common';
import { ApplicationStore } from './applicationStore';
import { SchemeStore } from './schemeStore';
import { UserStore } from './userStore';

// Providers rather than module-level singletons, so state is scoped to the
// application instance. Swapping any of these for a real repository later is
// then a one-line change here.
@Module({
  providers: [ApplicationStore, SchemeStore, UserStore],
  exports: [ApplicationStore, SchemeStore, UserStore],
})
export class StoresModule {}
