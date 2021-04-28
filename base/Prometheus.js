const promClient = require('prom-client')
const http = require('http')
const serverUPS = require("../helpers/serverUPSHandler")

// TODO: export this whole thing and somehow allow to add in other metrics, such as UPS

const collectDefaultMetrics = promClient.collectDefaultMetrics;
const Registry = promClient.Registry;
const register = new Registry();
collectDefaultMetrics({ register });

const upsGauge = new promClient.Gauge({
  name: 'factorio_server_ups',
  help: 'Factorio server UPS',
  labelNames: ['server'],
})

setInterval(() => {
  let data = serverUPS.exportData()
  data.forEach((server) => {
    upsGauge.set({ server: server.name }, server.ups)
  })
}, 1000)

register.registerMetric(upsGauge)

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
