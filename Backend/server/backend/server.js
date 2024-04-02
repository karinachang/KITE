//CONSTANTS FOR SCRIPTS
const express = require('express');
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');
const functions = require('@google-cloud/functions');

//CONSTANTS FOR STORAGE BUCKET
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
	projectId: 'KITE',
	keyFilename: '/app/backend/bucketUpload/service-account.json',
});
const bucket = storage.bucket('kitebucket');
const bucketName = 'kitebucket';

//Constants for testing upload and download
const fileName = 'akite.jpg'; //Local file
const filePath = '/app/backend/bucketUpload/akite.jpg'; //Local file location
const fileDownloadPath = '/app/backend/akite.jpg';

//CONSTANTS FOR DATABASE
const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const MYSQLDB = String(process.env.MYSQLDB);
const MYSQLCOL = String(process.env.MYSQLCOL);
//Selects database
var SQL = 'SELECT * FROM storage;'

//Testing commands for MYSQL database
const DATATEST = 'TTL'; //Test SQL commands
const hash = '6cf3ca'; //dummy code

const DEBUG = true;

const app = express();
app.use(express.json());

//Connect to MYSQL DATABASE
let connection = mysql.createConnection({
	host: MYSQLHOST,
	user: MYSQLUSER,
	password: MYSQLPASS,
	database: MYSQLDB,
	multipleStatements: true
});

//Creates sql command to insert data into database
function sqlCommand(data) {
	let file_info = JSON.parse(data);
	let command = `INSERT INTO storage ( ${MYSQLCOL} ) VALUES( ${file_info} )`;
	return command;
}

//Generates unique code using last 6-digits of uuidv4
function create_6dCode() {
	let code = uuidv4();
	let last6 = code.slice(-6);
	return last6;
}

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
		'The object ' + fileName + ' coming from bucket ' + `kitebucket` +
		' has been downloaded to ' + `GCPdownload.txt`);
	}
}

//Deletes a GIVEN file from gcp bucket
//ATTENTION: change to take in a filename
async function deleteFile(fName) {
	await bucket.file(fName).delete();
	console.log(`gs://kitebucket/${fileName} deleted`);
}

//Uploads a GIVEN file into gcp bucket
//ATTENTION: change to take in filename
async function uploadFile() {
	const options = {
		destination: `akite.jpg`,
	};

await storage.bucket(bucketName).upload(filePath, options);
console.log(`${filePath} uploaded to ${bucketName}`);
}

//PAGES
//Returns all rows in the database
app.get("/query", function (request, response) {
	SQL = 'SELECT * FROM storage'
	connection.query(SQL, [true], (error, results, fields) => {
		if (error) {
			console.error(error.message);
			response.status(500).send('database error');
		}
		else {
			console.log(results);
			response.send(results);
		}
	});
	return;
})


// DISPLAY THE ROWS THAT NEED TO BE DELETED
app.get("/updateFile", function (request, response) {
	if (DATATEST == "TTL") {
		//SQL = "DELETE FROM storage WHERE timeOfDeath < NOW() OR remainingDownloads = 0;"
		//SQL = "SELECT *  FROM storage WHERE timeOfDeath < NOW() OR remainingDownloads = 1;"
		SQL = (
			`SELECT storageAddress FROM storage ` +
			`WHERE hash = '${hash}';` +

			`DELETE FROM storage ` +
			`WHERE hash = '${hash}' AND remainingDownloads = 1; ` +

			`DELETE FROM storage ` +
			`WHERE timeOfDeath < NOW() OR remainingDownloads <= 1; ` +

			`UPDATE storage ` +
			`SET remainingDownloads = remainingDownloads - 1 ` +
			`WHERE hash = '${hash}' AND timeOfDeath > NOW() AND remainingDownloads > 0;`
		);
	}
	connection.query(SQL, [true], (error, results, fields) => {
		if (error) {
			console.error(error.message);
			response.status(500).send("database error");
		} else {
			stringResults = JSON.stringify(results);
			// This removes the file name from the SQL query
			fName = stringResults.slice(21, stringResults.length - 112 * 3 - 2);
			//This says if the second query affects the database
			deleteCheck = stringResults.slice(stringResults.length - 334, stringResults.length - 301);
			// this checks if the database has been succesfully updated
			endCheck = stringResults.slice(stringResults.length - 148, stringResults.length);


			if (!deleteCheck.includes("1")) {
				if (endCheck.includes("1")) {
					response.send(`${fName} remaining downloads decreased by 1`);
					console.log(`${fName} remaining downloads decreased by 1`);
					downloadFile(fName).catch(console.error);
				} else {
					//Does not exist in database
					response.send("Database entry not found");
					console.log(results);
				}
			} else {
				//Exists in database
				//if stringResults.includes("1");
				try {
					downloadFile(fName).catch(console.error);
					deleteFile(fName).catch(console.error);
					response.send(`Deleted database entry for ${hash} and gs://kitebucket/${fileName} deleted`);
					console.log(`${hash}, ${fileName} successfully deleted from bucket and database`)
				} catch {
					console.error;
					response.send('bucket error');
				}
			}
		}
	});
})

//Adds a line to MYSQL database & uploads file to gcp storage bucket
//ATTENTION: change to take in metadata
app.get("/uploadFile", function (request, response) {
	let code = create_6dCode();
	//store code and metadata into array
	let arr = ["'" + code + "'", "'2024-08-05 00:00:00'", 3, "'testpass1'", "'akite.jpg'"];
	//generate sql command
	let SQL = sqlCommand(JSON.stringify(arr));

	//Upload file
	uploadFile().catch(console.error);

	//Send sql command
	connection.query(SQL, [true], (error, results, fields) => {
		if (error) {
			console.error(error.message);
			response.status(500).send('database error');
		}
		else {
			console.log(results);
			response.send(results);
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
			response.send(results);
		}
	});
	return;
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
