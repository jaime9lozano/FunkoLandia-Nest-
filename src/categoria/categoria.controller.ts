import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Controller('categorias')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Get()
  async findAll() {
    return await this.categoriaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.categoriaService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return await this.categoriaService.create(createCategoriaDto);
  }
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return await this.categoriaService.update(id, updateCategoriaDto);
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.categoriaService.removeSoft(id);
  }
}
