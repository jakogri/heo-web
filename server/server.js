const EXPRESS = require('express');
const PATH = require('path');
const AWS = require('aws-sdk');
const FILE_UPLOAD = require('express-fileupload');
const CORS = require('cors');
const AXIOS = require('axios');
const { MongoClient } = require('mongodb');
const { default: axios } = require('axios');
const jwt = require('express-jwt');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const ethereumutil = require("ethereumjs-util");
const PORT = process.env.PORT || 5000;

require('dotenv').config({path : PATH.resolve(process.cwd(), '.env')});

const APP = EXPRESS();
APP.use(FILE_UPLOAD());
APP.use(CORS());
APP.use(EXPRESS.json());

const URL = `mongodb+srv://${process.env.MONGO_LOGIN}:${process.env.MONGODB_PWD}${process.env.MONGO_URL}`;
const DBNAME = process.env.MONGO_DB_NAME;
const CLIENT = new MongoClient(URL);

CLIENT.connect(err => {
    if(err) {
        console.log(err);
    }
    console.log('connected succesfully to server');    
});

// Serve the static files from the React APP
APP.use(EXPRESS.static(PATH.join(__dirname, '../build')));
const S3 = new AWS.S3({
    accessKeyId: process.env.SERVER_APP_ACCESS_ID,
    secretAccessKey: process.env.SERVER_APP_ACCESS_KEY
});

APP.use(cookieParser());
APP.use(jwt({ secret: process.env.JWT_SECRET, credentialsRequired:false, getToken: req => req.cookies.authToken, algorithms: ['HS256'] }));
APP.use(jwtErrorCatch);
function jwtErrorCatch (err, req, res, next) {
    if(err && err.code == "invalid_token") {
        next(null, req, res.clearCookie('authToken'));
    } else {
        next(err, req, res);
    }
}
APP.post('/api/uploadimage', (req,res) => {
    if(req.user && req.user.address) {
        const PARAMS = {
            Bucket: process.env.SERVER_APP_BUCKET_NAME,
            Key: process.env.SERVER_APP_IMG_DIR_NAME + '/' + req.files.myFile.name,
            Body: req.files.myFile.data
        }

        S3.upload(PARAMS, (error, data) => {
            if (error) {
                console.log(error);
                res.sendStatus(500);
            } else {
                res.send(data.Location);
            }
        });
    } else {
        res.sendStatus(401);
    }
});

APP.post('/api/campaign/update', (req, res) => {
    if (req.user && req.user.address) {
        const DB = CLIENT.db(DBNAME);
        DB.collection('campaigns')
            .updateOne({'_id': req.body.mydata.address}, {$set: req.body.mydata.dataToUpdate}, (err, result) => {
                if (err) {
                    res.sendStatus(500);
                    console.log(err);
                } else {
                    res.send('success');
                }
            });
    } else {
        res.sendStatus(401);
    }
});

APP.post('/api/deleteimage', (req, res) => {
    if(req.user && req.user.address) {
        const PARAMS = {
            Bucket: process.env.SERVER_APP_BUCKET_NAME,
            Key: process.env.SERVER_APP_IMG_DIR_NAME + '/' + req.body.name,
        }
        S3.deleteObject(PARAMS, (error, data) => {
            if (error) {
                console.log(error, error.stack);
                res.sendStatus(500);
            } else {
                res.send('complete');
            }
        });
    }  else {
        console.log('failed to delete');
        res.sendStatus(401);
    }
});

APP.post('/api/campaign/delete', (req, res) => {
    if(req.user && req.user.address) {
        const DB = CLIENT.db(DBNAME);
        DB.collection('campaigns')
        .deleteOne({'_id': req.body.address}, (err, result) => {
            if(err){
                res.sendStatus(500);
                console.log(err);
            } else {
                res.send('success');
            }
        });  
    }  else {
        console.log('failed to delete');
        res.sendStatus(401);
    }   
});

APP.post('/api/campaign/add', (req, res) => {
    if(req.user && req.user.address) {
        const ITEM = {
            _id: req.body.mydata.address.toLowerCase(),
            beneficiaryId: req.body.mydata.beneficiaryId.toLowerCase(),
            ownerId: req.user.address.toLowerCase(),
            title: req.body.mydata.title,
            mainImageURL: req.body.mydata.mainImageURL,
            vl: req.body.mydata.vl,
            cn: req.body.mydata.cn,
            fn: req.body.mydata.fn,
            ln: req.body.mydata.ln,
            org: req.body.mydata.org,
            description: req.body.mydata.description,
            currencyName: req.body.mydata.currencyName,
            maxAmount: req.body.mydata.maxAmount,
            descriptionEditor: req.body.mydata.descriptionEditor,
            raisedAmount: 0,
            creationDate: Date.now(),
            lastDonationTime: 0
        }
        const DB = CLIENT.db(DBNAME);
        DB.collection('campaigns')
            .insertOne(ITEM, function (err, result) {
                if (err) {
                    res.sendStatus(500);
                    console.log(err);
                } else {
                    res.send('success');
                    console.log("1 entry was insterted in db");
                }
            });
    } else {
        res.sendStatus(401);
    }
});

APP.post('/api/campaign/loadAll', (req, res) => {
    const DB = CLIENT.db(DBNAME);
    DB.collection("campaigns").find().sort({"lastDonationTime" : -1}).toArray(function(err, result) {
        if (err) throw err;
        res.send(result);
      });
})

APP.post('/api/campaign/loadOne', async (req, res) => {
    const DB = CLIENT.db(DBNAME);
    let result = await DB.collection("campaigns").findOne({"_id" : req.body.ID});
    res.send(result);
})

APP.post('/api/campaign/loadUserCampaigns',
    (req, res) => {
    if(req.user && req.user.address) {
        const DB = CLIENT.db(DBNAME);
        DB.collection("campaigns").find({"ownerId" : {$eq: req.user.address}}).toArray(function(err, result) {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            } else {
                res.send(result);
            }
        });
    } else {
        res.sendStatus(401);
    }
})

APP.get('/api/env', (req,res) => {
    res.json(
        {
            CHAIN: process.env.CHAIN    ,
            CHAIN_NAME: process.env.CHAIN_NAME,
            WEB3_RPC_NODE_URL: process.env.WEB3_RPC_NODE_URL,
            WEB3_RPC_CHAIN_ID: process.env.WEB3_RPC_CHAIN_ID,
            WC_BRIDGE_URL: process.env.WC_BRIDGE_URL,
            WC_CHAIN_NAME: process.env.WC_CHAIN_NAME,
            WEB3_HEX_CHAIN_ID: process.env.WEB3_HEX_CHAIN_ID,
            WEB3_BLOCK_EXPLORER_URL: process.env.WEB3_BLOCK_EXPLORER_URL
        });
});

APP.get('/api/auth/msg', (req, res) => {
    res.json({dataToSign:`Today is ${(new Date()).toDateString()}`});
});

APP.post('/api/auth/jwt', async(req, res) => {
    //extract Address from signature
    try {
        let dataToSign = `Today is ${(new Date()).toDateString()}`;
        var signature;
        if(req.body.signature && req.body.signature.signature) {
            signature = req.body.signature.signature;
        } else if(req.body.signature) {
            signature = req.body.signature;
        }
        const {v, r, s} = ethereumutil.fromRpcSig(signature);
        let signedData = ethereumutil.keccak("\x19Ethereum Signed Message:\n" + dataToSign.length + dataToSign);
        const pubKey = ethereumutil.ecrecover(signedData, v, r, s);
        const addrBuf = ethereumutil.pubToAddress(pubKey);
        const addr = ethereumutil.bufferToHex(addrBuf).toLowerCase();
        if(addr != req.body.addr.toLowerCase()) {
            res.sendStatus(401);
        } else {
            let token = jsonwebtoken.sign({ address:addr }, process.env.JWT_SECRET, { expiresIn: '7d' });
            res.cookie('authToken', token, { httpOnly: true }).send({success:true});
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(401);
    }
});

APP.get('/api/auth/status', (req, res) => {
    if(req.user && req.user.address) {
        res.send({addr:req.user.address});
    } else {
        res.sendStatus(401);
    }
});

APP.post('/api/auth/logout', (req, res) => {
    res.clearCookie('authToken').send({});
});


// Handles any requests that don't match the ones above.
// All other routing except paths defined above is done by React in the UI
APP.get('*', (req,res) =>{
    res.sendFile(PATH.join(__dirname, '..', 'build', 'index.html'));
});

APP.listen(PORT);

console.log('App is listening on port ' + PORT);
