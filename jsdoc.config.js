module.exports = {
  plugins: [],
  source: {
    include: ["."],
    exclude: ["docs/", "node_modules/", ".git/"]
  },
  opts: {
    recurse: true,
    destination: "./docs/html",
  }
}