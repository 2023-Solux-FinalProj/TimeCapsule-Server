const express = require('express');
const cors = require('cors');
const session = require('express-session');
const mysql = require('mysql');
const http = require('http');

const app = express();

require('dotenv').config();

// CORS 설정
app.use(cors({
    origin: '*',
}));

// .env 파일에서 DB_URL 환경 변수 읽기
const dbUrl = process.env.DB_URL;
const port = process.env.PORT;

const connection = mysql.createConnection({
    host: dbUrl, // 데이터베이스 호스트
    user: 'admin', // 데이터베이스 사용자 이름
    password: 'capsule2024', // 데이터베이스 비밀번호
    database: 'capsule', // 연결할 데이터베이스 이름
    port: '3306'
});
  
// 데이터베이스 연결
connection.connect(err => {
    if (err) {
      return console.error('[Mysql 연결 에러] error: ' + err.message);
    }
    else {
        console.log('MySQL 연결 성공!');

        // 데이터베이스 연결 성공 -> 서버 시작
        app.listen(port, () => {
          console.log('CAPSULE 서버 8080 포트 연결 성공!');
        });
    }
});

app.use(express.json());

app.get('/', function(req, res){
  res.send('타임캡슐, 과거에서 온 편지입니다.');
})