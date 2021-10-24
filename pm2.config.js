module.exports = {
  apps: [
    {
      name: "AwF-Bot",
      script: "dist/index.js",
      env: {
        NODE_ENV: "production",
      },
      watch: ["dist"],
      ignore_watch: ["node_modules", ".git"],
    },
  ],
};
