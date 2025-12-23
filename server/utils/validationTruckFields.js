const createError = require('http-errors')

const validateType = type => {
  if (
    ![
      'single-tire',
      'elf',
      'forward',
      '10-wheeler',
      '12-wheeler',
      'wing-van',
      'L300',
      'multicab'
    ].includes(type)
  ) {
    throw createError(400, 'Invald truck type')
  }
}

const validateCondition = condition => {
  if (
    !['good', 'maintenance-required', 'under-maintenance'].includes(condition)
  ) {
    throw createError(400, 'Invalid truck condition')
  }
}

const validateStatus = status => {
  if (!['available', 'unavailable'].includes(status)) {
    throw createError(400, 'Invalid truck status')
  }
}

module.exports = {
  validateType,
  validateCondition,
  validateStatus
}
