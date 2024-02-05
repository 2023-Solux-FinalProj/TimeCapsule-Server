const express = require('express');
const cors = require('cors');
const session = require('express-session');
const mysql = require('mysql');
const http = require('http');
const fs =require('fs');
const path=require('path');
const { v4: uuidv4 } = require('uuid');
const multer  = require('multer');
const util = require('util');
const morgan = require('morgan');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');










const app = express();
app.set('view engine', 'ejs');


require('dotenv').config();
app.use(morgan('dev'));

// CORS 설정
app.use(cors({
	origin: '*',
}));

// CORS 설정,프론트엔드와의 협업을 위한..

// const corsOptions = {
//   origin: 'http://localhost:3000', // 허용할 도메인
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

// app.use(cors(corsOptions));



// .env 파일에서 DB_URL 환경 변수 읽기
const dbUrl = process.env.DB_URL;
const port = process.env.PORT;

app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
	next();
  });

const connection = mysql.createConnection({
    host: dbUrl, // 데이터베이스 호스트
    user: 'admin', // 데이터베이스 사용자 이름
    password: 'capsule2024', // 데이터베이스 비밀번호
    database: 'capsule', // 연결할 데이터베이스 이름
    port: '3306'
});

app.use(express.json()); 

// 쿼리 스트링 라이브러리
const qs = require("qs");
const axios = require("axios");
// Date 관련 라이브러리
const moment = require("moment");
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));



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

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname, 'client/build/index.html'))
});



// /send 응답 
// app.get('/capsule', (req, res) => {
// 	res.send('캡슐이 전송 되었습니다!---정보저장중!');
// });

// 여기까지 git pull 코드







// 충돌이 있는지 미리 확인함
process.on('uncaughtException', function (err) {
	console.log(err);
});

// 인가코드 받아옴
// 토큰 발급
// 토큰 사용해 사용자 정보 받아옴
// 존재하는 사용자 정보면 ....?
// 존재하지 않는 사용자 정보면 회원가입

// 카카오 로그인 콜백 라우트


app.post('/login', async(req, res, next) => {
	// const {session, query} = req;
	// // 인가코드 저장
	// const f_code = query.code;

	// console.info("===session===");
	// //console.log(session);
	// // 인가코드 받아오는 것까지 완료
	// console.log(f_code);

	const code = req.body.code;
	const CLIENT_ID = req.body.client_id;
	const REDIRECT_URI = req.body.redirect_uri;
	const CLIENT_SECRET = req.body.client_secret;
	let tokenResponse;

	try {
		tokenResponse = await axios({
			method: 'POST',
			url: 'https://kauth.kakao.com/oauth/token',
			headers: {
				'content-type': "application/x-www-form-urlencoded"
			},
			data: qs.stringify({
				"grant_type": 'authorization_code',
				"client_id": CLIENT_ID,
				"client_secret": CLIENT_SECRET,
				"redirect_url": REDIRECT_URI,
				"code" : code,
			}),
			//withCredentials:true,
		});
	} catch (err) {
		console.log("[토큰 발급 에러!!]\n");
		console.log(err);
		console.log("\n\n\n");
		return res.json(err);
	}
	// console.log(tokenResponse);

	const tokenData = tokenResponse.data.access_token;
	// // 엑세스 토큰 발급 완료
	// // console.log('토큰 :' + access_token);

	// 토큰으로 사용자 정보 받아오기
	try {

		// 테스트 후 주석처리하기
		//const tokenData = req.body.token;
		//console.log(`${tokenData}`);
		let userResponse;

		// access_token으로 사용자 정보 요청
		userResponse = await axios({
			headers: {
				'content-type': "application/x-www-form-urlencoded"
			},
			method: 'GET',
			url : 'https://kapi.kakao.com/v2/user/me',
			headers: {
				Authorization: `Bearer ${tokenData}`,
			},
		});

		// 유저 정보 받아오기
		const {data} = userResponse;
		//console.log(data);
		
		if (!data.kakao_account.email) throw new error ("KEY_ERROR", 400);

		const username = data.kakao_account.profile.nickname;
		const email = data.kakao_account.email;
		let birth = null;
		if (data.kakao_account.birthday) {
			birth = data.kakao_account.birthyear + '-' + (data.kakao_account.birthday).substring(0, 2) + '-' + (data.kakao_account.birthday).substring(2);
			
		}
		const today = (moment().format("YYYY-MM-DD"));
		
		//console.log(birth);

		// 이미 존재하는 유저인지 검색
		connection.query(`SELECT email FROM User WHERE email=?`, [email], function(error, results, fields) {
			// 반환값이 없으면 아직 가입하지 않은 유저
			// DB에 신규등록 (회원가입)
			if (results.length <= 0) {
				try {
					connection.query(`INSERT INTO User (email, birth, created_at, username) VALUES (?, ?, ?, ?)`
					, [email, birth, today, username]
					)
					console.log("회원가입 완료");
				} catch (err) {
					res.send(err.message);
					return;
				}
			}
		const secretKey = require('./config/secretkey');
		const SECRET_KEY = secretKey;
		// 로그인 성공 후
		// 서버에서 JWT 토큰 발행해서 프론트로 보내주기 
		if (tokenData) {
			const userToken = jwt.sign({
				"type" : 'JWT',
				"email" : email,
				"name" : username,
			},
			SECRET_KEY,
			{

				expiresIn: "60m",
			});

			const responseToken = {
				"userToken" : userToken,
			}
			res.send(responseToken);
		}

		})} catch (err) {
			console.log("[토큰 받아온 이후 에러!!]\n");
			console.log(err);
			console.log("\n\n\n");
	}
	//console.log("끝…");
})

// 토큰 검증 미들웨어
// const checkJWT = (req, res, next) => {
// 	let token = null;
// 	if (req.headers.authorization) {
// 		token = req.headers.authorization.split('Bearer ')[1];
// 	}
// 	//console.log(`${token}`);
// 	const secretKey = require('./config/secretkey');

// 	jwt.verify(token, secretKey, (err, decoded) => {
// 		try {
// 			next();
// 		} catch (err) {
// 			res.send(err.message);
// 			return;
// 		}
// 	})
// }


AWS.config.update({
  region: 'ap-northeast-2',
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const storage = multerS3({
  s3,
  acl: 'public-read',
  bucket: 'capsule24-bucket',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
      // 파일 이름 생성 및 반환
      cb(null, `${Date.now().toString()}_${uuidv4()}_${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fieldSize: 25 * 1024 * 1024 },
});

//깃 테스트 
app.post('/capsule',
  (req, res, next) => {
      let token = null;
      if (req.headers.authorization) {
          token = req.headers.authorization.split('Bearer ')[1];
      }
      const secretKey = require('./config/secretkey');

      jwt.verify(token, secretKey, (err, decoded) => {
          if (err) {
              res.send(err.message);
              return;
          } else {
              console.log("사용자 jwt 토큰 검증 완료");
              next();
          }
      });
  }, 
  upload.array('cards'),
  async (req, res) => {
      const receiver = req.body.receiver;
      const writer = req.body.writer;
      const writtendate = req.body.writtendate;
      const arrivaldate = req.body.arrivaldate;
      const cards = req.files; // 이미지 데이터는 req.files에 있음
      const music = req.body.music;
      const theme = req.body.theme;
      const arrivalDateString = `${arrivaldate.year}-${arrivaldate.month}-${arrivaldate.day}`;
      const send_at = writtendate;
      const arrive_at = arrivalDateString;
      const sendstate = 1;

      try {
          const getWriterIDQuery = 'SELECT memberID FROM User WHERE username = ?';
          const [userResult] =connection.query(getWriterIDQuery, [writer]);

          if (userResult.length === 0) {
              return res.status(400).json({
                  isSuccess: false,
                  code: '4001',
                  message: '유효하지 않은 email입니다.',
                  result: null
              });
          }

          const memberID = userResult[0].memberID;

          const insertCapsuleQuery = 'INSERT INTO Capsule (senderID, send_at, arrive_at, music, theme, sendState) VALUES (?, ?, ?, ?, ?, ?)';
          const [capsuleResult] =connection.query(insertCapsuleQuery, [memberID, send_at, arrive_at, music, theme, sendstate]);
          const capsuleID = capsuleResult.insertId;

          const insertContentsQuery = 'INSERT INTO Contents (capsuleID, imageUrl, text) VALUES ?';
          const cardsData = [];

          for (const card of cards) {
              const imageUrl = await saveImage(card.buffer);
              cardsData.push([capsuleID, imageUrl, card.originalname]);
          }
          connection.query(insertContentsQuery, [cardsData]);

          const insertReceiverQuery = 'INSERT INTO Receiver (capsuleID, toEmail) VALUES (?, ?)';
          connection.query(insertReceiverQuery, [capsuleID, receiver]);

          console.log('모든 정보 DB에 저장 완료!');
          return res.status(200).json({
              isSuccess: true,
              code: '2000',
              message: '캡슐 전송 완료!',
              result: null
          });
      } catch (error) {
          console.error('Error executing MySQL query:', error);
          return res.status(500).json({
              isSuccess: false,
              code: '5000',
              message: '서버 오류',
              result: null
          });
      }
  });

async function saveImage(imageBuffer) {
  try {
      const params = {
          Bucket: 'capsule24-bucket',
          Key: `${uuidv4()}.jpeg`,
          Body: imageBuffer,
          ContentType: 'image/jpeg'
      };

      const data = await s3.upload(params).promise();
      console.log('S3에 이미지 업로드 성공:', data.Location);
      return data.Location;
  } catch (error) {
      console.error('S3에 이미지 업로드 실패 :', error);
      throw error;
  }
}


app.put('/capsule/:id', (req, res) => {
	const capsuleId = req.params.id;
	const { readState } = req.body;
  
	// Capsule 테이블의 readState 값을 업데이트하는 SQL 쿼리를 정의합니다.
	const updateQuery = 'UPDATE Receiver SET readState = ? WHERE capsuleID = ?';
  
	// SQL 쿼리를 실행하여 Capsule 테이블의 realsdState 값을 업데이트합니다.
	connection.query(updateQuery, [readState, capsuleId], (error,result) => {
    if (error) {
    console.error('Error updating readState:', error);
    return res.status(500).json({
      success: false,
      message: 'readState 변경실패 '
    });
    }
    console.log('Read state updated successfully');
    return res.status(200).json({
    success: true,
    message: 'readstate 변경완료!'
    });
	});
  });





// 사용자 정보 및 캡슐 정보 응답 엔드포인트


const query = util.promisify(connection.query).bind(connection);

app.post('/users', 
  // JWT 토큰 검증 미들웨어
  (req, res, next) => {
    let token = null;

    // 헤더에서 토큰을 가져오기
    console.log(req.headers.authorization);
    if (req.headers.authorization) {
      token = req.headers.authorization.split('Bearer ')[1];
    }
    //console.log(`${token}`);
    const secretKey = require('./config/secretkey');

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        console.error('Error verifying JWT token:', err);
        res.send(err.message);
        return;
      } else {
        console.log("사용자 jwt 토큰 검증 완료");

        req.body.email = decoded.email;
        req.body.username = decoded.name;

        next();
      }
    })
  }, 

  // 실제 엔드포인트 로직
  async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;

    try {
      // receiver 테이블을 통해 해당 이메일과 일치하는 캡슐 ID를 가져오는 쿼리
      const getCapsuleIDsQuery = 'SELECT capsuleID FROM Receiver WHERE toEmail = ?';

      const capsuleIDResult = await query(getCapsuleIDsQuery, [email]); // 비동기 쿼리 실행

      const response1 = {
        token: req.headers.authorization,
        email: email.toString(),
        name: username,
        capsules: [], // 빈 배열로 초기화
      };

      if (!capsuleIDResult || capsuleIDResult.length === 0) {
        // 해당하는 캡슐이 없는 경우
        console.log("사용자에게 전송된 캡슐이 없습니다", response1);
        return res.status(200).json({
          result: response1
        });
      } else {
        const capsuleIDs = capsuleIDResult.map(row => row.capsuleID);
        // 해당 사용자의 캡슐 정보를 가져오는 쿼리
        const getCapsulesQuery = `
          SELECT 
            Capsule.capsuleID, 
            Capsule.senderID, 
            Capsule.send_at, 
            Capsule.arrive_at, 
            Capsule.music, 
            Capsule.theme,
            User.username,
            Contents.imageUrl, 
            Contents.text,
            Receiver.readstate
          FROM Capsule
          INNER JOIN Receiver ON Capsule.capsuleID = Receiver.capsuleID
          INNER JOIN User ON Capsule.senderID = User.memberID
          INNER JOIN Contents ON Capsule.capsuleID = Contents.capsuleID
          WHERE Capsule.capsuleID IN (?)
          `;

        const capsuleResult = await query(getCapsulesQuery, [capsuleIDs]); // 비동기 쿼리 실행

        

        const response2 = {
          token: req.headers.authorization, // JWT Token은 어디서 받아오는지에 따라 적절한 처리가 필요합니다.
          email: email.toString(),
          name: username,
          capsules: capsuleResult.map(capsule => ({
            id: capsule.capsuleID,
            writer: capsule.username,
            writtendate: capsule.send_at,
            arrivaldate: capsule.arrive_at,
            cards: [{
              image: capsule.imageUrl,
              text: capsule.text
            }],
            music: capsule.music,
            theme: capsule.theme,
            isChecked: (capsule.readstate === 1 ? true : false) , // boolean
          }))
        };



        // 성공 응답 보내기
        console.log('Success Response:', response2);
        return res.status(200).json({
          result: response2
        });
      }
    } catch (err) {
      console.error('Error executing MySQL queries:', err);
      return res.status(500).json({
        isSuccess: false,
        code: '5000',
        message: '서버 오류',
        result: null
      });
    }
  }
);

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/build/index.html'))
});

//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








