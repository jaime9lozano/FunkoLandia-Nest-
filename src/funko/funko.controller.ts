import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { FunkoService } from './funko.service';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';

@Controller('funkos')
export class FunkoController {
  logger: Logger = new Logger(FunkoController.name);
  constructor(private readonly funkoService: FunkoService) {}

  @Get()
  async findAll() {
    this.logger.log('Buscando todos los funkos');
    return await this.funkoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Buscando funko con id ${id}`);
    return await this.funkoService.findOne(id);
  }
  @Post()
  @HttpCode(201)
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    this.logger.log('Creando un nuevo funko');
    return await this.funkoService.create(createFunkoDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFunkoDto: UpdateFunkoDto,
  ) {
    this.logger.log(`Actualizando funko con id ${id}`);
    return await this.funkoService.update(id, updateFunkoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Eliminando funko con id ${id}`);
    return await this.funkoService.removeSoft(id);
  }
}
