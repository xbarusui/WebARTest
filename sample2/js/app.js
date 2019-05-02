var video = document.getElementById('video');
var canvas = document.getElementById('overlay');
var context = canvas.getContext('2d');
var button = document.getElementById('button');
var gallary = document.getElementById('gallary');
//var sadText = document.getElementById('sadText');
var happyText = document.getElementById('happyText');

var stampNose = new Image();                            // ★鼻のスタンプ画像を入れる Image オブジェクト
var stampEars = new Image();                            // ★耳のスタンプ画像を入れる Image オブジェクト
var stampEye = new Image();                            // ★鼻のスタンプ画像を入れる Image オブジェクト
stampNose.src = "./frikora.png";                             // ★鼻のスタンプ画像のファイル名
stampEars.src = "./mask.png";                             // ★耳のスタンプ画像のファイル名
stampEye.src = "./mask.png"

var isTracking = false;
var isHappy = false;
var isSad = false;
var isPortrait = true;
var happyLevel;
var imageData;
var mosaicSize;
var constraints = {
  audio: false,
  video: {
    // スマホのバックカメラを使用
    facingMode: 'environment'
  }
};
var track = new clm.tracker({
  useWebGL: true
});
var emotionClassifier = new emotionClassifier();
var roseImage = new Image;
// 画像のパス
var portraitImagePath = [
  './img/roses_portrait_1.png',
  './img/roses_portrait_2.png',
  './img/roses_portrait_3.png'
];
var landscapeImagePath = [
  './img/roses_landscape_1.png',
  './img/roses_landscape_2.png',
  './img/roses_landscape_3.png'
];

function successFunc (stream) {
  if ('srcObject' in video) {
    video.srcObject = stream;
  } else {
    window.URL = window.URL || window.webkitURL;
    video.src = (window.URL && window.URL.createObjectURL(stream));
  }
  // 動画のメタ情報のロードが完了したら実行
  video.onloadedmetadata = function() {
    adjustProportions();
    startTracking();
  };
  video.onresize = function() {
    adjustProportions();
    if (isTracking) {
      track.stop();
      track.reset();
      startTracking();
    }
  };
};

function startTracking() {
  // トラッキング開始
  track.start(video);
  drawLoop();
  isTracking = true;
}

function adjustProportions() {
  var ratio = video.videoWidth / video.videoHeight;

  if (ratio < 1) {
    // 画面縦長フラグ
    isPortrait = false;
  }
  video.width = Math.round(video.height * ratio);
  canvas.width = video.width;
  canvas.height = video.height;
}

function displaySnapshot() {
  var snapshot = new Image();

  snapshot.src = canvas.toDataURL('image/png');
    snapshot.onload = function(){
      snapshot.width = snapshot.width / 2;
      snapshot.height = snapshot.height / 2;
      gallary.appendChild(snapshot);
    }
}

function drawLoop() {
  // 描画をクリア
  context.clearRect(0, 0, canvas.width, canvas.height);
  // videoをcanvasにトレース
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  // canvasの情報を取得
  imageData = context.getImageData(0, 0, canvas.width, canvas.height);

  var positions = track.getCurrentPosition();   

//  drawStamp(positions, stampEars, 33, 5.0, 0.0, 0);   // ★耳のスタンプを描画    }

  if (track.getCurrentPosition()) {
    // 顔のパーツの現在位置が存在
    determineEmotion();
    if (isSad) {
//      createMosaic(mosaicSize);
    }
    if (isHappy) {
//      makeRosesBloom(happyLevel);
      drawStamp(positions, stampNose, 62, 7.0, 0.0, 0.5);   // ★鼻のスタンプを描画    }
      drawStamp(positions, stampEars, 33, 5.0, 0.0, 0);   // ★耳のスタンプを描画    }

    }
  } else {
    initDisplayEmotion();
  }
  requestAnimationFrame(drawLoop);
}

// ★スタンプを描く drawStamp 関数
// (顔部品の位置データ, 画像, 基準位置, 大きさ, 横シフト, 縦シフト)
function drawStamp(pos, img, bNo, scale, hShift, vShift) {
  var eyes = pos[32][0] - pos[27][0];                   // 幅の基準として両眼の間隔を求める
  var nose = pos[62][1] - pos[33][1];                   // 高さの基準として眉間と鼻先の間隔を求める
  var wScale = eyes / img.width;                        // 両眼の間隔をもとに画像のスケールを決める
  var imgW = img.width * scale * wScale;                // 画像の幅をスケーリング
  var imgH = img.height * scale * wScale;               // 画像の高さをスケーリング
  var imgL = pos[bNo][0] - imgW / 2 + eyes * hShift;    // 画像のLeftを決める
  var imgT = pos[bNo][1] - imgH / 2 + nose * vShift;    // 画像のTopを決める
  context.drawImage(img, imgL, imgT, imgW, imgH);       // 画像を描く
}

function determineEmotion() {
  // 顔の顔のパーツのパラメータ
  var currentParam = track.getCurrentParameters();
  var emotionResult = emotionClassifier.meanPredict(currentParam);

  if (emotionResult) {
    for (var param in emotionResult) {
      var emotion = emotionResult[param].emotion;
      var value = emotionResult[param].value;

      if (value) {
        score = value.toFixed(1) * 100;
        switch(emotion) {
          case 'happy':
            happyText.innerText = score;
            happyText.parentNode.style.width = 100 + score + 'px';
            if (80 < score) {
              happyLevel = 3;
              isHappy = true;
            } else if (70 < score) {
              happyLevel = 2;
              isHappy = true;
            } else if (60 < score) {
              happyLevel = 1;
              isHappy = true;
            } else {
              isHappy = false;
            }
            break;
        }
      } else {
        initDisplayEmotion();
      }
    }
  } else {
    initDisplayEmotion();
  }
}

function initDisplayEmotion() {
//  sadText.innerText = 0;
//  sadText.parentNode.style.width = 100 + 'px';
  happyText.innerText = 0;
  happyText.parentNode.style.width = 100 + 'px';
}

function makeRosesBloom(level) {
  for (i = 0; i < level; i++) {
    if (isPortrait) {
      roseImage.src = portraitImagePath[i];
    } else {
      roseImage.src = landscapeImagePath[i];
    }
    context.drawImage(roseImage, 0, 0, canvas.width, canvas.height);
  }
}

function createMosaic(mosaicSize) {
  for (y = 0; y < canvas.height; y = y + mosaicSize) {
    for (x = 0; x < canvas.width; x = x + mosaicSize) {
      // getImageData で取得したピクセル情報から該当するピクセルのカラー情報を取得
      var cR = imageData.data[(y * canvas.width + x) * 4];
      var cG = imageData.data[(y * canvas.width + x) * 4 + 1];
      var cB = imageData.data[(y * canvas.width + x) * 4 + 2];

      context.fillStyle = 'rgb(' +cR+ ',' +cG+ ',' +cB+ ')';
      context.fillRect(x, y, x + mosaicSize, y + mosaicSize);
    }
  }
}

pModel.shapeModel.nonRegularizedVectors.push(9);
pModel.shapeModel.nonRegularizedVectors.push(11);

delete emotionModel['angry'];
delete emotionModel['disgusted'];
delete emotionModel['fear'];
delete emotionModel['surprised'];

track.init(pModel);
emotionClassifier.init(emotionModel);

// カメラから映像を取得
if (navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia(constraints)
    .then(successFunc)
    .catch((err) => {
      window.alert(err.name + ': ' + err.message);
  });
} else {
  window.alert('非対応ブラウザです');
}

// 保存ボタンを押したら実行
button.addEventListener('click', displaySnapshot);