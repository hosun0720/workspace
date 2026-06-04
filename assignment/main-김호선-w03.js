const express = require("express");
const app = express();

app.set("views", __dirname + "/../views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  var context = { title: "국내 여행지 Top 3" };
  res.render("home-w03", context, (err, html) => {
    res.end(html);
  });
});

var detailContent = {
  JEJU: {
    sub: "추천여행코스",
    subOne:
      "동부코스 : 함덕해수욕장-스누피가든,오조포구(일몰)-성산일출봉-세화해수욕장-월정리",
    subTwo:
      "서부코스 : 곽지해수욕장-한림공원-협재/금능해변-신창 풍차해안도로-수월봉",
  },
  BUSAN: {
    sub: "추천여행코스",
    subOne:
      "해안 절경과 힐링: 해운대 해변열차, 스카이라인 루지, 영도 흰여울문화마을, 광안대교 야경",
    subTwo:
      "도시와 문화: 부산영화체험박물관, 용두산공원, 동백섬 누리마루 APEC 하우스",
  },
  YEOSU: {
    sub: "추천여행명소",
    subOne: "오동도: 동백꽃과 숲길 산책, 등대 전망대가 유명한 여수의 대표 명소",
    subTwo:
      "여수 해상케이블카: 바다 위를 지나며 돌산대교와 여수 밤바다의 야경을 조망",
  },
};

app.get("/:id", (req, res) => {
  var id = req.params.id;
  var content = detailContent[id];
  var context = {
    title: id,
    sub: content.sub,
    subOne: content.subOne,
    subTwo: content.subTwo,
  };
  res.render("detail-w03", context, (err, html) => {
    res.end(html);
  });
});

app.get("/favicon.ico", (req, res) => req.writeHead(404));
app.listen(3000, console.log("web server is waiting your request."));
