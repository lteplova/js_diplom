"use strict";

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

//   cоздает и возвращает новый объект типа Vector, 
//   координаты которого будут суммой соответствующих координат суммируемых векторов.
  plus(vector) { 
    if (!(vector instanceof Vector)) {
      throw new Error("Можно прибавлять к вектору только вектор типа Vector");
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

//   cоздает и возвращает новый объект типа Vector, 
//   координаты которого будут равны соответствующим координатам исходного вектора, умноженным на множитель.
  times(mult) {
    return new Vector(this.x * mult, this.y * mult);
  }
}

class Actor {
  constructor(
    pos = new Vector(0, 0),
    size = new Vector(1, 1),
    speed = new Vector(0, 0)
  ) {
    // не опускайте фигурные скобки
    if (!(pos instanceof Vector))
      throw new Error("Позиция должна быть типа Vector");
    if (!(size instanceof Vector))
      throw new Error("Размер должен быть типа Vector");
    if (!(speed instanceof Vector))
      throw new Error("Скорость должна быть типа Vector");

    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }

   act() {}

  get left() {
    return this.pos.x;
  }

  get top() {
    return this.pos.y;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }

  get type() {
    return "actor";
  }

//   проверяет, пересекается ли текущий объект с переданным объектом
  isIntersect(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error("Не является экземпляром класса Actor");
    }
    if (actor === this) {
      return false;
    }
    // условие в if можно обратить и написать просто return ...
    // чтобы обратить условие, нужно заменить || на &&
    // и операторы на противоположные
    // <= на > и >= на <
    if (
      this.left < actor.right &&
      this.right > actor.left &&
      this.bottom > actor.top &&
      this.top < actor.bottom
    ) {
      return true;
    }
    return false;
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    // используйте для сравнения ===
    this.player = actors.find(item => item.type == "player");
    this.height = grid.length;
    this.width = this.grid.reduce((a, b) => {
      return b.length > a ? b.length : a;
    }, 0);
    this.status = null;
    this.finishDelay = 1;
  }
//   определяет, завершен ли уровень
  isFinished() {
    return this.status != null && this.finishDelay < 0;
  }


//   определяет, расположен ли какой-то другой движущийся объект 
//   в переданной позиции, и если да, вернёт этот объект
  actorAt(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error("Не является объектом Actor");
    }
    return this.actors.find(item => item.isIntersect(actor));
  }
//   определяет, нет ли препятствия в указанном месте, 
//   контролирует выход объекта за границы игрового поля
  obstacleAt(pos, size) {
    if (!(pos instanceof Vector) && !(size instanceof Vector)) {
      throw new Error("Передан не вектор.");
    }

    const top = Math.floor(pos.y);
    const bottom = Math.ceil(pos.y + size.y);
    const left = Math.floor(pos.x);
    const right = Math.ceil(pos.x + size.x);

    if (left < 0 || right > this.width || top < 0) {
      return "wall";
    }
    if (bottom > this.height) {
      return "lava";
    }

    for (let y = top; y < bottom; y++) {
      for (let x = left; x < right; x++) {
        const result = this.grid[y][x];
        if (result) {
          return result;
        }
      }
    }
  }

//   удаляет переданный объект с игрового поля,
//   если такого объекта на игровом поле нет, не делает ничего
  removeActor(actor) {
    // не обязательно каждый раз обходить весь массив
    // можно найти индекс объекта и удалить его
    this.actors.forEach((item, index, arr) => {
      if (item === actor) {
        arr.splice(index, 1);
      }
    });
  }

  //   определяет, остались ли еще объекты переданного типа на игровом поле
  noMoreActors(type) {
    // у массиве есть метод, который проверяет наличие объекта по условию
    // и возвращает true/false
    return !this.actors.find(item => item.type == type);
  }

//   меняет состояние игрового поля при касании игроком каких-либо объектов или препятствий
  playerTouched(typeObstacle, objCoin) {
    if (this.status) {
      return;
    }

    // ===
    if (typeObstacle == "lava" || typeObstacle == "fireball") {
      this.status = "lost";
      return;
    }

    // ===
    if (typeObstacle == "coin") {
      this.removeActor(objCoin);
    }

    if (this.noMoreActors(typeObstacle)) {
      this.status = "won";
      // этот return можно убрать
      return;
    }
  }
}

class LevelParser {
  // лучше добавить значение по-умолчанию,
  // чтобы не нужно было дальше проверять
  constructor(dictionary) {
    this.dictionary = dictionary;
  }

//   возвращает конструктор объекта по его символу, используя словарь 
  actorFromSymbol(symbolOfLevel) {
    // цикл лишний
    for (let i in this.dictionary) {
      if (i === symbolOfLevel) {
        return this.dictionary[i];
      }
    }
  }

//   возвращает строку, соответствующую символу препятствия
  obstacleFromSymbol(symbolOfLevel) {
    switch (symbolOfLevel) {
      case "x":
        return "wall";
        // после return break не нужен
        break;
      case "!":
        return "lava";
        break;
      default:
        // это лишняя срочка, функция и так возвращает undefined,
        // если не указано иное
        return undefined;
    }
  }

//   преобразует массив строк в массив массивов
  createGrid(grid) {
    // в этом методе лучше использвоать map
    let result = [];
    grid.forEach(item => {
      let row = [];
      item.split("").forEach(sym => row.push(this.obstacleFromSymbol(sym)));
      result.push(row);
    });
    return result;
  }
// преобразует массив строк в массив движущихся объектов
  createActors(grid) {
    let result = [];
    grid.forEach((item, y) => {
      item.split("").forEach((sym, x) => {
        const res = this.actorFromSymbol(sym);
        if (typeof res === "function") {
          const actor = new res(new Vector(x, y));
          if (actor instanceof Actor) {
            // проверка в следующей строчке лишняя
            actor && result.push(actor);
          }
        }
      });
    });
    return result;
  }
//   создает и возвращает игровое поле, 
//   заполненное препятствиями и движущимися объектами, полученными на основе символов и словаря
  parse(grid) {
    return new Level(this.createGrid(grid), this.createActors(grid));
  }
}

class Fireball extends Actor {
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    // форматирование
      super(pos, new Vector(1, 1), speed);
      // pos, size, speed должны задаваться
      // через вызов родительского конструктора
      this.pos = pos;
      this.speed = speed;
      this._size = new Vector(1, 1);
  }

  // это свойство уже реализовано в родительском классе
  get size() {
    return this._size;
  }

  // это свойство уже реализовано в родительском классе
  set size(size) {
    this._size = size;
  }

  get type() {
    return "fireball";
  }

//   создает и возвращает вектор Vector следующей позиции шаровой молнии
  getNextPosition(time = 1) {
    // здесь нужно использовать методы класса Vector
    // непонятно зачем в рассчётах участвует размер
    const newPosX = this.pos.x + time * this.speed.x + (this.size.x - 1);
    const newPosY = this.pos.y + time * this.speed.y + (this.size.y - 1);
    return new Vector(newPosX, newPosY);
  }

//   создает и возвращает вектор Vector следующей позиции шаровой молнии
  handleObstacle() {
    this.speed = this.speed.times(-1);
  }

//   обновляет состояние движущегося объекта
  act(time, level) {
    const newPos = this.getNextPosition(time);

    if (level.obstacleAt(newPos, this.size)) {
        this.handleObstacle();
    } else {
        this.pos = newPos;
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos) {
    super(pos);
    // pos, size, speed должны задаваться через вызов родительского конструктора
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
  constructor(pos) {
    super(pos);
    // pos, size, speed должны задаваться через вызов родительского конструктора
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
  constructor(pos) {
    super(pos, new Vector(0, 3));
    this.startPos = pos;
    // pos, size, speed должны задаваться через вызов родительского конструктора
    this.pos = pos;
    this.size = new Vector(1, 1);
    this.speed = new Vector(0, 3);
  }

  handleObstacle() {
    this.pos = this.startPos;
  }

  act(time, level) {
    const newPos = this.getNextPosition(time);

    if (level.obstacleAt(newPos, this.size)) {
        this.handleObstacle();
    }
  }
}

class Coin extends Actor {
  // форматирование
    constructor(position = new Vector(0, 0)) {
      // лучше не менять значения аргументов функции
      const pos = position.plus(new Vector(0.2, 0.1));
      super(pos, new Vector(0.6, 0.6));
      this.springSpeed = 8;
      this.springDist = 0.07;
      this.spring = Math.random() * 2 * Math.PI;
      this.startPos = this.pos;
    }
  
    get type() {
      return 'coin';
    }
  
    // обновляет фазу подпрыгивания
    updateSpring(number = 1) {
      this.spring += this.springSpeed * number;
    }
    // создает и возвращает вектор подпрыгивания
    getSpringVector() {
      return new Vector(0, Math.sin(this.spring) * this.springDist);
    }
  
    // обновляет текущую фазу, создает и возвращает вектор новой позиции монетки
    getNextPosition(number = 1) {
      this.updateSpring(number);
      return this.startPos.plus(this.getSpringVector());
    }
  
    // получает новую позицию объекта и задает её как текущую
    act(time) {
      this.pos = this.getNextPosition(time);
    }
  }
  

class Player extends Actor {
  constructor(pos = new Vector(0.8, 1.5)) {
    super(pos, new Vector(0.8, 1.5));
    // не нужно менять свойства объекта Vector напрямую — используйте его методы
    this.pos.x = pos.x;
    this.pos.y = pos.y - 0.5;
    // pos, size, speed должны задаваться через вызов родительского конструктора
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0);
  }

  get type() {
    return "player";
  }
}
