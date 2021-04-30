const promClient = require('prom-client')
const http = require('http')
const serverUPS = require("../helpers/serverUPSHandler")

const collectDefaultMetrics = promClient.collectDefaultMetrics;
const Registry = promClient.Registry;
const register = new Registry();
collectDefaultMetrics({ register });

const upsGauge = new promClient.Gauge({
  name: 'factorio_server_ups',
  help: 'Factorio server UPS',
  labelNames: ['server'],
})
const tickGauge = new promClient.Gauge({
  name: 'factorio_server_tick',
  help: 'Factorio server tick',
  labelNames: ['server'],
})
const playercountGauge = new promClient.Gauge({
  name: 'factorio_server_playercount',
  help: 'Factorio server player count',
  labelNames: ['server'],
})

register.registerMetric(upsGauge)
register.registerMetric(tickGauge)
register.registerMetric(playercountGauge)

setInterval(() => {
  let data = serverUPS.exportData()
  data.forEach((server) => {
    upsGauge.set({ server: server.name }, server.ups)
    tickGauge.set({ server: server.name }, server.previousTick)
    playercountGauge.set({ server: server.name }, server.playercount)
  })
}, 1000)


// Server for data collection
http.createServer(async (req, res) => {
  if (req.url.endsWith("/metrics")) {
    return res.end(await register.metrics())
  }
}).listen(9110)

module.exports = {
  promClient,
  register,
}
