import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { CreateBurnLinkRequest, CreateBurnLinkResponse, GetBurnLinkResponse } from "@shared/interfaces/burn-link.api";

import { BurnLinkService } from "./burn-link.service";

@Controller("api")
@UsePipes(new ValidationPipe({ transform: true }))
export class BurnLinkController {
  private readonly logger = new Logger(BurnLinkController.name);

  constructor(private burnLinkService: BurnLinkService) {}

  @Post("burn-link")
  @ApiOperation({ description: "Create new burn link" })
  public async createBurnLink(
    @Body() { message, expirationMin }: CreateBurnLinkRequest,
  ): Promise<CreateBurnLinkResponse> {
    const id = await this.burnLinkService.create(message, expirationMin);
    this.logger.log(`Created burn-link ${id}`);
    return { id: this.uuidToId(id) };
  }

  @Get("burn-link/:id")
  @ApiOperation({ description: "Get burn-link content" })
  public async getBurnLink(@Param("id") id: string): Promise<GetBurnLinkResponse> {
    this.logger.log(`Getting burn-link ${id}`);
    const { message } = await this.burnLinkService.get(this.idToUid(id));
    return { message };
  }

  @Delete("burn-link/:id")
  @ApiOperation({ description: "Delete burn-link" })
  public async delete(@Param("id") id: string) {
    this.logger.log(`Deleting burn-link ${id}`);
    await this.burnLinkService.remove(this.idToUid(id));
  }

  private uuidToId(val: string) {
    return val.replace(/-/g, "");
  }

  private idToUid(val: string) {
    if (!/^[0-9a-fA-F]{32}$/.test(val)) {
      throw new BadRequestException("Invalid ID format");
    }
    return val.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
  }
}
