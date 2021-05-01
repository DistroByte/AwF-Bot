module.exports = {
  plugins: [],
  source: {
    include: ["."],
    exclude: ["docs/", "node_modules/"]
  },
  opts: {
    recurse: true,
    destination: "./docs/",
  }
}