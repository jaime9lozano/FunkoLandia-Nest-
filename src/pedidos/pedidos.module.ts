import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { Funko } from '../funko/entities/funko.entity';
import { Pedido } from './schema/pedido.schema';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { PedidosMapper } from './mappers/pedidos.mapper';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Pedido.name,
        useFactory: () => {
          const schema = SchemaFactory.createForClass(Pedido);
          schema.plugin(mongoosePaginate);
          return schema;
        },
      },
    ]),
    TypeOrmModule.forFeature([Funko]),
    CacheModule.register(),
  ],
  controllers: [PedidosController],
  providers: [PedidosService, PedidosMapper],
  exports: [PedidosService],
})
export class PedidosModule {}
