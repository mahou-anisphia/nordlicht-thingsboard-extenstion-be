// src/device/device.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DeviceController } from '@/device/device.controller';
import { GetDevicesHandler } from '@/device/queries/handlers/get-devices.handler';
import { GetDeviceCountsHandler } from '@/device/queries/handlers/get-device-counts.handler';
import { PrismaModule } from '@/prisma/prisma.module';

const QueryHandlers = [GetDevicesHandler, GetDeviceCountsHandler];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [DeviceController],
  providers: [...QueryHandlers],
})
export class DeviceModule {}
