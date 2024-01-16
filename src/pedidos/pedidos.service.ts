import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Funko } from '../funko/entities/funko.entity';
import { PedidosMapper } from './mappers/pedidos.mapper';
import { Pedido, PedidoDocument } from './schema/pedido.schema';

export const PedidosOrderByValues: string[] = ['_id', 'idUsuario']; // Lo usamos en los pipes
export const PedidosOrderValues: string[] = ['asc', 'desc']; // Lo usamos en los pipes
@Injectable()
export class PedidosService {
  private logger = new Logger(PedidosService.name);
  // Inyectamos los repositorios!!
  constructor(
    @InjectModel(Pedido.name)
    private pedidosRepository: PaginateModel<PedidoDocument>,
    @InjectRepository(Funko)
    private readonly funkosRepository: Repository<Funko>,
    private readonly pedidosMapper: PedidosMapper,
  ) {}
  async findAll(page: number, limit: number, orderBy: string, order: string) {
    this.logger.log(
      `Buscando todos los pedidos con paginación y filtros: ${JSON.stringify({
        page,
        limit,
        orderBy,
        order,
      })}`,
    );
    // Aquí iría la query de ordenación y paginación
    const options = {
      page,
      limit,
      sort: {
        [orderBy]: order,
      },
      collection: 'es_ES', // para que use la configuración de idioma de España
    };

    return await this.pedidosRepository.paginate({}, options);
  }
  async findOne(id: string) {
    this.logger.log(`Buscando pedido con id ${id}`);
    const pedidoToFind = await this.pedidosRepository.findById(id).exec();
    if (!pedidoToFind) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`);
    }
    return pedidoToFind;
  }
  async findByIdUsuario(idUsuario: number) {
    this.logger.log(`Buscando pedidos por usuario ${idUsuario}`);
    return await this.pedidosRepository.find({ idUsuario }).exec();
  }
  async create(createPedidoDto: CreatePedidoDto) {
    this.logger.log(`Creando pedido ${JSON.stringify(createPedidoDto)}`);
    console.log(`Guardando pedido: ${createPedidoDto}`);

    const pedidoToBeSaved = this.pedidosMapper.toEntity(createPedidoDto);

    await this.checkPedido(pedidoToBeSaved);

    const pedidoToSave = await this.reserveStockPedidos(pedidoToBeSaved);

    pedidoToSave.createdAt = new Date();
    pedidoToSave.updatedAt = new Date();

    return await this.pedidosRepository.create(pedidoToSave);
  }
  async update(id: string, updatePedidoDto: UpdatePedidoDto) {
    this.logger.log(
      `Actualizando pedido con id ${id} y ${JSON.stringify(updatePedidoDto)}`,
    );

    const pedidoToUpdate = await this.pedidosRepository.findById(id).exec();
    if (!pedidoToUpdate) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`);
    }

    const pedidoToBeSaved = this.pedidosMapper.toEntity(updatePedidoDto);

    await this.returnStockPedidos(pedidoToBeSaved);

    await this.checkPedido(pedidoToBeSaved);
    const pedidoToSave = await this.reserveStockPedidos(pedidoToBeSaved);

    pedidoToSave.updatedAt = new Date();

    return await this.pedidosRepository
      .findByIdAndUpdate(id, pedidoToSave, { new: true })
      .exec();
  }
  async remove(id: string) {
    this.logger.log(`Eliminando pedido con id ${id}`);

    const pedidoToDelete = await this.pedidosRepository.findById(id).exec();
    if (!pedidoToDelete) {
      throw new NotFoundException(`Pedido con id ${id} no encontrado`);
    }
    await this.returnStockPedidos(pedidoToDelete);
    await this.pedidosRepository.findByIdAndDelete(id).exec();
  }
  async getPedidosByUser(idUsuario: number): Promise<Pedido[]> {
    this.logger.log(`Buscando pedidos por usuario ${idUsuario}`);
    return await this.pedidosRepository.find({ idUsuario }).exec();
  }
  private async checkPedido(pedido: Pedido): Promise<void> {
    this.logger.log(`Comprobando pedido ${JSON.stringify(pedido)}`);
    if (!pedido.lineasPedido || pedido.lineasPedido.length === 0) {
      throw new BadRequestException(
        'No se han agregado lineas de pedido al pedido actual',
      );
    }

    for (const lineaPedido of pedido.lineasPedido) {
      const funko = await this.funkosRepository.findOneBy({
        id: lineaPedido.idProducto,
      });
      if (!funko) {
        throw new BadRequestException(
          'El funko con id ${lineaPedido.idProducto} no existe',
        );
      }
      if (funko.cantidad < lineaPedido.cantidad && lineaPedido.cantidad > 0) {
        throw new BadRequestException(
          `La cantidad solicitada no es válida o no hay suficiente stock del funko ${funko.id}`,
        );
      }
      if (funko.precio !== lineaPedido.precioProducto) {
        throw new BadRequestException(
          `El precio del funko ${funko.id} del pedido no coincide con el precio actual del funko`,
        );
      }
    }
  }
  private async reserveStockPedidos(pedido: Pedido): Promise<Pedido> {
    this.logger.log(`Reservando stock del pedido: ${pedido}`);

    if (!pedido.lineasPedido || pedido.lineasPedido.length === 0) {
      throw new BadRequestException(`No se han agregado lineas de pedido`);
    }

    for (const lineaPedido of pedido.lineasPedido) {
      const funko = await this.funkosRepository.findOneBy({
        id: lineaPedido.idProducto,
      });
      funko.cantidad -= lineaPedido.cantidad;
      await this.funkosRepository.save(funko);
      lineaPedido.total = lineaPedido.cantidad * lineaPedido.precioProducto;
    }

    pedido.total = pedido.lineasPedido.reduce(
      (sum, lineaPedido) =>
        sum + lineaPedido.cantidad * lineaPedido.precioProducto,
      0,
    );
    pedido.totalItems = pedido.lineasPedido.reduce(
      (sum, lineaPedido) => sum + lineaPedido.cantidad,
      0,
    );

    return pedido;
  }
  private async returnStockPedidos(pedido: Pedido): Promise<Pedido> {
    this.logger.log(`Retornando stock del pedido: ${pedido}`);
    if (pedido.lineasPedido) {
      for (const lineaPedido of pedido.lineasPedido) {
        const funko = await this.funkosRepository.findOneBy({
          id: lineaPedido.idProducto,
        });
        funko.cantidad += lineaPedido.cantidad;
        await this.funkosRepository.save(funko);
      }
    }
    return pedido;
  }
}
