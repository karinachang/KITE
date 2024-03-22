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
const hash = '66bc1e'; //dummy code

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
		destination: 'GCPdownload.txt',
	};
	//download object from GCP storage bucket
	await bucket.file(fileName).download(options);

	if (DEBUG == True) {
		console.log(
			'The object ' + fileName + ' coming from bucket ' + `kitebucket` +
			' has been downloaded to ' + `GCPdownload.txt`
		);
	}
}

//Deletes a GIVEN file from gcp bucket
//ATTENTION: change to take in a filename
async function deleteFile() {
	await bucket.file(fileName).delete();

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

//Deletes rows in database and updates remainingDownloads
app.get("/update", function (request, response) {
	if (DATATEST == 'TTL') {
		SQL = (
			`DELETE FROM storage ` +
			`WHERE timeOfDeath < NOW() OR remainingDownloads = 1; ` +

			`UPDATE storage ` +
			`SET remainingDownloads = remainingDownloads - 1 ` +
			`WHERE hash = '${hash}' AND timeOfDeath > NOW() AND remainingDownloads > 0;`
		);
		console.log(SQL)
	}
	//send command to database
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

//Deletes a file from gcp storage bucket
app.get("/deleteFile", async (request, response) => {
	try {
		deleteFile().catch(console.error);
		response.send(`gs://kitebucket/${fileName} deleted`);
	} catch {
		console.error;
		response.send('delete error');
	}
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
			stringResults = JSON.stringify(results);
			//response.send(JSON.stringify(results));
			if (stringResults == "[]") {
				//Does not exist in database
				response.send("Database entry not found");
			} else {
				//Exists in database
				//if stringResults.includes("1");
				response.send(stringResults);

				//if none
				//{"fieldCount":0,"affectedRows":0,"insertId":0,"info":"","serverStatus":34,"warningStatus":0}
				//if some
				//{"fieldCount":0,"affectedRows":1,"insertId":0,"info":"","serverStatus":34,"warningStatus":0}
			}
		}
	});
})

//Adds a line to MYSQL database & uploads file to gcp storage bucket
//ATTENTION: change to take in metadata
app.get("/uploadFile", function (request, response) {
	let code = create_6dCode();
	//store code and metadata into array
	let arr = ["'" + code + "'", "'2024-08-05 00:00:00'", 3, "'testpass1'", "'./getrid.gif'"];
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

//ATTENTION: incomplete
app.get("/bucket", async (request, response) => {
	try {
		const options = {
			destination: `GCPdownload.txt`,
		};
		//download object from gcp storage bucket
		await bucket.file(fileName).download(options);

		if (DEBUG == True) {
			console.log(`The object ${fileName} coming from bucket ${bucketName} has 
			been downloaded to GCPdownload.txt`);
		}

		response.send('file download success!');
	}
	catch {
		console.error;
		response.send('GCP error');
	};
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

