//CONSTANTS FOR SCRIPTS
const express = require("express");
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid");
const functions = require("@google-cloud/functions");

//CONSTANTS FOR STORAGE BUCKET
const { Storage } = require("@google-cloud/storage");
const storage = new Storage({
  projectId: "KITE",
  keyFilename: "./Backend/bucketUpload/service-account.json",
});
const bucket = storage.bucket("kitebucket");
const bucketName = "kitebucket";

//Constants for testing upload and download
const fileName = "akite.jpg"; //Local file
const filePath = "./Backend/bucketUpload/akite.jpg"; //Local file location
const fileDownloadPath = "./Backend/akite.jpg";
const JSZip = require("jszip");
const fs = require("fs");

//CONSTANTS FOR DATABASE
const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const MYSQLDB = String(process.env.MYSQLDB);
const MYSQLCOL = String(process.env.MYSQLCOL);
//Selects database
var SQL = "SELECT * FROM storage;";

//Testing commands for MYSQL database
const DATATEST = "TTL"; //Test SQL commands
const hash = "c79604"; //dummy code

const DEBUG = true;

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

//Creates sql command to insert data into database
function sqlCommand(data) {
    let file_info = JSON.parse(data);
    let NULL = null;
    let command = `INSERT INTO storage (${MYSQLCOL} ) VALUES(
		'${file_info.hash}',
		'${file_info.timeOfDeath}',
		${file_info.remainingDownloads},
		'${file_info.password}',
		'${file_info.hash}.zip',
		${file_info.numberOfFiles},
		${file_info.TotalByteSize} )`;
    if (file_info.password == null) {
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
    return command;
}

//Generates unique code using last 6-digits of uuidv4
function create_6dCode() {
  let code = uuidv4();
  let last6 = code.slice(-6);
  return last6;
}

const method = 'POST';
const origin = 'http://104.154.130.161';
async function configureBucketCors() {
  await storage.bucket(bucketName).setCorsConfiguration([
    {
      method: ['POST'],
      origin: ['http://104.154.130.161']
    },
  ]);

  console.log(`Bucket ${bucketName} was updated with a CORS config
      to allow ${method} requests from ${origin} `);
}

app.get("/cors", function (request, response) {
  configureBucketCors().catch(console.error);
});

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

//Deletes a GIVEN file from gcp bucket
async function deleteFile(fName) {
  await bucket.file(fName).delete();
  console.log(`gs://kitebucket/${fName} deleted`);
}

//Uploads a GIVEN file into gcp bucket
async function uploadFile(fName) {
  const options = {
    destination: fName,
  };

  await storage.bucket(bucketName).upload(filePath, options);
  console.log(`${filePath} uploaded to ${bucketName}`);
}

async function generateV4UploadSignedUrl(fName) {
    // These options will allow temporary uploading of the file with outgoing
    // Content-Type: application/octet-stream header.
    let options = {
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: 'application/octet-stream',
    };

    // Get a v4 signed URL for uploading file
    let [url] = await storage
        .bucket(bucketName)
        .file(fName)
        .getSignedUrl(options);

    console.log('Generated PUT signed URL:');
    console.log(url);
    return url;
}

//PAGES
//Returns all rows in the database
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

// DISPLAY THE ROWS THAT NEED TO BE DELETED
app.post("/downloadFile", function (request, response) {
  if (DATATEST == "TTL") {
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
  }
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
      // this is the link to download
      //let result = `https://storage.googleapis.com/kitebucket/${fName}`;
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
          response.status(200).json(result);
          deleteFile(fName).catch(console.error);
          //response.send(`Deleted database entry for ${hash} and gs://kitebucket/${fileName} deleted`);
          console.log(
            `${hash}, ${fileName} successfully deleted from bucket and database`
          );
        } catch {
          console.error;
          response.send("bucket error");
        }
      }
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

//Adds a line to MYSQL database & uploads file to gcp storage bucket
app.post("/uploadFile", async function (request, response) {
  let code = create_6dCode();
  //store metadata
  const metadata = {
    hash: code,
    timeOfDeath: "2024-09-17 00:00:00",
    remainingDownloads: 2,
    password: "testpass2",
    numberofFiles: 4,
    TotalByteSize: 15,
    files: "akite.jpg",
  };
  //Add code to JSON file
  request.body["hash"] = code;

  let url = await generateV4UploadSignedUrl(code + ".zip").catch(console.error);
  console.log("SIGNED URL:------------------");
    console.log(url);
  let payload = code + url;
  console.log(payload);
  //generate sql command
  let SQL = sqlCommand(JSON.stringify(request.body));

	//Send sql command
	connection.query(SQL, [true], (error, results, fields) => {
		if (error) {
			console.error(error.message);
			response.status(500).send('database error');
		}
		else {
			console.log(results);
			response.status(200).send(payload);
		}
	});
	return;
});

//Displays information given 6digit code
app.get(`/${hash}`, function (request, response) {
    if (DATATEST == 'TTL') {
        SQL = `SELECT * FROM storage WHERE hash = '${hash}';`
    }
    //send sql command
    connection.query(SQL, [true], (error, results, fields) => {
        if (error) {
            console.error(error.message);
            response.status(500).send('database error');
        }
        else {
            console.log(results);
            response.status(200).send(results);
        }
    });
    return;
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
