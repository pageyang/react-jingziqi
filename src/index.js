import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './config';


function Square(props) {
  //想写的组件只包含一个 render 方法，并且不包含 state，那么使用函数组件就会更简单
  return (
    <button className="square" onClick={props.onClick} style={props.styles}>
      {props.value}
    </button>
  )
}


class Board extends React.Component {
  renderSquare(j) {
    var boardRaw = [];
    const column = global.constants.column;
    for (let i = 0; i < column; i++) {
      boardRaw.push(<Square key={i + j * column}
        value={this.props.squares[j][i]}
        onClick={() => this.props.onClick(i, j)}
        styles={this.props.styles(i, j)}
      />)
    }
    return boardRaw;
  }

  //渲染一个棋盘
  render() {
    var boardAll = [];
    for (let j = 0; j < global.constants.raw; j++) {
      boardAll.push(
        <div className="board-row" key={j}>
          {this.renderSquare(j)}
        </div>);
    }

    return (
      <div>
        {boardAll}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      xIsNext: true,
      stepNumber: 0,
      //历史记录排序方式
      descendingOrder: false,
      history: [{
        squares: Array(global.constants.raw)
          .fill()
          .map(() => Array(global.constants.column).fill(null)),
        nowCoordinate: null,
      }],
    };
  }

  render() {
    const { history, stepNumber, descendingOrder, } = this.state;
    const current = history[stepNumber];
    var localCounter = 1;
    const winnerLine = calcWinnerGobang(current.squares);//[[1,1],[2,2],[3,3]]
    //map(value,index)
    const moves = history.map((step, move) => {
      const desc = move ?
        '第 ' + move + ' 步,落点（' + step.nowCoordinate + ')' :
        '游戏初始化';
      //加粗显示当先记录
      return (
        <li key={localCounter++}>
          <button className={move === stepNumber ? 'currentButton' : 'button'} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    //要在Game渲染的时候进行
    if (descendingOrder) {
      moves.reverse();
    }
    let status;
    if (winnerLine) {
      const winner = current.squares[winnerLine[0][1]][winnerLine[0][0]];
      status = '赢家:' + winner;
      //每当有人获胜时，高亮显示连成一线的 3 颗棋子。
    } else if (this.state.stepNumber === 9) {
      status = '平局';
    } else {
      status = '轮到谁走了: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i, j) => this.handleClick(i, j)}
            styles={(i, j) => this.handleWinnerStyle(winnerLine, i, j)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>

          <button
            className='button'
            onClick={() => this.reverseHistory()}
          >
            {descendingOrder ? '降序排列' : '升序排列'}
          </button>
          {/* <button onClick={() => history.reverse()}>反转列表</button> */}
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }

  // alert(global.constants.column * global.constants.raw);
  handleWinnerStyle(winnerLine, i, j) {
    const styles = {
      background: "yellow"
    };
    if (!winnerLine) {
      return null;
    }
    for (let k = 0; k < winnerLine.length; k++) {
      console.log("啊啊啊啊啊 point" + winnerLine[k]);
      if (winnerLine[k][0] === i && winnerLine[k][1] === j) {
        return styles;
      }
    }


    // if (winnerLine && winnerLine.indexOf([i, j]) > -1) {
    //   return styles;
    // }
    return null;
  }

  handleClick(i, j) {
    //创建副本
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    console.log(history);
    const current = history[history.length - 1];
    // const squares = current.squares.slice();

    let squares = [];
    for (let i = 0; i < current.squares.length; i++) {
      let [...arr1] = current.squares[i];
      squares.push(arr1);
    }

    var nowColumn = i;
    var nowRaw = j;
    if (calcWinnerGobang(squares) || squares[j][i]) {
      return;
    }
    squares[j][i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        //当前坐标
        nowCoordinate: [nowColumn, nowRaw],
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      //历史记录排序方式
      descendingOrder: this.state.descendingOrder,
    });
    console.log("啊啊啊啊啊" + this.state.history);
  }

  jumpTo(step) {
    console.log("啊啊啊啊啊step" + step);
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  /**
   * @function 修改用于判断历史记录正序/逆序显示的参数descendingOrder
   * */
  reverseHistory = () => {
    const { descendingOrder } = this.state;
    this.setState({
      descendingOrder: !descendingOrder
    })
  }
}

// function calculateWinner(squares) {
//   const lines = [
//     [0, 1, 2],
//     [3, 4, 5],
//     [6, 7, 8],
//     [0, 3, 6],
//     [1, 4, 7],
//     [2, 5, 8],
//     [0, 4, 8],
//     [2, 4, 6],
//   ];
//   for (let i = 0; i < lines.length; i++) {
//     const [a, b, c] = lines[i];
//     if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
//       return lines[i];
//     }
//   }
//   return null;
// }

function calcWinnerGobang(squares) {
  for (let i = 0; i < global.constants.column; i++) {
    for (let j = 0; j < global.constants.raw; j++) {
      if (squares[j][i]) {
        const result = calcWinnerLine(squares[j][i], i, j, squares)
        if (result) {
          return result;
        }
      }
    }
  }
  return null;
}

function calcWinnerLine(calcSquare, calcColumn, calcRaw, squares) {
  console.log("啊啊啊啊啊calcSquare" + calcSquare);
  for (let i = calcColumn; i < global.constants.column; i++) {
    for (let j = calcRaw; j < global.constants.raw; j++) {
      const resultShu = calcShu(calcSquare, calcColumn, calcRaw, squares)
      if (resultShu) {
        return resultShu;
      }
      const resultXie = calcXie(calcSquare, calcColumn, calcRaw, squares)
      if (resultXie) {
        return resultXie;
      }
      const resultHeng = calcHeng(calcSquare, calcColumn, calcRaw, squares)
      if (resultHeng) {
        return resultHeng;
      }
    }
  }
  return null;
}

function calcShu(calcSquare, calcColumn, calcRaw, squares) {
  const linkLine = [];
  for (let i = calcRaw; i < global.constants.raw; i++) {
    if (squares[i][calcColumn] === calcSquare) {
      linkLine.push([calcColumn, i])
    } else {
      return null;
    }
    if (linkLine.length === global.constants.winnerNum) {
      return linkLine;
    }
  }
  return null;
}
function calcXie(calcSquare, calcColumn, calcRaw, squares) {
  var linkLine = [];
  //往右下找
  for (let i = calcColumn; i < global.constants.column; i++) {
    for (let j = calcRaw; j < global.constants.raw; j++)
      if (squares[j][i] === calcSquare) {
        linkLine.push([i, j])
        i++;
      }
    if (linkLine.length === global.constants.winnerNum) {
      return linkLine;
    }
  }
  linkLine = [];
  //往右上找
  for (let i = calcColumn; i < global.constants.column; i++) {
    for (let j = calcRaw; j >= 0; j--)
      if (squares[j][i] === calcSquare) {
        linkLine.push([i, j])
        i++;
      } else {
        return null;
      }
    if (linkLine.length === global.constants.winnerNum) {
      return linkLine;
    }
  }

  return null;
}
function calcHeng(calcSquare, calcColumn, calcRaw, squares) {
  const linkLine = [];
  for (let i = calcColumn; i < global.constants.column; i++) {
    if (squares[calcRaw][i] === calcSquare) {
      linkLine.push([i, calcRaw])
    } else {
      return null;
    }
    if (linkLine.length === global.constants.winnerNum) {
      return linkLine;
    }
  }
  return null;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

// 在游戏历史记录列表显示每一步棋的坐标，格式为 (列号, 行号)。-ok
// 在历史记录列表中加粗显示当前选择的项目。-ok
// 使用两个循环来渲染出棋盘的格子，而不是在代码里写死（hardcode）。-ok
// 添加一个可以升序或降序显示历史记录的按钮。-ok
// 每当有人获胜时，高亮显示连成一线的 3 颗棋子。-ok
// 当无人获胜时，显示一个平局的消息。-ok