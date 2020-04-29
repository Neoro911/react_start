import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={'square' + (props.active ? ' active' : '')} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  renderSquare(i) {
    let active = false;
    if (this.props.winningLine && this.props.winningLine.indexOf(parseInt(i)) !== -1) {
      active = true;
    }

    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        key={i}
        active={active}
      />
    );
  }

  render() {
    const squaresKeys = Object.keys(this.props.squares),
          rows = [];

    while (squaresKeys.length) {
      rows.push(squaresKeys.splice(0, 3));
    }

    return (
      <div>
        {rows.map((row, key) => (
          <div key={key} className="board-row">
            {row.map(square => this.renderSquare(square))}
          </div>
        ))}
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
        targetSquare: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      sort: false,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';

    this.setState({
      history: history.concat([{
        squares: squares,
        targetSquare: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  sort() {
    this.setState({
      sort: !this.state.sort,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const column = step.targetSquare % 3 + 1;
      const row = Math.floor(step.targetSquare / 3) + 1;

      const desc = move ?
        'Перейти к ходу #' + move + ` (${column}, ${row})` :
        'К началу игры';
      return (
        <li className={this.state.stepNumber===move ? "active":null} key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    const movesSorted = this.state.sort ? moves.slice().reverse() : moves.slice();

    let status;
    if (winner) {
      status = 'Winner: ' + winner.winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    if (current.squares.indexOf(null) === -1) status = 'Draw';

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares = {current.squares}
            onClick = {(i) => this.handleClick(i)}
            winningLine = {winner ? winner.line : null}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div className="history">
            <div className="history-sort">Сортировать по: <span onClick={() => this.sort()}>{this.state.sort ? 'убыванию' : 'возрастанию'}</span></div>
            <ol>{movesSorted}</ol>
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

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
      return {winner: squares[a], line: lines[i]};
    }
  }
  return null;
}
