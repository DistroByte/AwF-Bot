// download a message attatchment
if (message.attachments.first()) {
    let file = message.attachments.first();
    var outFile = fs.createWriteStream("filename"); // filename should be from point where you run `node .`
    console.log(file.url);
    https.get(file.url, function(response) {
        response.pipe(outFile);
        outFile.on('finish', function() {
        outFile.close();
        });
    });
}