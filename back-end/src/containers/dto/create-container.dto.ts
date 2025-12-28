import { IsOptional, IsString } from 'class-validator';

export class CreateContainerDto {
  @IsOptional()
  @IsString()
  image?: string = 'ubuntu:22.04';
}