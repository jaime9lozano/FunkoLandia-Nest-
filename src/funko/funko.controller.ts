import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete, Put, HttpCode
} from "@nestjs/common";
import { FunkoService } from './funko.service';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';

@Controller('funkos')
export class FunkoController {
  constructor(private readonly funkoService: FunkoService) {}

  @Get()
  findAll() {
    return this.funkoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.funkoService.findOne(+id);
  }
  @Post()
  @HttpCode(201)
  create(@Body() createFunkoDto: CreateFunkoDto) {
    return this.funkoService.create(createFunkoDto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateFunkoDto: UpdateFunkoDto) {
    return this.funkoService.update(+id, updateFunkoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: number) {
    return this.funkoService.remove(+id);
  }
}
