'use strict';

module.exports = app => {
  app.router.redirect('/', '/public/index.html', 302);

  app.router.post('/user/checkUsername', app.controller.user.checkUsername);
  app.router.post('/user/register', app.controller.user.register);
  app.router.post('/user/login', app.controller.user.login);
  app.router.post('/user/logout', app.controller.user.logout);
  app.router.post('/user/getUser', app.controller.user.getUser);

  app.router.post('/game/gameOver', app.controller.game.gameOver);

  app.router.post('/rank/getRank', app.controller.rank.getRank);
};
