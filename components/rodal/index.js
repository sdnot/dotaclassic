/* ===============================
 * Rodal v1.5.2 http://rodal.cn
 * =============================== */

import React from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

// env
const inBrowser = typeof window !== "undefined"
const UA = inBrowser && window.navigator.userAgent.toLowerCase()
const isIE9 = UA && UA.indexOf("msie 9.0") > 0

const Wrapper = styled.div`
  display: ${props => props.isShow ? "" : "none"};
  animation-duration: ${props => props.animationDuration}ms;
`
const Dialog = styled.div`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  animation-duration: ${props => props.animationDuration}ms;
  background-color: #bd4625;
  padding: 10px;
`
const Header = styled.div`
  display: flex;
  height: 40px;
  justify-content: center;
  align-items: center;
  font-size: 30px;
`
const Content = styled.div`
  width: 100%;
  height: ${props => props.height}px;
  overflow: ${props => props.overflow};
  background-color: #fae6ab;
`
class Rodal extends React.Component {

  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    visible: PropTypes.bool,
    showMask: PropTypes.bool,
    closeMaskOnClick: PropTypes.bool,
    showCloseButton: PropTypes.bool,
    animation: PropTypes.string,
    duration: PropTypes.number,
    className: PropTypes.string,
    customStyles: PropTypes.object,
    customMaskStyles: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onAnimationEnd: PropTypes.func,
    title: PropTypes.string,
    overflow: PropTypes.string
  }

  static defaultProps = {
    width: 400,
    height: 240,
    visible: false,
    showMask: true,
    closeMaskOnClick: true,
    showCloseButton: true,
    animation: "zoom",
    duration: 300,
    className: "",
    customStyles: {},
    customMaskStyles: {},
    overflow: "hidden"
  }

  state = {
    isShow: false,
    animationType: "leave"
  }

  componentDidMount() {
    if (this.props.visible) {
      this.enter()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.enter()
    } else if (this.props.visible && !nextProps.visible) {
      this.leave()
    }
  }

  enter() {
    this.setState({
      isShow: true,
      animationType: "enter"
    })
  }

  leave() {
    this.setState(isIE9
      ? { isShow: false }
      : { animationType: "leave" }
    )
  }

  animationEnd = () => {
    if (this.state.animationType === "leave") {
      this.setState({ isShow: false })
    }

    const { onAnimationEnd } = this.props
    onAnimationEnd && onAnimationEnd()
  }

  render() {
    const { props, state } = this
    const onClick = props.closeMaskOnClick ? props.onClose : null
    const CloseButton = props.showCloseButton ? <span className="rodal-close" onClick={props.onClose} /> : null
    const mask = props.showMask ? <div className="rodal-mask" style={props.customMaskStyles} onClick={onClick} /> : null
    const header = props.title ? <Header>{props.title}</Header> : null
    if (state.isShow == false) {
      return null
    }
    return (
      <Wrapper
        className={`rodal rodal-fade-${state.animationType}`}
        isShow={state.isShow}
        animationDuration={props.duration}
        onAnimationEnd={this.animationEnd}
      >
        {mask}
        <Dialog
          className={`rodal-dialog rodal-${props.animation}-${state.animationType}`}
          width={props.width}
          height={props.height}
          animationDuration={props.duration}
          animationType={state.animationType}
          overflow={props.overflow}
        >
          {CloseButton}
          {header}
          <Content
            className={props.className}
            height={props.title ? props.height - 40 : props.height}
            overflow={props.overflow}
          >
            {props.children}
          </Content>
        </Dialog>
      </Wrapper>
    )
  }
}

export default Rodal