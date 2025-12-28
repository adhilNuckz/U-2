import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ExecuteCommandDto {
  @IsNotEmpty()
  @IsString()
  containerId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000, { message: 'Command is too long' })
  command: string;
}