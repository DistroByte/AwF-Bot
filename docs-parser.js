const html2md = require("html-to-md")
const fs = require("fs")

// empty stuff
fs.rmSync(`${__dirname}/docs/md/`, { force: true, recursive:true })
fs.mkdirSync(`${__dirname}/docs/md/`)

// i've drowned in alcohol. just get 'jsdoc-to-markdown' working instead of trying to remove whitespaces from the shittily done html

const files = fs.readdirSync(`${__dirname}/docs/html/`).filter((file) => file.endsWith('.html'))
// TODO: remove empty newlines from html
let md = files.map((htmlname) => {
    return {
        name: htmlname.slice(0, htmlname.indexOf(".html")),
        html: fs.readFileSync(`${__dirname}/docs/html/${htmlname}`).toString('utf-8')
    }
})
md = md.map((file) => {
    while (file.html.match(/\n\n/g) !== null) {
        console.log(`replacing in ${file.name}`)
        file.html = file.html.replace(/\n{2,}/g, '\n').replace(/( )+(\n)+/g, "").trim()
    }
    file.md = html2md(file.html.replaceAll('.html', '.md'))
    return file
})

md.forEach((file) => {
    fs.writeFileSync(`${__dirname}/docs/md/${file.name}.md`, file.md)
})

// TODO: remove whitespaces at the start of newlines