require('dotenv').config() // init dotenv

const _ = require('lodash')
const axios = require('axios')
const Qs = require('qs')
const log = require('debug')('app:repl')

exports.getenv = (key, defaultval) => {
  return _.get(process, ['env', key], defaultval)
}

exports.httpBuildQuery = obj => Qs.stringify(obj, { arrayFormat: 'brackets' })

exports.sleep = t => new Promise(resolve => { setTimeout(resolve, t) })

exports.addrToPlace = async address => {
  const query = {
    address,
    key: exports.getenv('GEOCODE_APIKEY'), // gcp taichunmin
    language: 'zh-TW',
    region: '.tw'
  }
  const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?${exports.httpBuildQuery(query)}`)

  // https://developers.google.com/maps/documentation/geocoding/intro#GeocodingResponses
  const places = _.map(res.data.results, place => ({
    formatted_address: _.get(place, 'formatted_address'),
    lat: _.get(place, 'geometry.location.lat'),
    lng: _.get(place, 'geometry.location.lng'),
    place_id: _.get(place, 'place_id')
  }))
  return places
}

exports.addrsToLatlng = async addrs => {
  // 50 requests per second
  const latlngs = []
  const cnt = { success: 0, error: 0 }
  const chunks = _.chunk(addrs, 50)
  for (const chunk of chunks) {
    const res = await Promise.all([
      exports.sleep(1100),
      ..._.map(chunk, async addr => {
        try {
          const place = _.first(await exports.addrToPlace(addr))
          cnt.success++
          return `${_.get(place, 'lat', 0)},${_.get(place, 'lng', 0)}`
        } catch (err) {
          cnt.error++
          return err.message
        }
      })
    ])
    latlngs.push(_.slice(res, 1))
    log('status: %j', cnt)
  }
  return _.flatten(latlngs)
}
