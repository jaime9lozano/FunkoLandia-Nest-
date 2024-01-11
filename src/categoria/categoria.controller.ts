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
  UseInterceptors,
} from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

@Controller('categorias')
@UseInterceptors(CacheInterceptor)
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Get()
  @CacheKey('all_categories')
  @CacheTTL(30)
  async findAll(@Paginate() query: PaginateQuery) {
    return await this.categoriaService.findAll(query);
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
