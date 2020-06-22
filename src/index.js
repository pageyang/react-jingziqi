import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// class Square extends React.Component {
//   // constructor(props) {
//   //   super(props);
//   //   this.state = {
//   //     value: null,
//   //   };
//   // }
//   render() {
//     return (
//       <button
//         className="square"
//         onClick={() => this.props.onClick()}
//       >
//         {this.props.value}
//       </button>
//     );
//   }
// }

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
    const column = 3;
    const raw = 3;
    for (let i = 0; i < column; i++) {
      boardRaw.push(<Square key={i + j * raw}
        value={this.props.squares[i + j * raw]}
        onClick={() => this.props.onClick(i + j * raw)}
        styles={this.props.styles(i + j * raw)}
      />)
    }
    return boardRaw;
  }

  render() {
    const raw = 3;
    var boardAll = [];
    for (let j = 0; j < raw; j++) {
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
      history: [{
        squares: Array(9).fill(null),
        nowCoordinate: null,
      }],
      xIsNext: true,
      stepNumber: 0,
      //历史记录排序方式
      descendingOrder: false,
    };
  }

  handleWinnerStyle(winnerLine, i) {
    const styles = {
      background: "yellow"
    };
    if (winnerLine && winnerLine.indexOf(i) > -1) {
      return styles;
    }
    return null;
  }

  handleClick(i) {
    //创建副本
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const column = 3;
    const raw = 3;
    var nowColumn = (i + 1) % column === 0 ? raw : (i + 1) % column;
    var nowRaw = parseInt(i / raw) + 1;
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
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
  }

  jumpTo(step) {
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

  render() {
    // let { lines } = this.state;
    const { history, stepNumber, descendingOrder, } = this.state;
    // const history = this.state.history;
    const current = history[stepNumber];
    const winnerLine = calculateWinner(current.squares);
    var localCounter = 1;
    //map(value,index)
    const moves = history.map((step, move) => {
      const desc = move ?
        '第 ' + move + ' 步,落点（' + step.nowCoordinate + ')' :
        '游戏初始化';
      //加粗显示当先记录
      return (
        <li key={localCounter++}>
          <button class={move === stepNumber ? 'currentButton' : 'button'} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    //要在Game渲染的时候进行
    if (descendingOrder) {
      moves.reverse();
    }
    let status;
    if (winnerLine) {
      const winner = current.squares[winnerLine[0]];
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
            onClick={(i) => this.handleClick(i)}
            styles={(i) => this.handleWinnerStyle(winnerLine, i)}
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
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
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