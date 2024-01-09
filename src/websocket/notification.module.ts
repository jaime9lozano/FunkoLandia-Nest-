import { Module } from '@nestjs/common';
import { FunkoNotificationsGateway } from './funko-notification.gateway';

@Module({
  providers: [FunkoNotificationsGateway],
  exports: [FunkoNotificationsGateway],
})
export class NotificationsModule {}
