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
} from '@nestjs/common';
import { FunkoService } from './funko.service';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';

@Controller('funkos')
export class FunkoController {
  constructor(private readonly funkoService: FunkoService) {}

  @Get()
  async findAll() {
    await this.funkoService.findAll();
    return this.funkoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    await this.funkoService.findOne(id);
    return this.funkoService.findOne(+id);
  }
  @Post()
  @HttpCode(201)
  async create(@Body() createFunkoDto: CreateFunkoDto) {
    await this.funkoService.create(createFunkoDto);
    return this.funkoService.create(createFunkoDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFunkoDto: UpdateFunkoDto,
  ) {
    await this.funkoService.update(+id, updateFunkoDto);
    return this.funkoService.update(+id, updateFunkoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.funkoService.remove(+id);
    return this.funkoService.remove(+id);
  }
}
