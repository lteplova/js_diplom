'use strict'

class Vector {
  constructor (x = 0, y = 0) {
    this.x = x
    this.y = y
  }
  plus (vector) {
    if (!(vector instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector')
    }
    return new Vector(this.x + vector.x, this.y + vector.y)
  }

  times(mult) {
    return new Vector(this.x * mult, this.y * mult);
  }
}

// const start = new Vector(30, 50);
// const moveTo = new Vector(5, 10);
// const finish = start.plus(moveTo.times(2));

// console.log(`Исходное расположение: ${start.x}:${start.y}`);
// console.log(`Текущее расположение: ${finish.x}:${finish.y}`);

class Actor {
  constructor (
    pos = new Vector(0, 0),
    size = new Vector(1, 1),
    speed = new Vector(0, 0)
  ) {

    if (!(pos instanceof Vector)) throw new Error('Позиция должна быть типа Vector');
    if (!(size instanceof Vector)) throw new Error('Размер должен быть типа Vector');
    if (!(speed instanceof Vector)) throw new Error('Скорость должна быть типа Vector');

    this.pos = pos
    this.size = size
    this.speed = speed
  }

  act () {}

  get left () {
    return this.pos.x
  }

  get top () {
    return this.pos.y
  }

  get right () {
    return this.pos.x + this.size.x
  }

  get bottom () {
    return this.pos.y + this.size.y
  }

  get type () {
    return 'actor'
  }

  isIntersect (actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Не является экземпляром класса Actor')
    }
    if (actor === this) {
      return false
    }
    if (
        this.left < actor.right &&
        this.right > actor.left &&
        this.bottom > actor.top &&
        this.top < actor.bottom
    ) {
      return true
    }
    return false
  }
}

// const items = new Map();
// const player = new Actor();
// items.set('Игрок', player);
// items.set('Первая монета', new Actor(new Vector(10, 10)));
// items.set('Вторая монета', new Actor(new Vector(15, 5)));

// function position(item) {
//   return ['left', 'top', 'right', 'bottom']
//     .map(side => `${side}: ${item[side]}`)
//     .join(', ');
// }

// function movePlayer(x, y) {
//   player.pos = player.pos.plus(new Vector(x, y));
// }

// function status(item, title) {
//   console.log(`${title}: ${position(item)}`);
//   if (player.isIntersect(item)) {
//     console.log(`Игрок подобрал ${title}`);
//   }
// }

// items.forEach(status);
// movePlayer(10, 10);
// items.forEach(status);
// movePlayer(5, -5);
// items.forEach(status);

class Level {
  constructor (grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = actors.find(item => item.type == 'player');
    this.height = grid.length;
    this.width = this.grid.reduce((a, b) => {
        return b.length > a ? b.length : a;
    }, 0);
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished () {
    return this.status != null && this.finishDelay < 0
  }

  actorAt (actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Не является объектом Actor')
    }
    return this.actors.find(item => item.isIntersect(actor))
  }

  obstacleAt (pos, size) {
    let obstacle
    if (pos instanceof Vector && size instanceof Vector) {
      this.grid.forEach((row, index) => {
        obstacle = row.find((col, index) => {
          return col != undefined && (col[pos.x] || col[pos.x + size.x])
            ? this.grid[pos.x]
            : undefined
        })
      })

      if (pos.y < 0 || this.height <= pos.y + size.y) {
        obstacle = 'lava'
      }
      if (pos.x < 0 || this.width <= pos.x + size.x) {
        obstacle = 'wall'
      }
      if (pos.y < 0 || this.height - (pos.y + size.y) <= 0) {
        obstacle = 'wall'
      }
      if (pos.x < 0 || this.width - (pos.x + size.x) <= 0) {
        obstacle = 'wall'
      }
      return obstacle
    } else {
      throw new Error('Не является объектом Vector')
    }
  }

  removeActor (actor) {
    this.actors.forEach((item, index, arr) => {
      if (item === actor) {
        arr.splice(index, 1)
      }
    })
  }

  noMoreActors (type) {
    return !this.actors.find(item => item.type == type)
  }

  playerTouched (typeObstacle, objCoin) {
    if (this.status) {
      return
    }

    if (typeObstacle == 'lava' || typeObstacle == 'fireball') {
      this.status = 'lost'
      return
    }

    if (typeObstacle == 'coin') {
      this.removeActor(objCoin)
    }
    
    if (this.noMoreActors(typeObstacle)) {
      this.status = 'won'
      return
    }
  }
}

// const grid = [[undefined, undefined], ['wall', 'wall']];

// function MyCoin(title) {
//   this.type = 'coin';
//   this.title = title;
// }
// MyCoin.prototype = Object.create(Actor);
// MyCoin.constructor = MyCoin;

// const goldCoin = new MyCoin('Золото');
// const bronzeCoin = new MyCoin('Бронза');
// const player = new Actor();
// const fireball = new Actor();

// const level = new Level(grid, [goldCoin, bronzeCoin, player, fireball]);

// level.playerTouched('coin', goldCoin);
// level.playerTouched('coin', bronzeCoin);

// if (level.noMoreActors('coin')) {
//   console.log('Все монеты собраны');
//   console.log(`Статус игры: ${level.status}`);
// }

// const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
// if (obstacle) {
//   console.log(`На пути препятствие: ${obstacle}`);
// }

// const otherActor = level.actorAt(player);
// console.log(otherActor, fireball);
// if (otherActor === fireball) {
//   console.log('Пользователь столкнулся с шаровой молнией');
// }

class LevelParser {
  constructor (dictionary) {
    this.dictionary = dictionary
  }

  actorFromSymbol (symbolOfLevel) {
    for (let i in this.dictionary) {
      if (i === symbolOfLevel) {
        return this.dictionary[i]
      }
    }
  }

  obstacleFromSymbol (symbolOfLevel) {
    switch (symbolOfLevel) {
      case 'x':
        return 'wall'
        break
      case '!':
        return 'lava'
        break
      default:
        return undefined
    }
  }

  createGrid (grid) {
    let result = []
    grid.forEach(item => {
      let row = []
      item.split('').forEach(sym => row.push(this.obstacleFromSymbol(sym)))
      result.push(row)
    })
    return result
  }

  createActors (grid) {
    let result = []
    grid.forEach((item, y) => {
      item.split('').forEach((sym, x) => {
        const res = this.actorFromSymbol(sym)
        if (typeof res === 'function') {
          const actor = new res(new Vector(x, y))
          if (actor instanceof Actor) {
            actor && result.push(actor)
          }
        }
      })
    })
    return result
  }

  parse (grid) {
    return new Level(this.createGrid(grid), this.createActors(grid))
  }
}

// const plan = [' @ ', 'x!x']

// const actorsDict = Object.create(null)
// actorsDict['@'] = Actor

// const parser = new LevelParser(actorsDict)
// const level = parser.parse(plan)

// level.grid.forEach((line, y) => {
//   line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`))
// })

// level.actors.forEach(actor =>
//   console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`)
// )


class Fireball extends Actor {
    constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
        super(pos, speed);
        this.pos = pos;
        this.speed = speed;
        this._size = new Vector(1, 1);
    }

    get size() {
        return this._size;
    }

    set size(size) {
        this._size = size; 
    }

    get type() {
        return 'fireball';
    }

    getNextPosition(time = 1) {
        const newPosX = this.pos.x + time * this.speed.x + (this.size.x - 1);
        const newPosY = this.pos.y + time * this.speed.y + (this.size.y - 1);
        return new Vector(newPosX, newPosY); 
    }

    handleObstacle() {
        this.speed.x *= -1;
        this.speed.y *= -1;
    }

    act(time, level) {
        const newPos = this.getNextPosition(time);
        if (this.isIntersect(new Actor(newPos, this.size, this.speed)) === false) {
            this.pos = newPos;
        }
    }
}


// const time = 5;
// const speed = new Vector(1, 0);
// const position = new Vector(5, 5);

// const ball = new Fireball(position, speed);

// const nextPosition = ball.getNextPosition(time);
// console.log(`Новая позиция: ${nextPosition.x}: ${nextPosition.y}`);

// ball.handleObstacle();
// console.log(`Текущая скорость: ${ball.speed.x}: ${ball.speed.y}`);

// const grid = [[undefined, undefined], ['wall', 'wall']];
// const level = new Level(grid, [ball]);
// ball.act(time,level);

class HorizontalFireball extends Fireball {
    constructor(pos){
        super(pos);
        this.pos = pos;
        this.size = new Vector(1, 1);
        this.speed = new Vector(2, 0);
    }

    act(time, level) {
        this.handleObstacle();
        super.act(time, level);
    }
}

class VerticalFireball extends Fireball {
    constructor(pos){
        super(pos);
        this.pos = pos;
        this.size = new Vector(1, 1);
        this.speed = new Vector(0, 2);
    }

    act(time, level) {
        this.handleObstacle();
        super.act(time, level);
    }
}

class FireRain extends Fireball {
    constructor(pos){
        super(pos);
        this.startPos = pos;
        this.pos = pos;
        this.size = new Vector(1, 1);
        this.speed = new Vector(0, 3);
    }

    act(time, level) {
        const newPos = this.getNextPosition(time);
        if (this.isIntersect(new Actor(newPos, this.size, this.speed)) === false) {
            this.pos = newPos;
        } else {
            this.pos = this.startPos;
        }
    }
}

class Coin extends Actor {
    constructor(pos) {
        super(pos);
        this.size = new Vector(0.6, 0.6);
        this.pos = new Vector(pos.x - 0.2, pos.y - 0.1);
        this._spring = null;
    }

    get type() {
        return 'coin';
    }

    get springSpeed() {
        return 8;
    }

    get springDist() {
        return 0.07;
    }

    get spring() {
        return this._spring || Math.random() * (2 * Math.PI);
    }

    set spring(phase) {
        this._spring = phase;
    } 

    updateSpring(time = 1) {
        this.spring += this.springSpeed * time; 
    }

    getSpringVector() {
        return new Vector(0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition(time = 1) {
        const newPos = this.getSpringVector();
        this.pos.x += newPos.x;
        this.pos.y += newPos.y;
        return new Vector(this.pos.x, this.pos.y);
    }

    act(time) {
        this.pos = this.getNextPosition(time);
    }
}

class Player extends Actor {
    constructor(pos){
        super(pos);
        this.pos.x = pos.x;
        this.pos.y = pos.y - 0.5;
        this.size = new Vector(0.8, 1.5);
        this.speed = new Vector(0, 0);
    }

    get type() {
        return 'player';
    }
}