// src/device/queries/handlers/get-devices.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDevicesQuery } from '../impl/get-devices.query';
import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PaginatedDeviceResponse } from '../../dto/device-response.dto';

@Injectable()
@QueryHandler(GetDevicesQuery)
export class GetDevicesHandler implements IQueryHandler<GetDevicesQuery> {
  constructor(private prisma: PrismaService) {}

  async execute(query: GetDevicesQuery): Promise<PaginatedDeviceResponse> {
    const { tenantId, pageSize, pageNumber, customerId, type, profileId } =
      query;

    // Convert pageSize and pageNumber to numbers if they're strings
    const take =
      typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;
    const page =
      typeof pageNumber === 'string' ? parseInt(pageNumber, 10) : pageNumber;
    const skip = (page - 1) * take;

    const whereClause = {
      tenant_id: tenantId,
      ...(customerId && { customer_id: customerId }),
      ...(type && { type }),
      ...(profileId && { device_profile_id: profileId }),
    };

    const [devices, total] = await Promise.all([
      this.prisma.device.findMany({
        where: whereClause,
        skip,
        take, // Using the converted number
        select: {
          id: true,
          name: true,
          label: true,
          type: true,
          created_time: true,
          customer_id: true,
          device_profile: {
            select: {
              id: true,
              name: true,
              type: true,
              description: true,
              image: true,
              default_dashboard_id: true,
            },
          },
        },
      }),
      this.prisma.device.count({
        where: whereClause,
      }),
    ]);

    return {
      data: devices,
      meta: {
        total,
        page,
        pageSize: take, // Using the converted number
        totalPages: Math.ceil(total / take),
      },
    };
  }
}
