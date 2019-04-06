var express = require("express");
var bodyParser = require("body-parser");
// var routes = require("./routes/routes.js");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes(app);
//define util function.
const util = require('util');
const exec = util.promisify(require('child_process').exec);

var server = app.listen(3001, function () {
    console.log("app running on port.", server.address().port);
});

//setting up JS rpc
var grpc = require('grpc');
var fs = require("fs");

// Due to updated ECDSA generated tls.cert we need to let gprc know that
// we need to use that cipher suite otherwise there will be a handhsake
// error when we communicate with the lnd rpc server.
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA'

//  Lnd cert is at ~/.lnd/tls.cert on Linux and
//  ~/Library/Application Support/Lnd/tls.cert on Mac
var lndCert = fs.readFileSync("~/.lnd/tls.cert");
var credentials = grpc.credentials.createSsl(lndCert);
var lnrpcDescriptor = grpc.load("rpc.proto");
var lnrpc = lnrpcDescriptor.lnrpc;
var lightning = new lnrpc.Lightning('localhost:10009', credentials);

lightning.getInfo({}, function(err, response) {
    console.log('GetInfo:', response);
});

async function fetchChannelList() {
    const { stdout, stderr } = await exec('lncli --network=testnet listchannels');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    return stdout;
}

async function sendChallenge(credential) {
    let nodeId = credential.id;

    const { stdout, stderr } = await exec('lncli --network=testnet listchannels');
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    return stdout;
}

//verifying node gets the DID document from provider
app.post('/verifyCredential', async function(request, response){
    let unverifiedCredential = request.body;

    // verifying node challenges provider of document to prove they are the subject (id) in the document : "987638276 sign this message"
    let challengeResults = sendChallenge(request.body)

    let signedCredential = request.body;

    if (isChannelVerified) {
        response.send(signedCredential);    
    } else {
        response.status(500).send('Channel not found');
    }
    
    response.send(channelList);    // echo the result back but signed
  });