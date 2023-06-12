import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Seed Data')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  runSeed() {
    return this.seedService.executeSeed();
  }
}
