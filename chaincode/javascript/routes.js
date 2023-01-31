
var data = require('./controller');

module.exports = (app) => {
    app.get('/get_data/:id', (req, res) => {
        data.get_data(req, res);
    });

    app.get('/add_data/:data', (req, res)=>{
        data.add_data(req, res);
    })
    app.get('/get_all_data', (req, res) => {
        data.get_all_data(req, res);
    });
    
    app.get('/change_holder/:holder', (req, res) => {
        data.change_holder(req, res);
    });

    app.get('/double_booking', (req, res) => {
        data.double_booking(req, res);
    });

}
