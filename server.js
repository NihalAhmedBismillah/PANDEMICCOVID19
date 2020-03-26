//Install express server
const express = require('express');
const path = require('path'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cors = require('cors'),
    helmet = require('helmet');


const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(cors());
app.options('*', cors());
app.use(helmet());
app.use(helmet.noCache());
app.use(helmet.frameguard());
// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/globalcasescovid19'));

app.get('/*', function (req, res) {

    res.sendFile(path.join(__dirname + '/dist/globalcasescovid19/index.html'));
});
app.get('/ping', function (req, res) {
     
    const resMsg = 'Server is running : '+new Date().toISOString();
    res.send(resMsg)
});
app.use(function (err, req, res, next) {
    res.status(err.status || 500).send({
        success: false,
        message: 'internal server error .'
    });
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080,()=>{
    console.log( "Express application listening on port " + 8080 );
});