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

@Controller('funkos')
@UseInterceptors(CacheInterceptor)
export class FunkoController {
  logger: Logger = new Logger(FunkoController.name);
  constructor(private readonly funkoService: FunkoService) {}

  @Get()
  @CacheKey('all_categories')
  @CacheTTL(30)
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
  @Patch('/imagen/:id')
  @UseGuards(funkoExistGuard)
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
