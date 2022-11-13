import config from "../config";
import rcon from "../helpers/rcon";
import servers from "../servers";
import { FactorioServer } from "../types";
import { promClient, register } from "./Prometheus";

// this may conflict with stuff in ./Prometheus.js
const playercountGauge = new promClient.Gauge({
  name: "factorio_server_playercount",
  help: "Factorio server player count",
  labelNames: ["server"],
});
register.registerMetric(playercountGauge);
const modGauge = new promClient.Gauge({
  name: "factorio_mod",
  help: "Factorio mod",
  labelNames: ["server", "name", "version"],
});
register.registerMetric(modGauge);
const seedGauge = new promClient.Gauge({
  name: "factorio_seed",
  help: "Factorio seed",
  labelNames: ["server", "surface"],
});
register.registerMetric(seedGauge);

const powerInput = new promClient.Gauge({
  name: "factorio_power_production_input",
  help: "Factorio power production input",
  labelNames: ["server", "force"],
});
register.registerMetric(powerInput);
const powerOutput = new promClient.Gauge({
  name: "factorio_power_production_output",
  help: "Factorio power production output",
  labelNames: ["server", "force"],
});
register.registerMetric(powerOutput);

const trainCount = new promClient.Gauge({
  name: "factorio_train_count",
  help: "Factorio train count",
  labelNames: ["server", "force"],
});
register.registerMetric(trainCount);
const trainWaitTimeStation = new promClient.Gauge({
  name: "factoro_train_waiting_time_station",
  help: "Factorio train wating time in stations",
  labelNames: ["server", "force"],
});
register.registerMetric(trainWaitTimeStation);
const trainWaitTimeSignal = new promClient.Gauge({
  name: "factoro_train_waiting_time_signal",
  help: "Factorio train wating time at signals",
  labelNames: ["server", "force"],
});
register.registerMetric(trainWaitTimeSignal);
const trainTravelTime = new promClient.Gauge({
  name: "factoro_train_travel_time",
  help: "Factorio train traveling time",
  labelNames: ["server", "force"],
});
register.registerMetric(trainTravelTime);

const researchGauge = new promClient.Gauge({
  name: "factoro_research",
  help: "Factorio research",
  labelNames: ["server", "force", "name", "position", "level"],
});
register.registerMetric(researchGauge);

const itemProductionInput = new promClient.Gauge({
  name: "factorio_item_production_input",
  help: "Factorio item production input",
  labelNames: ["server", "force", "name"],
});
register.registerMetric(itemProductionInput);
const itemProductionOutput = new promClient.Gauge({
  name: "factorio_item_production_output",
  help: "Factorio item production output",
  labelNames: ["server", "force", "name"],
});
register.registerMetric(itemProductionOutput);
const fluidProductionInput = new promClient.Gauge({
  name: "factorio_fluid_production_input",
  help: "Factorio fluid production input",
  labelNames: ["server", "force", "name"],
});
register.registerMetric(fluidProductionInput);
const fluidProductionOutput = new promClient.Gauge({
  name: "factorio_fluid_production_output",
  help: "Factorio fluid production output",
  labelNames: ["server", "force", "name"],
});
register.registerMetric(fluidProductionOutput);
const killProductionInput = new promClient.Gauge({
  name: "factorio_kill_production_input",
  help: "Factorio kill production input",
  labelNames: ["server", "force", "name"],
});
register.registerMetric(killProductionInput);
const killProductionOutput = new promClient.Gauge({
  name: "factorio_kill_production_output",
  help: "Factorio kill production output",
  labelNames: ["server", "force", "name"],
});
register.registerMetric(killProductionOutput);
const buildProductionInput = new promClient.Gauge({
  name: "factorio_build_production_input",
  help: "Factorio build production input",
  labelNames: ["server", "force", "name"],
});
register.registerMetric(buildProductionInput);
const buildProductionOutput = new promClient.Gauge({
  name: "factorio_build_production_output",
  help: "Factorio build production output",
  labelNames: ["server", "force", "name"],
});
register.registerMetric(buildProductionOutput);

const robotCount = new promClient.Gauge({
  name: "factorio_robot_count",
  help: "Factorio robot count",
  labelNames: ["server", "force", "type"],
});
register.registerMetric(robotCount);
const availableRobotCount = new promClient.Gauge({
  name: "factorio_available_robot_count",
  help: "Factorio available robot count",
  labelNames: ["server", "force", "type"],
});
register.registerMetric(availableRobotCount);
const chargingRobotCount = new promClient.Gauge({
  name: "factorio_charging_robot_count",
  help: "Factorio charging robot count",
  labelNames: ["server", "force"],
});
register.registerMetric(chargingRobotCount);
const toChargeRobotCount = new promClient.Gauge({
  name: "factorio_to_charge_robot_count",
  help: "Factorio to charge robot count",
  labelNames: ["server", "force"],
});
register.registerMetric(toChargeRobotCount);
const logisticStorageItem = new promClient.Gauge({
  name: "factorio_logistic_storage_item",
  help: "Factorio logistic storage item",
  labelNames: ["server", "force", "name"],
});
register.registerMetric(logisticStorageItem);
const logisticPickupItem = new promClient.Gauge({
  name: "factorio_logistic_pickup_item",
  help: "Factorio logistic pickup item",
  labelNames: ["server", "force", "name"],
});
register.registerMetric(logisticPickupItem);
const logisticDeliveryItem = new promClient.Gauge({
  name: "factorio_logistic_delivery_item",
  help: "Factorio logistic delivery item",
  labelNames: ["server", "force", "name"],
});
register.registerMetric(logisticDeliveryItem);

class GrafanaHandler {
  servers: FactorioServer[];
  interval: NodeJS.Timeout;
  constructor() {
    this.servers = servers
      .map((server) => {
        if (!server.enabledGraftorio) return;
        return server;
      })
      .filter((r) => r);

    this.interval = setInterval(
      () => this.gatherStatistics(),
      config.grafanaInterval || 5 * 1000
    );
  }
  /**
   *
   * @param {string} statistics
   * @param {*} server
   */
  handleStatistics(statistics, server) {
    if (!statistics || typeof statistics !== "string") return;
    const json = JSON.parse(statistics.split("\n")[0]);
    const otherStats = json[Object.keys(json)[0]].other;

    playercountGauge.set(
      { server: server.name },
      Array.isArray(otherStats.online_players)
        ? otherStats.online_players.length
        : 0
    );
    Object.keys(otherStats.mods).forEach((modname) =>
      modGauge.set(
        {
          server: server.name,
          name: modname,
          version: otherStats.mods[modname],
        },
        1
      )
    );
    Object.keys(otherStats.seed).forEach((surfacename) =>
      seedGauge.set(
        { server: server.name, surface: surfacename },
        otherStats.seed[surfacename]
      )
    );

    Object.keys(json).map((forcename) => {
      const force = json[forcename];
      const research = force["research"];
      const trains = force["trains"];
      const production = force["production"];
      const robots = force["robots"];
      const power = force["power"];

      researchGauge.reset();
      if (Array.isArray(research))
        research.forEach((research, i) =>
          researchGauge.set(
            {
              server: server.name,
              force: forcename,
              name: research.name,
              level: research.level,
              position: i,
            },
            research.progress
          )
        );
      if (trains) {
        trainCount.set({ server: server.name, force: forcename }, trains.total);
        trainTravelTime.set(
          { server: server.name, force: forcename },
          trains.time_travelling
        );
        trainWaitTimeSignal.set(
          { server: server.name, force: forcename },
          trains.waiting_time_signal
        );
        trainWaitTimeStation.set(
          { server: server.name, force: forcename },
          trains.waiting_time_station
        );
      }

      if (production) {
        Object.keys(production.item_input).forEach((key) =>
          itemProductionInput.set(
            { server: server.name, force: forcename, name: key },
            production.item_input[key].count
          )
        );
        Object.keys(production.item_output).forEach((key) =>
          itemProductionOutput.set(
            { server: server.name, force: forcename, name: key },
            production.item_output[key].count
          )
        );
        Object.keys(production.fluid_input).forEach((key) =>
          fluidProductionInput.set(
            { server: server.name, force: forcename, name: key },
            production.fluid_input[key].count
          )
        );
        Object.keys(production.fluid_output).forEach((key) =>
          fluidProductionOutput.set(
            { server: server.name, force: forcename, name: key },
            production.fluid_output[key].count
          )
        );
        Object.keys(production.kill_input).forEach((key) =>
          killProductionInput.set(
            { server: server.name, force: forcename, name: key },
            production.kill_input[key].count
          )
        );
        Object.keys(production.kill_output).forEach((key) =>
          killProductionOutput.set(
            { server: server.name, force: forcename, name: key },
            production.kill_output[key].count
          )
        );
        Object.keys(production.build_input).forEach((key) =>
          buildProductionInput.set(
            { server: server.name, force: forcename, name: key },
            production.build_input[key].count
          )
        );
        Object.keys(production.build_output).forEach((key) =>
          buildProductionOutput.set(
            { server: server.name, force: forcename, name: key },
            production.build_output[key].count
          )
        );
      }

      if (robots) {
        robotCount.set(
          { server: server.name, force: forcename, type: "construction" },
          robots.all_construction_robots
        );
        robotCount.set(
          { server: server.name, force: forcename, type: "logistic" },
          robots.all_logistic_robots
        );
        availableRobotCount.set(
          { server: server.name, force: forcename, type: "construction" },
          robots.available_construction_robots
        );
        availableRobotCount.set(
          { server: server.name, force: forcename, type: "logistic" },
          robots.available_logistic_robots
        );
        chargingRobotCount.set(
          { server: server.name, force: forcename },
          robots.charging_robot_count
        );
        toChargeRobotCount.set(
          { server: server.name, force: forcename },
          robots.to_charge_robot_count
        );
        Object.keys(robots.items).forEach((itemname) =>
          logisticStorageItem.set(
            { server: server.name, force: forcename, name: itemname },
            robots.items[itemname]
          )
        );
        Object.keys(robots.pickups).forEach((itemname) =>
          logisticPickupItem.set(
            { server: server.name, force: forcename, name: itemname },
            robots.pickups[itemname]
          )
        );
        Object.keys(robots.deliveries).forEach((itemname) =>
          logisticDeliveryItem.set(
            { server: server.name, force: forcename, name: itemname },
            robots.deliveries[itemname]
          )
        );
      }

      if (power) {
        powerInput.set(
          { server: server.name, force: forcename },
          Math.round(power.input)
        );
        powerOutput.set(
          { server: server.name, force: forcename },
          Math.round(power.output)
        );
      }
    });
  }
  gatherStatistics() {
    this.servers.forEach(async (server) => {
      const data = await rcon.rconCommand(
        "/collectdata rcon",
        server.discordid
      );
      if (data) this.handleStatistics(data.resp, server);
    });
  }
  destroy() {
    clearTimeout(this.interval);
  }
}

new GrafanaHandler();
