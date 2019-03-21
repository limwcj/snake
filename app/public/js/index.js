var opt = {}, curPos = [], score = 0, apples = 0, run = null, pause = true, direction = '', apple = [], time = null, isEnd = false;

init();
serverInit();
buildRank('snake_normal');
getUser(function (user) {
  if (user.userId) {
    lm.setCookie('userId', user.userId);
    lm.setCookie('userName', user.username);
    $('#login').text(user.username).off().next().removeClass('fa-sign-in').addClass('fa-sign-out').on('click', function () {
      logout();
    });
  }
});

function init(params, cb) {
  var defaults = {
    speed: 100, //默认速度
    xNum: 20,  //格子X轴数量
    yNum: 20,  //格子X轴数量
    cellLength: 30,  //格子边长,
    defaultPos: [[2, 4], [2, 3], [2, 2]], //初始蛇位置
    direction: 'down',   //初始方向
    border: 'yes',   //是否显示边框
    ai: false   //AI
  };
  opt = $.extend({}, defaults, params);
  curPos = opt.defaultPos;
  direction = opt.direction;
  apples = 0;
  score = 0;
  pause = true;
  apple = [];
  isEnd = false;
  $('#time span').text('00:').eq(3).text('0');
  $('#score').text(0);
  $('#menu-beginEnd').text('开始');
  $('#fail').css('visibility', 'hidden');
  if (!opt.ai) $('#menu-ai').removeClass('menu-active');
  if (!(opt.xNum === 8 && opt.yNum === 8)) $('#menu-level-hell').removeClass('menu-active');
  $(document).off('keydown');
  if (run) {
    clearInterval(run);
    clearInterval(time);
  }
  createCells();  //创建单元格
  for (var i = 0; i < curPos.length; i++) {   //初始化蛇
    if (i === 0) {
      getCell(curPos[i]).addClass('head body');
      continue;
    }
    if (i === curPos.length - 1) {
      getCell(curPos[curPos.length - 1]).addClass('tail');
    }
    getCell(curPos[i]).addClass('body');
  }
  randomCell();   //初始化苹果
  var $wrap = $('#wrap');
  $('#right-wrap').css('left', $wrap.offset().left + $wrap.width() + 10 + 'px');
  $('#left-wrap').css('left', $wrap.offset().left - 310 + 'px');
  $(document).on('keydown', function (e) {
    if (e.keyCode === 13) {
      $('#menu-beginEnd').click();
    } else{
      if (!pause && !isEnd) {
        if (e.keyCode === 38 || e.keyCode === 87) {   //up
          $('.up').css({'background': 'red', 'color': '#fff'});
          direction = 'up';
        } else if (e.keyCode === 39 || e.keyCode === 68) {   //right
          $('.right').css({'background': 'red', 'color': '#fff'});
          direction = 'right';
        } else if (e.keyCode === 40 || e.keyCode === 83) {   //down
          $('.down').css({'background': 'red', 'color': '#fff'});
          direction = 'down';
        } else if (e.keyCode === 37 || e.keyCode === 65) {   //left
          $('.left').css({'background': 'red', 'color': '#fff'});
          direction = 'left';
        }
      }
    }
  }).on('keyup', function(e) {
      $('#directions div').css({'background': '#fff', 'color': '#666'});
  });
  if (typeof params === 'function') cb();
}

$(window).resize(function(){
  var $wrap = $('#wrap');
  $('#right-wrap').css('left', $wrap.offset().left + $wrap.width() + 10 + 'px');
  $('#left-wrap').css('left', $wrap.offset().left - 310 + 'px');
});

$('#menu-smart-ai').on('click', function () {
  tip('来来来，键盘给你，你来写!');
});

$('#menu-beginEnd').on('click', function () {
  if (isEnd) {
    let _params = {};
    if (opt.ai) _params.ai = true;
    if ($('#menu-level-hell').hasClass('menu-active')) {
      _params.xNum = 8;
      _params.yNum = 8;
    }
    init(_params, function () {
      $('#menu-beginEnd').click();
    });
  }
  if (pause) {
    pause = false;
    $('#menu-beginEnd').text('暂停');
    run = setInterval(move, opt.speed);
    time = setInterval(timing, 100);
  } else {
    pause = true;
    $('#menu-beginEnd').text('开始');
    clearInterval(run);
    clearInterval(time);
  }
});

$('#menu-restart').on('click', function () {
  let _params = {};
  if (opt.ai) _params.ai = true;
  if ($('#menu-level-hell').hasClass('menu-active')) {
    _params.xNum = 8;
    _params.yNum = 8;
  }
  init(_params);
});

$('#menu-ai').on('click', function () {
  if ($(this).hasClass('menu-active')) {
    opt.ai = false;
    $(this).removeClass('menu-active');
  } else {
    opt.ai = true;
    $(this).addClass('menu-active');
  }
});

$('#menu-level-hell').on('click', function () {
  $('#rank-wrap').empty();
  if ($(this).hasClass('menu-active')) {
    init({ai: opt.ai});
    $(this).removeClass('menu-active');
    buildRank('snake_normal');
  } else {
    init({
      ai: opt.ai,
      xNum: 8,
      yNum: 8
    });
    $(this).addClass('menu-active');
    buildRank('snake_hell');
  }
});

$('#directions div').on('mousedown', function () {
  if (!pause && !isEnd) {
    $(this).css({'background': 'red', 'color': '#fff'});
    if ($(this).hasClass('up')) direction = 'up';
    if ($(this).hasClass('right')) direction = 'right';
    if ($(this).hasClass('down')) direction = 'down';
    if ($(this).hasClass('left')) direction = 'left';
  }
}).on('mouseup', function (e) {
  $(this).css({'background': '#fff', 'color': '#666'});
});

function move() {
  var newCellPos = [];
  if (opt.ai) {
    newCellPos = getNewHeadPosAuto();
  } else {
    newCellPos = getNewHeadPos();
  }
  if (!newCellPos || newCellPos[0] <= 0 || newCellPos[0] > opt.xNum || newCellPos[1] <= 0 || newCellPos[1] > opt.yNum || inArray(newCellPos, curPos)) {
    fail();
  } else {
    getCell(curPos[0]).removeClass('head');
    curPos.unshift(newCellPos);
    getCell(newCellPos).addClass('head body');
    if (inArray(newCellPos, [apple])) {   //吃到苹果
      apples += 1;
      score = apples;
      $('#score').text(score);
      randomCell();
    } else {
      getCell(curPos.pop()).removeClass('body tail');
      getCell(curPos[curPos.length - 1]).addClass('tail');
    }
  }
}

function getNewHeadPos() {
  var headCellX = curPos[0][0],
    headCellY = curPos[0][1],
    secondCellX = curPos[1][0],
    secondCellY = curPos[1][1],
    newCellPos = [],
    lastDirection = '';
  if (headCellX === secondCellX) {
    if (headCellY > secondCellY) {
      lastDirection = 'down';
    } else {
      lastDirection = 'up';
    }
  } else {
    if (headCellX > secondCellX) {
      lastDirection = 'right';
    } else {
      lastDirection = 'left';
    }
  }
  if (direction === 'down') {
    newCellPos = [headCellX, headCellY + 1];
    if (lastDirection === 'up') {
      newCellPos = [headCellX, headCellY - 1];
    }
  } else if (direction === 'up') {
    newCellPos = [headCellX, headCellY - 1];
    if (lastDirection === 'down') {
      newCellPos = [headCellX, headCellY + 1];
    }
  } else if (direction === 'right') {
    newCellPos = [headCellX + 1, headCellY];
    if (lastDirection === 'left') {
      newCellPos = [headCellX - 1, headCellY];
    }
  } else if (direction === 'left') {
    newCellPos = [headCellX - 1, headCellY];
    if (lastDirection === 'right') {
      newCellPos = [headCellX + 1, headCellY];
    }
  }
  return newCellPos;
}

function fail() {
  tip('GAME OVER');
  isEnd = true;
  clearInterval(run);
  clearInterval(time);
  $('#menu-beginEnd').text('开始');
  $('#fail').css('visibility', 'visible');
  gameOver(function() {buildRank($('#menu-level-hell').hasClass('menu-active') ? 'snake_hell' : 'snake_normal')});
}

function createCells() {
  var $wrap = $('#wrap');
  if (opt.border === 'yes') {
    $wrap.empty().css({
      width: opt.xNum * opt.cellLength + 2 * opt.xNum + 'px',
      height: opt.yNum * opt.cellLength + 2 * opt.yNum + 'px'
    });
    for (var i = 0; i < opt.xNum; i++) {
      for (var j = 0; j < opt.yNum; j++) {
        $('<div>').appendTo($wrap).addClass('cell').css({
          width: opt.cellLength + 'px',
          height: opt.cellLength + 'px',
          border: '1px solid #e0e0e0'
        });
      }
    }
  } else {
    $wrap.empty().css({width: opt.xNum * opt.cellLength + 'px', height: opt.yNum * opt.cellLength + 'px'});
    for (var i = 0; i < opt.xNum; i++) {
      for (var j = 0; j < opt.yNum; j++) {
        $('<div>').appendTo($wrap).addClass('cell').css({width: opt.cellLength + 'px', height: opt.cellLength + 'px'});
      }
    }
  }
}

function randomCell() {
  getCell(apple).removeClass('random');
  var $effectiveCells = $(".cell").not('.body'),
    random = Math.floor(Math.random() * $effectiveCells.length),
    index = $('.cell').index($effectiveCells.eq(random).addClass('random')) + 1;
  apple = getPos(index);
}

function getPos(index) {
  index = parseInt(index);
  return [index % opt.xNum === 0 ? opt.xNum : index % opt.xNum, index % opt.xNum === 0 ? index / opt.xNum : parseInt(index / opt.xNum) + 1];
}

function getCell(pos) {
  return $('.cell').eq(getIndex(pos));
}

function getIndex(pos) {
  if (pos[0] > 0 && pos[0] <= opt.xNum && pos[1] > 0 && pos[1] <= opt.yNum) {
    return (pos[1] - 1) * opt.xNum + pos[0] - 1;
  }
  return false;
}

function inArray(value, attr) {
  value = getIndex(value);
  for (var i = 0; i < attr.length; i++) {
    if (value === getIndex(attr[i])) {
      return true;
    }
  }
  return false;
}

function timing() {
  var h = parseInt($('.time-h').text()),
    m = parseInt($('.time-m').text()),
    s = parseInt($('.time-s').text()),
    ms = parseInt($('.time-ms').text());
  if (ms < 9) {
    ms++;
  } else {
    ms = 0;
    if (s < 59) {
      s++;
    } else {
      s = 0;
      if (m < 59) {
        m++;
      } else {
        m = 0;
        h++;
      }
    }
  }
  $('.time-ms').text(ms);
  $('.time-s').text((s < 10 ? '0' + s.toString() : s) + ':');
  $('.time-m').text((m < 10 ? '0' + m.toString() : m) + ':');
  $('.time-h').text((h < 10 ? '0' + h.toString() : h) + ':');
}

function getNewHeadPosAuto() {
  var head = curPos[0],
    findedPath = findingPath(head, apple);
  return findedPath[0];
}

function findingPath(beginPos, endPos) {
  var closeList = [], openList = [], fatherList = [], path = [];
  openList.push(beginPos);
  path.unshift(endPos);
  while (!inArray(endPos, openList) && openList.length != 0) {
    var pos = getMinHPos(openList, endPos),
      surroundPos = getSurroundPos(pos);
    closeList.push(pos);
    openList.remove(pos);
    for (var i = 0; i < surroundPos.length; i++) {
      if (!inArray(surroundPos[i], closeList)) {
        if (!inArray(surroundPos[i], openList)) {
          openList.push(surroundPos[i]);
          fatherList.push([surroundPos[i], pos]);
        }
      }
    }
  }
  if (openList.length === 0) {
    return [];
  }
  var tempFather = endPos;
  while (getIndex(tempFather) != getIndex(beginPos)) {
    tempFather = getFather(tempFather, fatherList);
    path.unshift(tempFather);
  }
  path.shift();
  return path;
}

function getSurroundPos(pos) {
  var surroundPos = [];
  if (getIndex([pos[0], pos[1] - 1]) && !getCell([pos[0], pos[1] - 1]).hasClass('body')) {
    surroundPos.push([pos[0], pos[1] - 1]);
  }
  if (getIndex([pos[0], pos[1] + 1]) && !getCell([pos[0], pos[1] + 1]).hasClass('body')) {
    surroundPos.push([pos[0], pos[1] + 1]);
  }
  if (getIndex([pos[0] - 1, pos[1]]) && !getCell([pos[0] - 1, pos[1]]).hasClass('body')) {
    surroundPos.push([pos[0] - 1, pos[1]]);
  }
  if (getIndex([pos[0] + 1, pos[1]]) && !getCell([pos[0] + 1, pos[1]]).hasClass('body')) {
    surroundPos.push([pos[0] + 1, pos[1]]);
  }
  return surroundPos;
}

function getFather(pos, fatherList) {
  for (var i = 0; i < fatherList.length; i++) {
    if (getIndex(pos) === getIndex(fatherList[i][0])) {
      return fatherList[i][1];
    }
  }
}

function getMinHPos(curOpenPoss, endPos) {
  var minH = 10000,
    tempH = 0,
    index = -1;
  $.each(curOpenPoss, function (i, n) {
    tempH = Math.abs(n[0] - endPos[0]) + Math.abs(n[1] - endPos[1]);
    if (tempH < minH) {
      minH = tempH;
      index++;
    }
  });
  return curOpenPoss[index];
}

Array.prototype.remove = function (pos) {
  for (var i = 0; i < this.length; i++) {
    if (getIndex(this[i]) === getIndex(pos)) {
      this.splice(i, 1);
    }
  }
  return this;
};

function serverInit() {
  var csrfToken = lm.getCookie('csrfToken');
  if (!csrfToken) location.reload();

  function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  }
  $.ajaxSetup({
    beforeSend: function (xhr, settings) {
      if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
        xhr.setRequestHeader('x-csrf-token', csrfToken);
      }
    },
    statusCode: {
      401: function () {
        $('#login').click();
      },
    },
  });

  lm.login.init({
    loginBtn: 'login',
    cookieValidSeconds: 7 * 24 * 3600,
    loginCallback: function () {
      location.reload();
    },
    registerCallback: function () {
      location.reload();
    },
  });

  window.getUser = function (callback) {
    $.ajax({
      url: '/user/getUser',
      type: 'post',
      dataType: 'json',
      // async: false,
      success: function (data) {
        if (data.code === 0) {
          callback(data.result);
        } else {
          tip(data.message);
        }
      }
    });
  };

  window.tip = function (str, bool, callback) {
    if (typeof bool === 'function') callback = bool;
    var $tip = $('#dialog-tip');
    if ($tip.length) return $tip.slideUp(() => {$tip.remove();_buildTip(str, bool)});
    _buildTip(str, bool);
    function _buildTip(str, bool) {
      $(`<div id="dialog-tip" class="${bool ? 'tip-success' : 'tip-error'}"><span>${lm.htmlEncode(str)}</span></div>`)
        .appendTo($('body')).slideDown(function () {
        var $this = $(this);
        setTimeout(() => {$this.slideUp(() => {$this.remove()}, () => {if (callback) callback()})}, 2000)
      })
    }
  };
}

function logout() {
  $.ajax({
    url: '/user/logout',
    type: 'post',
    dataType: 'json',
    success: function (data) {
      if (data.code === 0) {
        location.replace(location.href);
      } else {
        tip(data.message);
      }
    }
  });
}

function gameOver(callback) {
  if (!score) return;
  $.ajax({
    url: '/game/gameOver',
    type: 'post',
    dataType: 'json',
    data: {score: score, time: $('.time-h').text() + $('.time-m').text() + $('.time-s').text() + $('.time-ms').text(), rankName: $('#menu-level-hell').hasClass('menu-active') ? 'snake_hell' : 'snake_normal'},
    success: function (data) {
      if (data.code === 0) {
        callback();
      } else {
        tip(data.message);
      }
    }
  })
}

function getRank(rankName, callback) {
  $.ajax({
    url: '/rank/getRank',
    type: 'post',
    dataType: 'json',
    data: {rankName: rankName},
    success: function (data) {
      if (data.code === 0) {
        callback(data.result);
      } else {
        tip(data.message);
      }
    }
  })
}

function buildRank(rankName) {
  getRank(rankName, function (data) {
    if(data && data.length) {
      $('#rank-wrap').empty();
      data.forEach((i, index) => {
        $(`<div class="rank"><span>${index + 1}</span><span>${lm.htmlEncode(i.username || '匿名用户')}</span><span>${i.rankNumber}</span><span>${i.rankString}</span></div>`).appendTo($('#rank-wrap'));
      })
    }
  })
}
