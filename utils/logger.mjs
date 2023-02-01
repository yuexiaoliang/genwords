import log4js from 'log4js';

const levels = {
  trace: log4js.levels.TRACE,
  debug: log4js.levels.DEBUG,
  info: log4js.levels.INFO,
  warn: log4js.levels.WARN,
  error: log4js.levels.ERROR,
  fatal: log4js.levels.FATAL
};

log4js.configure({
  //设置追加器
  appenders: {
    console: { type: 'console' },
    error: {
      type: 'dateFile',
      filename: 'logs/error',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true
    },
    info: {
      type: 'dateFile',
      filename: 'logs/info',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true
    }
  },

  categories: {
    default: { appenders: ['console'], level: 'debug' },
    info: {
      appenders: ['info', 'console'],
      level: 'info'
    },
    error: {
      appenders: ['error', 'console'],
      level: 'error'
    }
  }
});

/**
 * 日志输出，level为debug
 * @param {string} content
 */
export const debug = (content) => {
  let logger = log4js.getLogger();
  logger.level = levels.debug;
  logger.debug(content);
};

/**
 * 日志输出，level为info
 * @param {string} content
 */
export const info = (content) => {
  let logger = log4js.getLogger('info');
  logger.level = levels.info;
  logger.info(content);
};

/**
 * 日志输出，level为error
 * @param {string} content
 */
export const error = (content) => {
  let logger = log4js.getLogger('error');
  logger.level = levels.error;
  logger.error(content);
};

export default {
  info,
  error,
  debug
};
