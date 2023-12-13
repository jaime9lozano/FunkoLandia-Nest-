import { Module } from '@nestjs/common';
import { FunkoModule } from './funko/funko.module';

@Module({
  imports: [FunkoModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
