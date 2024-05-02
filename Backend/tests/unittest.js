const express = require("express");
const { v4: uuidv4 } = require('uuid');
const mysql = require("mysql2");

const app = express();
app.use(express.json());

const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLCOL = String(process.env.MYSQLCOL);

function testfunction(number) {
    return number * 2;
}

function assert(condition, message) {
    if (!condition) {
        console.log("Assertion failed");
    }else{
        console.log(message);
    }
}

function testNumberOne(){
    assert( testfunction(2) == 4, "it worked :D");
}

app.get("/databaseUpload", function (request, response) {
    testNumberOne();
    response.send("filler text");
    return;
})

function testuuid(){
    let code = uuidv4();
    let last6 = code.slice(-6);
    console.log(code);
    console.log(last6);
    return last6;
}

function sqlCommand(data) {
    console.log(data);
    let file_info = JSON.parse(data);
    console.log(file_info);
    let command = `INSERT INTO storage ( + MYSQLCOL + ) VALUES( + file_info + )`;
    return command;
}

app.get("/uploadTest", function (request, response) {
    let code = testuuid();
    let arr = [code, '2024-06-05 00:00:00', 15, null, './hi.gif'];
    console.log(arr);
    command1 = sqlCommand(JSON.stringify(arr));
    response.send("did it work?");
    return;
})


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
