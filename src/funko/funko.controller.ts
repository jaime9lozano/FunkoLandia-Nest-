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
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FunkoService } from './funko.service';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { funkoExistGuard } from './guard/funko-exist.guard';
import { Request } from 'express';
import { extname, parse } from 'path';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseFunko } from './dto/response-funko.dto';

@Controller('funkos')
@UseInterceptors(CacheInterceptor)
@ApiTags('Funkos')
export class FunkoController {
  logger: Logger = new Logger(FunkoController.name);
  constructor(private readonly funkoService: FunkoService) {}

  @Get()
  @CacheKey('all_funkos')
  @CacheTTL(30)
  @ApiResponse({
    status: 200,
    description:
      'Lista de funkos paginada. Se puede filtrar por limite, pagina sortBy, filter y search',
    type: Paginated<ResponseFunko>,
  })
  @ApiQuery({
    description: 'Filtro por limite por pagina',
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro por pagina',
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro de ordenación: campo:ASC|DESC',
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: filter.campo = $eq:valor',
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: search = valor',
    name: 'search',
    required: false,
    type: String,
  })
  async findAll(@Paginate() query: PaginateQuery) {
    this.logger.log('Buscando todos los funkos');
    return await this.funkoService.findAll(query);
  }
  @ApiResponse({
    status: 200,
    description: 'Funko encontrado',
    type: ResponseFunko,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Funko no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del funko no es válido',
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Buscando funko con id ${id}`);
    return await this.funkoService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @HttpCode(201)
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 201,
    description: 'Funko creado',
    type: ResponseFunko,
  })
  @ApiBody({
    description: 'Datos del funko a crear',
    type: CreateFunkoDto,
  })
  @ApiBadRequestResponse({
    description:
      'Algunos de los campos no son válidos según la especificación del DTO',
  })
  @ApiBadRequestResponse({
    description: 'La categoría no existe o no es válida',
  })
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    this.logger.log('Creando un nuevo funko');
    return await this.funkoService.create(createFunkoDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 200,
    description: 'Funko actualizado',
    type: ResponseFunko,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  @ApiBody({
    description: 'Datos del funko a actualizar',
    type: UpdateFunkoDto,
  })
  @ApiNotFoundResponse({
    description: 'Funko no encontrado',
  })
  @ApiBadRequestResponse({
    description:
      'Algunos de los campos no son válidos según la especificación del DTO',
  })
  @ApiBadRequestResponse({
    description: 'La categoría no existe o no es válida',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFunkoDto: UpdateFunkoDto,
  ) {
    this.logger.log(`Actualizando funko con id ${id}`);
    return await this.funkoService.update(id, updateFunkoDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @HttpCode(204)
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 204,
    description: 'Funko eliminado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Funko no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del funko no es válido',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Eliminando funko con id ${id}`);
    return await this.funkoService.removeSoft(id);
  }
  @Patch('/imagen/:id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard)
  @Roles('ADMIN')
  @UseGuards(funkoExistGuard)
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 200,
    description: 'Imagen actualizada',
    type: ResponseFunko,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del funko',
    type: Number,
  })
  @ApiProperty({
    name: 'file',
    description: 'Fichero de imagen',
    type: 'string',
    format: 'binary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fichero de imagen',
    type: FileInterceptor('file'),
  })
  @ApiNotFoundResponse({
    description: 'Funko no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del funko no es válido',
  })
  @ApiBadRequestResponse({
    description: 'El fichero no es válido o de un tipo no soportado',
  })
  @ApiBadRequestResponse({
    description: 'El fichero no puede ser mayor a 1 megabyte',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './storage-dir',
        filename: (req, file, cb) => {
          // const fileName = uuidv4() // usamos uuid para generar un nombre único para el archivo
          const { name } = parse(file.originalname);
          const fileName = `${Date.now()}_${name.replace(/\s/g, '')}`;
          const fileExt = extname(file.originalname); // extraemos la extensión del archivo
          cb(null, `${fileName}${fileExt}`); // llamamos al callback con el nombre del archivo
        },
      }),
      // Validación de archivos
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxFileSize = 1024 * 1024; // 1 megabyte
        if (!allowedMimes.includes(file.mimetype)) {
          // Note: You can customize this error message to be more specific
          cb(
            new BadRequestException(
              'Fichero no soportado. No es del tipo imagen válido',
            ),
            false,
          );
        } else if (file.size > maxFileSize) {
          cb(
            new BadRequestException(
              'El tamaño del archivo no puede ser mayor a 1 megabyte.',
            ),
            false,
          );
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async updateImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    this.logger.log(`Actualizando imagen al funko con ${id}:  ${file}`);

    return await this.funkoService.updateImage(id, file, req, true);
  }
}
