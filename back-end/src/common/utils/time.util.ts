export class TimeUtil {
  static addSeconds(date: Date, seconds: number): Date {
    const result = new Date(date);
    result.setSeconds(result.getSeconds() + seconds);
    return result;
  }

  static isExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }

  static getTimeRemaining(expiryDate: Date): number {
    const now = new Date().getTime();
    const expiry = expiryDate.getTime();
    return Math.max(0, expiry - now);
  }

  static formatDuration(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}