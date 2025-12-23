import { DateTime } from 'luxon'

const philippinesYear = DateTime.now().setZone('Asia/Manila').year

const APP_CONFIG = {
  version: '1.0.0',
  name: 'EBUN FREIGHT INC.',
  year: philippinesYear
}

export default APP_CONFIG
