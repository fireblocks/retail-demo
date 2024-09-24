import winston from 'winston';
const { combine, timestamp, printf, colorize } = winston.format;

const baseLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SS' }),
    printf(({ level, message, service, timestamp }) => {
      const coloredLevel = colorize().colorize(level, level.toUpperCase());
      const coloredService = service ? colorize().colorize(level, `${service}`) : '';
      return `[${timestamp}] ${coloredService} ${coloredLevel}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export function createLogger(serviceName?: string) {
  return baseLogger.child({ service: serviceName || '' });
}
