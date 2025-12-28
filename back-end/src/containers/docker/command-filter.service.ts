import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class CommandFilterService {
  private readonly dangerousPatterns = [
    /rm\s+-rf\s+\//, // rm -rf /
    /:\(\)\{.*\|\:&\}\;\:/, // Fork bomb
    /mkfs/, // Format filesystem
    /dd\s+if=.*of=\/dev/, // Disk operations
    /curl.*\|.*bash/, // Remote code execution
    /wget.*\|.*sh/, // Remote code execution
  ];

  filterCommand(command: string): string {
    const trimmedCommand = command.trim();

    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(trimmedCommand)) {
        throw new BadRequestException('Command not allowed for security reasons');
      }
    }

    // Limit command length
    if (trimmedCommand.length > 1000) {
      throw new BadRequestException('Command too long');
    }

    return trimmedCommand;
  }
}