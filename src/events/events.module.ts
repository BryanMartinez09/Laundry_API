import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventsGateway } from './events.gateway';

@Global()
@Module({
  imports: [
    JwtModule.register({}), // Usamos la configuración global de JWT
  ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
