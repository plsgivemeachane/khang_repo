const index = (req, res) => {
    res.render("index");
}
const test = (req, res) => {
    res.render("test");
}
module.exports = {
    index,
    test
}