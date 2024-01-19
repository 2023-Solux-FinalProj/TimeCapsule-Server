const express = require('express');
const cors = require('cors');
const session = require('express-session');
const mysql = require('mysql');
const http = require('http');

const app = express();
app.set('view engine', 'ejs');


require('dotenv').config();

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

const connection = mysql.createConnection({
    host: dbUrl, // 데이터베이스 호스트
    user: 'admin', // 데이터베이스 사용자 이름
    password: 'capsule2024', // 데이터베이스 비밀번호
    database: 'capsule', // 연결할 데이터베이스 이름
    port: '3306'
});

app.use(express.json()); 

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



app.get('/', function(req, res){
	res.send('타임캡슐, 과거에서 온 편지입니다.');
})



// /send 응답 
app.get('/capsule', (req, res) => {
	res.send('캡슐이 전송 되었습니다!---정보저장중!');
});

// 여기까지 git pull 코드





// 쿼리 스트링 라이브러리
const qs = require("qs");
const axios = require("axios");
// Date 관련 라이브러리
const moment = require("moment");
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

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


app.post('/oauth/callback/kakao', async(req, res, next) => {
	// const {session, query} = req;
	// // 인가코드 저장
	// const f_code = query.code;

	// console.info("===session===");
	// //console.log(session);
	// // 인가코드 받아오는 것까지 완료
	// console.log(f_code);

	// const code = req.body.code;
	// const CLIENT_ID = req.body.client_id;
	// const REDIRECT_URI = req.body.redirect_uri;
	// const CLIENT_SECRET = req.body.client_secret;
	// let tokenResponse;

	// try {
	// 	tokenResponse = await axios({
	// 		method: 'POST',
	// 		url: 'https://kauth.kakao.com/oauth/token',
	// 		headers: {
	// 			'content-type': `application/x-www-form-urlencoded`
	// 		},
	// 		data: qs.stringify({
	// 			grant_type: 'authorization_code',
	// 			client_id: CLIENT_ID,
	// 			client_secret: CLIENT_SECRET,
	// 			redirect_url: REDIRECT_URI,
	// 			code : code,
	// 		}),
	// 		withCredentials:true,
	// 	});
	// } catch (err) {
	// 	console.log(err);
	// 	return res.json(err);
	// }
	// // console.log(tokenResponse);

	// const tokenData = tokenResponse.data;
	// // 엑세스 토큰 발급 완료
	// // console.log('토큰 :' + access_token);

	// // 토큰으로 사용자 정보 받아오기

	const tokenData = req.body.token;

	try {

		// 테스트 후 주석처리하기
		// const tokenData = req.body.token;
		//console.log(`${tokenData}`);
		let userResponse;

		// access_token으로 사용자 정보 요청
		userResponse = await axios({
			method: 'GET',
			url : 'https://kapi.kakao.com/v2/user/me',
			headers: {
				Authorization: `Bearer ${tokenData}`,
			},
		});
		//console.log("userResponse :" + userResponse);

		// 유저 정보 받아오기
		const {data} = userResponse;
		//console.log(data);
		
		if (!data.kakao_account.email) throw new error ("KEY_ERROR", 400);

		const username = data.kakao_account.name;
		const email = data.kakao_account.email;
		const birth = data.kakao_account.birthyear + '-' + (data.kakao_account.birthday).substring(0, 2) + '-' + (data.kakao_account.birthday).substring(2);
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
					res.send(err);
				}
			}
		// 추후 req로 받아올 것이므로 삭제하기
		CLIENT_SECRET = process.env.CLIENT_SECRET;

		// 로그인 성공 후
		// 서버에서 JWT 토큰 발행해서 프론트로 보내주기 
		if (tokenData) {
			const userToken = jwt.sign({
				email : email,
				name : username,
			},
			CLIENT_SECRET,
			{
				expiresIn: "60m",
			});
			const responseToken = {
				userToken : userToken,
			}
			res.send(responseToken);
		}

		})} catch (err) {
		console.log(err);
	}
	//console.log("끝…");
})



app.post('/capsule', (req, res) => {
	const {
		receiver,
		capsule: {
		writer,
		writtendate,
		arrivaldate,
		cards,
		music,
		theme,
		},
	} = req.body;

	const arrivalDateString = `${arrivaldate.year}-${arrivaldate.month}-${arrivaldate.day}`;
	const send_at = writtendate;
	const arrive_at = new Date(arrivalDateString);

	// 1. writer의 memberID 가져오기
	const getWriterIDQuery = 'SELECT memberID FROM User WHERE username = ?';
	connection.query(getWriterIDQuery, [writer], (err, userResult) => {
		if (err) {
		console.error('Error executing MySQL query (User):', err);
		return res.status(500).json({
			isSuccess: false,
			code: '5000',
			message: 'memberID를 User테이블에서 불러오는데 실패하였습니다. ',
			result: null
		});
		}

		if (userResult.length === 0) {
		return res.status(400).json({
			isSuccess: false,
			code: '4001',
			message: '유효하지않은 username입니다.',
			result: null
		});
		}

		const memberID = userResult[0].memberID;

		// 2. Capsule 테이블에 저장
		const insertCapsuleQuery = 'INSERT INTO Capsule (senderID, send_at, arrive_at, music, theme) VALUES (?, ?, ?, ?, ?)';
		connection.query(insertCapsuleQuery, [memberID, send_at, arrive_at, music, theme], (err, capsuleResult) => {
		if (err) {
			console.error('Error executing MySQL query (Capsule):', err);
			return res.status(500).json({
			isSuccess: false,
			code: '5001',
			message: 'capsule정보 db에 저장실패. ',
			result: null
			});
		}

		const capsuleID = capsuleResult.insertId;

		// 3. Contents 테이블에 저장
		const insertContentsQuery = 'INSERT INTO Contents (capsuleID, imageUrl, text) VALUES ?';
		const cardsData = cards.map((card) => [capsuleID, card.image, card.text]);

		connection.query(insertContentsQuery, [cardsData], (err,res) => {
			if (err) {
			console.error('Error executing MySQL query (Contents):', err);
			return res.status(500).json({
				isSuccess: false,
				code: '5002',
				message: 'Failed to save contents to the database',
				result: null
			});
			}

			// 4. Receiver 테이블에 저장
			const insertReceiverQuery = 'INSERT INTO Receiver (capsuleID, toEmail) VALUES (?, ?)';
			connection.query(insertReceiverQuery, [capsuleID, receiver], (err, res) => {
			if (err) {
				console.error('Error executing MySQL query (Receiver):', err);
				return res.status(500).json({
				isSuccess: false,
				code: '5003',
				message: 'Failed to save receiver to the database',
				result: null
				});
			}

			});
		});
		});
	});
	console.log('모든 정보 DB에 저장 완료!');
	// 성공 응답 보내기
	return res.status(200).json({
		isSuccess: true,
		code: '2000',
		message: 'Capsule, contents, and receiver saved to the database successfully',
		result: null});
});



