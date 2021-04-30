module.exports = {
  apps: [{
    name: 'AwF-Bot',
    script: 'index.js',
    env: {
      "NODE_ENV": "production"
    },
    watch: ["*"],
    ignore_watch: ["node_modules", ".git"],
  }]
}