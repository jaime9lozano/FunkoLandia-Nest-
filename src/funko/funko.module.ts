import { Module } from '@nestjs/common';
import { FunkoService } from './funko.service';
import { FunkoController } from './funko.controller';

@Module({
  controllers: [FunkoController],
  providers: [FunkoService],
})
export class FunkoModule {}
