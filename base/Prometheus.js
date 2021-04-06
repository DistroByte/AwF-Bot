const promClient = require('prom-client')
const http = require('http')

// TODO: export this whole thing and somehow allow to add in other metrics, such as UPS

const collectDefaultMetrics = promClient.collectDefaultMetrics;
const Registry = promClient.Registry;
const register = new Registry();
collectDefaultMetrics({ register });

// Server for data collection
http.createServer(async (req, res) => {
  if (req.url.endsWith("/metrics")) {
    return res.end(await register.metrics())
  }
}).listen(9110)

module.exports = promClient