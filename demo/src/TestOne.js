import React, { Component } from "react";
import { Tooltip, TooltipPortal } from "../../src";

export class TestOne extends Component {
  state = {
    width: 100,
    clicked: true,
  };
  render = () => {
    return (
      <TooltipPortal
        //portal={this.state.clicked}
        themes={{
          default: null,
          night: null,
        }}
        style={{
          overflow: "scroll",
          width: 400,
          height: 400,
        }}
        // defaultTheme={this.state.clicked ? 'night' : 'default'}
      >
        <div style={{ width: 800, height: 800 }}>
          <div
            style={{
              marginLeft: 200,
              marginTop: 200,
              display: "inline-block",
              backgroundColor: "purple",
              width: "100px",
              position: 'relative',
            }}
            // onClick={() => this.setState(({clicked}) => ({
            //   width: 200,
            //   clicked: !clicked
            // }))}
          >
            <Tooltip
              position={"top"}
              test={this.state.width}
              showing={true}
              interactive={true}
              inline={true}
            >
              <div style={{ width: this.state.width }}>{"test tip"}</div>
            </Tooltip>
            {/* <Tooltip
              position={"right"}
              test={this.state.width}
              showing={true}
              interactive={true}
            >
              <div style={{ width: this.state.width }}>{"test tip"}</div>
            </Tooltip> */}
            <Tooltip
              position={"left"}
              test={this.state.width}
              showing={true}
              interactive={true}
              inline={true}
            >
              <div style={{ width: this.state.width }}>{"test tip"}</div>
            </Tooltip>
            {/* <Tooltip
              position={"bottom"}
              test={this.state.width}
              showing={true}
              boxClassName={"test-box"}
              maskClassName={"test-mask"}
              tailClassName={"test-tail"}
              interactive={true}
            >
              <div style={{ width: this.state.width }}>{"test tip"}</div>
            </Tooltip> */}
            {"test"}
          </div>
          <div
            onClick={() =>
              this.setState(({ clicked }) => ({
                width: 200,
                clicked: !clicked,
              }))
            }
          >
            <div
              style={{
                display: "inline-block",
                backgroundColor: "blue",
                width: "50px",
              }}
            >
              {"test2"}
              <Tooltip theme={"night"} position={"right"} showing={true}>
                {"test"}
              </Tooltip>
            </div>
          </div>
        </div>
      </TooltipPortal>
    );
  };
}
