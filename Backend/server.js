////CONSTANTS FOR SCRIPTS////
const express = require("express");
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");
const functions = require("@google-cloud/functions");

////CONSTANTS FOR STORAGE BUCKET////
const { Storage } = require("@google-cloud/storage");
const storage = new Storage({
  projectId: "KITE",
  keyFilename: "./Backend/bucketUpload/service-account.json",
});
const bucket = storage.bucket("kitebucket");
const bucketName = "kitebucket";

////CONSTANTS FOR DATABASE////
const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const MYSQLDB = String(process.env.MYSQLDB);
const MYSQLCOL = String(process.env.MYSQLCOL);

//constants for hash
const bcrypt = require('bcrypt');
const saltRounds = 10;

//Selects database
var SQL = "SELECT * FROM storage;";

//Testing commands for MYSQL database
var code = ""; //dummy code

const app = express();
app.use(express.json());

//Connect to MYSQL DATABASE
let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: MYSQLDB,
  multipleStatements: true,
});

/////////////////////FUNCTIONS/////////////////////
//Returns true if the given code is in the database

function codeInUse(code) {
    let SQL = `SELECT password FROM storage WHERE hash = '${code}';`
    console.log(SQL);
    console.log(connection.query(SQL, [true], (error, results, fields) => {
        if (error) {
            console.error(error.message);
            response.status(500).send("database error");
        } else {
            console.log("This is codeInUse results: ", results);
            console.log("This is results.length", results.length);
            if (results.length == 0) {
                codeExists = false;
            }
            else {
                codeExists = true;
            }
        }
    }));
    console.log("does code exist?:"  + codeExists);
}

function hasPassword(code) {
    let SQL = `SELECT password FROM storage WHERE hash = '${code}';`
    connection.query(SQL, [true], (error, results, fields) => {
        if (error) {
            console.error(error.message);
            response.status(500).send("database error");
        } else {
            console.log(results);
            if (results == null) {
                return false;
            }
            else {
                return true;
            }
        }
    });
}

//Generates unique code using last 6-digits of uuidv4
function create_6dCode() {
    let code = uuidv4();
    let last6 = code.slice(-6);
    return last6;
}

async function hashPass(pass) {
    let hashed = bcrypt.hashSync(pass, saltRounds);
    return hashed;
}

//Creates sql command to insert data into database
async function sqlCommand(data) {
    let file_info = JSON.parse(data);
    var command;
    let NULL = null;

    console.log(file_info.password);
    console.log(typeof (file_info.password));

    let newPass = await hashPass(file_info.password);

    console.log(newPass);
    console.log(typeof (newPass));

    if (file_info.password != null) {
            command = `INSERT INTO storage (${MYSQLCOL} ) VALUES(
		'${file_info.hash}',
		'${file_info.timeOfDeath}',
		${file_info.remainingDownloads},
		'${newPass}',
		'${file_info.hash}.zip',
		${file_info.numberOfFiles},
		${file_info.TotalByteSize} )`;
    }

     else {
        console.log("IN IF STATEMENT");
        command = `INSERT INTO storage (${MYSQLCOL} ) VALUES(
		'${file_info.hash}',
		'${file_info.timeOfDeath}',
		${file_info.remainingDownloads},
        ${NULL},
		'${file_info.hash}.zip',
		${file_info.numberOfFiles},
		${file_info.TotalByteSize} )`;
    }
    console.log(typeof (command));
    console.log(command);
    return command;
}

//Uploads a file from memory
async function uploadFromMemory(destFileName, contents) {
    await storage.bucket(bucketName).file(destFileName).save(contents);
    console.log(
        `${destFileName} uploaded to ${bucketName}.`
    );
};

//Downloads a file from gcp bucket
async function downloadFile() {
  //passing options
  const options = {
    destination: fileDownloadPath,
  };
  //download object from GCP storage bucket
  await bucket.file(fileName).download(options);
  {
    console.log(
      "The object " +
        fileName +
        " coming from bucket " +
        `kitebucket` +
        " has been downloaded to " +
        `GCPdownload.txt`
    );
  }
}

//Deletes a given file from gcp bucket
async function deleteFile(fName) {
  await bucket.file(fName).delete();
  console.log(`gs://kitebucket/${fName} deleted`);
}

/////////////////////PAGES/////////////////////

//Returns 2 boolens
//recieve code
//whether or not a code exists / weather or not it has a password
//response is tuple

app.post("/codeInfo", function (request, response) {
    console.log(request.body);

    //whether or not the code exists in database
    let code = codeInUse(request.body["code"]);
    console.log("Code in use: ", code);

    //whether or not the code has a password
    let password = hasPassword(request.body["code"]);
    console.log("Has password: ", password);

    response.status(200).json({ 'password': password, 'code': code});
});

app.post("/query", function (request, response) {
  console.log(request.body);
  SQL = "SELECT * FROM storage WHERE hash='" + request.body["code"] + "'";
  connection.query(SQL, [true], (error, results, fields) => {
    if (error) {
      console.error(error.message);
      response.status(500).send("database error");
    } else {
      console.log(results);
      response.status(200).json(results[0]);
    }
  });
});

// Endpoint to get total size of files for a given hash
// app.post("/getTotalSize", function (request, response) {
//   const hash = request.body.code;
//   const query = "SELECT TotalByteSize FROM storage WHERE hash = ?";

//   connection.query(query, [hash], (error, results) => {
//     if (error) {
//       console.error("Database error:", error.message);
//       response.status(500).send("Database error");
//     } else if (results.length > 0) {
//       response.status(200).json({ totalSize: results[0].TotalByteSize });
//     } else {
//       response.status(404).send("No data found");
//     }
//   });
// });

// function that takes in a password string, encrypts it, and checks if that string is the same as the one stored in the database
app.post("/passwordCheck", function (request, response) {
    //this is the plain text password
    console.log(request.body);
    let code = request.body["code"];
    let passwordInput = request.body["password"];
    console.log("This is the password input: " + passwordInput);

    SQL = "SELECT password FROM storage WHERE hash='" + code + "'";
    connection.query(SQL, [true], (error, results, fields) => {
        let databasePassword = results[0]['password'];
        console.log("this is the returned password: " + databasePassword);
        if (error) {
            console.error(error.message);
            response.status(500).send("database error");
        } else {
            let comparison = bcrypt.compareSync(passwordInput, databasePassword);
            if (comparison) {
                //password match!
                response.status(200).json(true);
            }
            else {
                //wrong password
                console.log(comparison);
                response.status(401).json(false);
            }
        }
    });
});

//Uploads a file into GCP storage bucket
app.post("/fileUpload", express.raw({type: "*/*"}), function (request, response) {
  try{
    uploadFromMemory(code + ".zip", request.body);
    console.log("upload success");
    response.status(200).send("upload success");
  }
  catch{
    console.log("upload failed");
    response.status(400).send("upload failed");
  }
});

//Adds a line to MYSQL database & uploads file to gcp storage bucket
app.post("/databaseUpload", async function (request, response) {
    code = create_6dCode();

    //Add code to JSON file
    request.body["hash"] = code;

    //hash password
    request.body

    //generate sql command
    let SQL = await sqlCommand(JSON.stringify(request.body));

    //Send sql command
    connection.query(SQL, [true], (error, results, fields) => {
        if (error) {
            console.error(error.message);
            response.status(500).send('database error');
        }
        else {
            console.log(results);
            response.status(200).send(code);
        }
    });
    return;
});

//Downloads a file from the GCP storage bucket
//File is deleted if there are no more remaining downloads or if it's time of death has passed
app.post("/downloadFile", function (request, response) {
    console.log(request.body);
    let hash = request.body["code"];
    SQL =
      `SELECT storageAddress FROM storage ` +
      `WHERE hash = '${hash}';` +
      `DELETE FROM storage ` +
      `WHERE hash = '${hash}' AND remainingDownloads = 1; ` +
      `DELETE FROM storage ` +
      `WHERE timeOfDeath < NOW() OR remainingDownloads <= 1; ` +
      `UPDATE storage ` +
      `SET remainingDownloads = remainingDownloads - 1 ` +
        `WHERE hash = '${hash}' AND timeOfDeath > NOW() AND remainingDownloads > 0;`;

  connection.query(SQL, [true], (error, results, fields) => {
    if (error) {
      console.error(error.message);
      response.status(500).send("database error");
    } else {
      stringResults = JSON.stringify(results);
      // This removes the file name from the SQL query
      fName = stringResults.slice(21, stringResults.length - 112 * 3 - 2);
      //This says if the file has been succesfully deleted from the database
      deleteCheck = stringResults.slice(
        stringResults.length - 334,
        stringResults.length - 301
      );
      // this checks if the hash is found and should be downloaded
      endCheck = stringResults.slice(
        stringResults.length - 148,
        stringResults.length
      );
      let result = fName;


      if (!deleteCheck.includes("1")) {
        if (endCheck.includes("1")) {
          //response.send(`${fName} remaining downloads decreased by 1`);
          console.log(`${fName} remaining downloads decreased by 1`);
          response.status(200).json(result);
        } else {
          console.log(`\nTHIS IS DELETE CHECK: \n ${deleteCheck}`);
          console.log(`\nTHIS IS END CHECK: \n ${endCheck}`);
          //Does not exist in database
          response.send("Database entry not found");
          console.log(results);
        }
      } else {
        //Exists in database
        //if stringResults.includes("1");
        try {
          deleteFile(fName).catch(console.error);
          //response.send(`Deleted database entry for ${hash} and gs://kitebucket/${fileName} deleted`);
          response.status(200).json(result);
          console.log(
            `${hash}, ${fileName} successfully deleted from bucket and database`
          );
        } catch {
          console.error;
          //response.send("bucket error");
        }
      }
    }
  });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
