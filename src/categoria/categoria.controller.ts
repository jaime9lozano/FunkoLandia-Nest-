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
  UseGuards,
} from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard';

@Controller('categorias')
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesAuthGuard)
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Get()
  @CacheKey('all_categories')
  @CacheTTL(30)
  @Roles('USER')
  async findAll(@Paginate() query: PaginateQuery) {
    return await this.categoriaService.findAll(query);
  }

  @Get(':id')
  @Roles('USER')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.categoriaService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  @Roles('ADMIN')
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return await this.categoriaService.create(createCategoriaDto);
  }
  @Put(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return await this.categoriaService.update(id, updateCategoriaDto);
  }

  @HttpCode(204)
  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.categoriaService.removeSoft(id);
  }
}
