const { createLogger, format, transports } = require('winston')

logger = createLogger({
    transports:
        new transports.File({
            filename: 'logs/error.log',
            format:format.combine(
                format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
                format.align(),
                format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
            )
        }),
})

function logError (req, msg, code) {
    logger.error(`${code} - ${msg} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
}

module.exports = logError