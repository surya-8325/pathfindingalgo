import React, { Component } from "react";
import Node from "./Node/Node";
import dijkstra, {
  getNodesInShortestPathOrder,
} from "../algorithms/dijkstra.js";
import "./PathfindingVisualizer.css";
import { Button } from "react-bootstrap";
export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      animating: false,
      START_NODE_ROW: 8,
      START_NODE_COL: 15,
      FINISH_NODE_ROW: 10,
      FINISH_NODE_COL: 35,
      selectstart: false,
      selectend: false,
    };
  }

  componentDidMount() {
    const grid = this.getInitialGrid();
    this.setState({ grid });
  }
  handleMouseDown(row, col) {
    if (this.state.selectstart) {
      this.setState(
        () => ({ START_NODE_ROW: row, START_NODE_COL: col }),
        () => {
          const grid = this.getInitialGrid();
          this.setState({ grid });
        }
      );
    } else if (this.state.selectend) {
      this.setState(
        () => ({ FINISH_NODE_ROW: row, FINISH_NODE_COL: col }),
        () => {
          const grid = this.getInitialGrid();
          this.setState({ grid });
        }
      );
    } else {
      if (this.state.animating) return;
      const newGrid = this.getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  }
  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = this.getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid });
  }
  handleMouseUp() {
    this.setState({
      mouseIsPressed: false,
      selectstart: false,
      selectend: false,
    });
  }
  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 1; i <= visitedNodesInOrder.length - 1; i++) {
      if (i === visitedNodesInOrder.length - 1) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, i);
    }
  }
  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 1; i <= nodesInShortestPathOrder.length - 1; i++) {
      if (i === nodesInShortestPathOrder.length - 1) {
        setTimeout(() => {
          this.setState({ animating: false });
        }, 1000);
        return;
      }
      const node = nodesInShortestPathOrder[i];
      setTimeout(() => {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
      }, 50 * i);
    }
  }
  visualizeDijkstra() {
    const { grid } = this.state;
    const startNode =
      grid[this.state.START_NODE_ROW][this.state.START_NODE_COL];
    const finishNode =
      grid[this.state.FINISH_NODE_ROW][this.state.FINISH_NODE_COL];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.setState(
      prevState => ({
        animating: !prevState.animating,
      }),
      () => {
        this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
      }
    );
  }
  getInitialGrid = () => {
    const grid = [];
    for (let row = 0; row < 20; row++) {
      const currentRow = [];
      for (let col = 0; col < 50; col++) {
        currentRow.push(this.createNode(col, row));
      }
      grid.push(currentRow);
    }
    return grid;
  };
  createNode = (col, row) => {
    return {
      col,
      row,
      isStart:
        row === this.state.START_NODE_ROW && col === this.state.START_NODE_COL,
      isFinish:
        row === this.state.FINISH_NODE_ROW &&
        col === this.state.FINISH_NODE_COL,
      distance: Infinity,
      isVisited: false,
      isWall: false,
      previousNode: null,
    };
  };
  getNewGridWithWallToggled = (grid, row, col) => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
    return newGrid;
  };
  clearEverything() {
    if (this.state.animating) return;
    for (let row = 0; row < this.state.grid.length; row++) {
      for (let col = 0; col < this.state.grid[0].length; col++) {
        if (
          !(
            (row === this.state.START_NODE_ROW &&
              col === this.state.START_NODE_COL) ||
            (row === this.state.FINISH_NODE_ROW &&
              col === this.state.FINISH_NODE_COL)
          )
        ) {
          document.getElementById(`node-${row}-${col}`).className = "node";
        }
      }
    }
    document.getElementById(
      `node-${this.state.START_NODE_ROW}-${this.state.START_NODE_COL}`
    ).className = "node node-start";
    document.getElementById(
      `node-${this.state.FINISH_NODE_ROW}-${this.state.FINISH_NODE_COL}`
    ).className = "node node-finish";
    const newgrid = this.getInitialGrid();
    this.setState({ grid: newgrid });
  }
  render() {
    const { grid, mouseIsPressed } = this.state;
    const extraClassNameStart = this.state.selectstart
      ? "btn-secondary"
      : "btn-primary";
    const extraClassNameEnd = this.state.selectend
      ? "btn-secondary"
      : "btn-primary";

    return (
      <>
        <h1 className="heading">Dijkstra Visualizer</h1>
        <Button
          className={`setStart btn ${extraClassNameStart}`}
          onClick={() =>
            this.setState({ selectstart: !this.state.selectstart })
          }
        >
          Set start node
        </Button>
        <Button
          className={`setEnd btn ${extraClassNameEnd}`}
          onClick={() => this.setState({ selectend: !this.state.selectend })}
        >
          Set end node
        </Button>
        <Button
          className="djikstrabtn"
          onClick={() => this.visualizeDijkstra()}
        >
          Visualize Dijkstra's Algorithm
        </Button>
        <Button className="clearbtn" onClick={() => this.clearEverything()}>
          Clear Grid
        </Button>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall } = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      isVisited={false}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}
