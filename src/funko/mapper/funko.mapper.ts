import { Injectable } from '@nestjs/common';
import { CreateFunkoDto } from '../dto/create-funko.dto';
import { Funko } from '../entities/funko.entity';
import { UpdateFunkoDto } from '../dto/update-funko.dto';

@Injectable()
export class FunkoMapper {
  nextID: number = 1;
  toNew(funkoDto: CreateFunkoDto): Funko {
    const funko: Funko = {
      id: this.nextID,
      ...funkoDto,
      fecha_act: new Date(),
      fecha_cre: new Date(),
      is_deleted: false,
    };
    this.nextID++;
    return funko;
  }

  toUpdated(funkoDto: UpdateFunkoDto, funkoUpd: Funko): Funko {
    const funko: Funko = {
      ...funkoUpd,
      ...funkoDto,
      fecha_act: new Date(),
    };
    return funko;
  }
}
