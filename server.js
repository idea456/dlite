const Koa = require("koa");
const serve = require("koa-static");
const app = new Koa();
const path = require("path");

app.use(
    serve(path.join(__dirname, "dist"), {
        gzip: true,
    }),
);
app.listen(3000);
console.log("Smol website is running at => http://localhost:3000");
