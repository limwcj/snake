'use strict';

const Controller = require('egg').Controller;

class GameController extends Controller {
  async gameOver() {
    if (!this.ctx.request.body.score || !this.ctx.request.body.score) return this.ctx.body = {code: -1, message: '参数错误！'};
    if (this.ctx.request.body.rankName === 'snake_hell' && this.ctx.request.body.score > 64) return this.ctx.body = {code: -1, message: '本是同根生，相煎何太急！'};
    if (this.ctx.request.body.score > 400) return this.ctx.body = {code: -1, message: '本是同根生，相煎何太急！'};
    let userId = 0;
    if (this.ctx.session && this.ctx.session.userId) userId = this.ctx.session.userId;
    let params = {
      rankName: this.ctx.request.body.rankName || 'snake_normal',
      userId: userId,
      rankNumber: this.ctx.request.body.score,
      rankString: this.ctx.request.body.time,
    };
    try {
      await this.ctx.service.rank.addRank(params);
      this.ctx.body = {code: 0, message: 'success'};
    } catch (e) {
      this.logger.error(e.stack);
      this.ctx.body = {code: -1, message: '添加排行榜失败'};
    }
  }
}

module.exports = GameController;
