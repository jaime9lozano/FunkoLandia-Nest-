import { Injectable } from '@nestjs/common';
import { CreatePedidoDto } from '../dto/create-pedido.dto';
import { Pedido } from '../schema/pedido.schema';
import { plainToClass } from 'class-transformer';

@Injectable()
export class PedidosMapper {
  toEntity(createPedidoDto: CreatePedidoDto): Pedido {
    return plainToClass(Pedido, createPedidoDto);
  }
}
