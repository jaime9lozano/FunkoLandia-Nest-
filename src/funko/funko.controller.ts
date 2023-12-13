import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FunkoService } from './funko.service';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';

@Controller('funko')
export class FunkoController {
  constructor(private readonly funkoService: FunkoService) {}

  @Post()
  create(@Body() createFunkoDto: CreateFunkoDto) {
    return this.funkoService.create(createFunkoDto);
  }

  @Get()
  findAll() {
    return this.funkoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.funkoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFunkoDto: UpdateFunkoDto) {
    return this.funkoService.update(+id, updateFunkoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.funkoService.remove(+id);
  }
}
