import { Component } from "react"
import PropTypes from "prop-types"
import styled from "styled-components"

const DragScrollDiv = styled.div`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
`
const Wrapper = styled.div`
  position: sticky;
`
const Scroller = styled.div`
  position: absolute;
  overflow: ${props => props.overflow};
  user-select: none;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  ${props => props.cursor};
`
const Content = styled.div`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  transform-origin: 0 0;
  transform: scale(${props => zoomLevels[props.zoomLevel]});
`
const zoomLevels = ["1.0", "0.75", "0.5"]
const Controls = styled.div`
  position: absolute;
  top: 10px;
  left: ${props => props.width + 10}px;
`
const ZoomIn = styled.button`
`
const ZoomOut = styled.button`
`

class DragScroll extends Component {

  constructor(props) {
    super(props)
    this.isDragging = false
    this.state = {
      cursor: "",
      overflow: "hidden",
      zoomLevel: 0
    }
  }

  componentDidMount() {
    setTimeout(() => { // <------- TEMPORARY FIX, PENDING PROPER FIX
      if (this.scroller.scrollWidth > this.props.width || this.scroller.scrollHeight > this.props.height) {
        this.setState({ cursor: "cursor: grab", overflow: "auto" })
        document.addEventListener("mousemove", this.onMouseMove)
        document.addEventListener("mouseup", this.onMouseUp)
        this.scroller.addEventListener("mousedown", this.onMouseDown)
      }
    }, 100)
    //////////////////////////////////////////////////// ----------->
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.onMouseMove)
    document.removeEventListener("mouseup", this.onMouseUp)
    this.scroller.removeEventListener("mousedown", this.onMouseDown)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.width != this.props.width || nextProps.height != this.props.height) {
      return true
    }
    if (nextState.cursor == this.state.cursor && nextState.zoomLevel == this.state.zoomLevel) {
      return false
    }
    return true
  }

  componentDidUpdate() {
    if (this.state.cursor != "" && this.scroller.scrollWidth <= this.props.width && this.scroller.scrollHeight <= this.props.height) {
      this.setState({ cursor: "", overflow: "hidden" })
      document.removeEventListener("mousemove", this.onMouseMove)
      document.removeEventListener("mouseup", this.onMouseUp)
      this.scroller.removeEventListener("mousedown", this.onMouseDown)
    }

    if (this.state.cursor == "" && (this.scroller.scrollWidth > this.props.width || this.scroller.scrollHeight > this.props.height)) {
      this.setState({ cursor: "cursor: grab", overflow: "auto" })
      document.addEventListener("mousemove", this.onMouseMove)
      document.addEventListener("mouseup", this.onMouseUp)
      this.scroller.addEventListener("mousedown", this.onMouseDown)
    }
  }

  onMouseMove = (event) => {
    if (this.isDragging) {
      this.scroller.scrollLeft -= -this.lastClientX + (this.lastClientX = event.clientX)
      this.scroller.scrollTop -= -this.lastClientY + (this.lastClientY = event.clientY)
    }
  }

  onMouseUp = () => {
    this.setState({ cursor: "cursor: grab" })
    this.isDragging = false
  }

  onMouseDown = (event) => {
    event.preventDefault()
    this.setState({ cursor: "cursor: grabbing" })
    this.isDragging = true
    this.lastClientX = event.clientX
    this.lastClientY = event.clientY
  }

  zoomIn = () => {
    if (this.state.zoomLevel > 0) {
      this.setState({ zoomLevel: this.state.zoomLevel - 1 })
    }
  }

  zoomOut = () => {
    if (this.state.zoomLevel < zoomLevels.length - 1) {
      this.setState({ zoomLevel: this.state.zoomLevel + 1 })
    }
  }

  render() {
    return (
      <DragScrollDiv className={this.props.className}
        width={this.props.width}
        height={this.props.height}>
        <Wrapper>
          <Scroller
            innerRef={scroller => this.scroller = scroller}
            display={this.state.display}
            width={this.props.width}
            height={this.props.height}
            cursor={this.state.cursor}
            overflow={this.state.overflow}>
            <Content
              width={this.props.width}
              height={this.props.height}
              zoomLevel={this.state.zoomLevel}>
              {this.props.children}
            </Content>
          </Scroller>
          <Controls width={this.props.width}>
            <ZoomIn onClick={this.zoomIn}>+</ZoomIn>
            <ZoomOut onClick={this.zoomOut}>-</ZoomOut>
          </Controls>
        </Wrapper>
      </DragScrollDiv>
    )
  }
}

DragScroll.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}

export default DragScroll