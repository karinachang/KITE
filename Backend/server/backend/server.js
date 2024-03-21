// CONSTANTS FOR SCRIPTS
const express = require("express");
const mysql = require("mysql2");
const { v4: uuidv4 } = require('uuid');
const functions = require("@google-cloud/functions");

// CONSTANTS FOR STORAGE BUCKET
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
    projectId: "KITE",
    keyFilename: "/app/backend/bucketUpload/service-account.json",
});
const bucket = storage.bucket('kitebucket');
const bucketName = 'kitebucket';
const fileName = 'akite.jpg';
const filePath = '/app/backend/bucketUpload/akite.jpg';

// CONSTANTS FOR DATABASE
const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const MYSQLDB = String(process.env.MYSQLDB);
const MYSQLCOL = String(process.env.MYSQLCOL);
const DATATEST = "TTL";
var SQL = "SELECT * FROM storage;";
var hash = "cfdbf3";

const app = express();
app.use(express.json());


let connection = mysql.createConnection({
    host: MYSQLHOST,
    user: MYSQLUSER,
    password: MYSQLPASS,
    database: MYSQLDB,
    multipleStatements: true
});

//app.use("/", express.static("frontend"));



// define the function for file download
async function downloadFile() {
    // passing the options
    const options = {
        destination: `GCPdownload.txt`,
    };
    // download object from Google Cloud Storage bucket
    await bucket.file(fileName).download(options);

    // [optional] a good log can help you in debugging
    console.log(
        "The object " + fileName +
        " coming from bucket " + `kitebucket` +
        " has been downloaded to " + `GCPdownload.txt`
    );
}

//function for generating 6-digit code using uuidv4
function create_uuid() {
    let code = uuidv4();
    let last6 = code.slice(-6);
    return last6;
}

//create sql command to insert into database
function sqlCommand(data) {
    let file_info = JSON.parse(data);
    let command = `INSERT INTO storage (  ${MYSQLCOL}  ) VALUES(  ${file_info} )`;
    return command;
}

// GET ALL ROWS IN DATABASE
app.get("/query", function (request, response) {
    SQL = "SELECT *  FROM storage"
    connection.query(SQL, [true], (error, results, fields) => {
        if (error) {
            console.error(error.message);
            response.status(500).send("database error");
        } else {
            console.log(results);
            response.send(results);
        }
    });  
})

app.get("/bucket", async (request, response) => {
    try {
        const options = {
            destination: `GCPdownload.txt`,
        };
        // download object from Google Cloud Storage bucket
        await bucket.file(fileName).download(options);


        //const file = bucket.file(fileName);
        /*
        bucket.file(fileName).download({
            destination: path.join(process.cwd(), "downloads", fileName)
        }, function (err) { });*/


        // [optional] a good log can help you in debugging
        console.log(
            "The object " + fileName +
            " coming from bucket " + `kitebucket` +
            " has been downloaded to " + `GCPdownload.txt`
        );
        response.send("file download success!");

    } catch {
        (console.error);
        response.send("GCP error");
    };
})

async function deleteFile() {
    await bucket.file(fileName).delete();

    console.log(`gs://kitebucket/${fileName} deleted`);
}

async function uploadFile() {
    const options = {
        destination: 'akite.jpg',
    };

    await storage.bucket(bucketName).upload(filePath, options);
    console.log(`${filePath} uploaded to ${bucketName}`);
}

app.get("/deleteFile", async (request, response) => {
    try {
        deleteFile().catch(console.error);
        response.send(`gs://kitebucket/${fileName} deleted`);
    } catch {
        (console.error);
        response.send("delete error");
    }
})

// DELETE PROPER ROWS IN DATABASE AND UPDATE THE DOWNLOAD FUNCTION
app.get("/update", function (request, response) {
    if (DATATEST == "TTL") {
        //SQL = "SELECT timeOfDeath FROM storage;"
        SQL = (
            `DELETE FROM storage ` +
            `WHERE timeOfDeath < NOW() OR remainingDownloads = 1; ` +

            `UPDATE storage ` +
            `SET remainingDownloads = remainingDownloads - 1 ` +
            `WHERE hash = '${hash}' AND timeOfDeath > NOW() AND remainingDownloads > 0;`
        );
        console.log(SQL)
    }
    connection.query(SQL, [true], (error, results, fields) => {
        if (error) {
            console.error(error.message);
            response.status(500).send("database error");
        } else {
            console.log(results);
            response.send(results);
        }
    });
})

// DISPLAY THE ROWS THAT NEED TO BE DELETED
app.get("/delete", function (request, response) {
    if (DATATEST == "TTL") {
        //SQL = "DELETE FROM storage WHERE timeOfDeath < NOW() OR remainingDownloads = 0;"
        SQL = "SELECT *  FROM storage WHERE timeOfDeath < NOW() OR remainingDownloads = 1;"
    }
    connection.query(SQL, [true], (error, results, fields) => {
        if (error) {
            console.error(error.message);
            response.status(500).send("database error");
        } else {
            console.log(results);
            response.send(results);
        }
    });
})

// ADD A LINE INTO THE DATABASE
app.get("/uploadFile", function (request, response) {
    //generate 6-digit code
    let code = create_uuid();
    //TESTING- PRINT OUT 6-DIGIT CODE
    console.log(code);
    //store code and metadata into array
    let arr = ["'"+code+"'", "'2024-08-05 00:00:00'",3,"'testpass1'", "'./getrid.gif'"];
    //generate sql command
    let SQL = sqlCommand(JSON.stringify(arr));

    uploadFile().catch(console.error);

    connection.query(SQL, [true], (error, results, fields) => {
        if (error) {
            console.error(error.message);
            response.status(500).send("database error");
        } else {
            console.log(results);
            response.send(results);
        }
    });
    return;
});

app.get(`/${hash}`, function (request, response) {
    if (DATATEST == "TTL") {
        //SQL = "DELETE FROM storage WHERE timeOfDeath < NOW() OR remainingDownloads = 0;"
        SQL = `SELECT *  FROM storage WHERE hash = '${hash}';`
    }
    connection.query(SQL, [true], (error, results, fields) => {
        if (error) {
            console.error(error.message);
            response.status(500).send("database error");
        } else {
            console.log(results);
            response.send(results);
        }
    });
})
/*
app.post("/uploadDataTest", function (request, response){
    console.log(request.body);
    response.send(request.body);
    return;
}); */




app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
