import { Component } from "react"
import PropTypes from "prop-types"

class CountdownClock extends Component {

  constructor(props) {
    super(props)
    this.seconds = 0
    this.radius = null
    this.fraction = null
    this.content = null
    this.canvas = null
    this.timeoutIds = []
  }

  componentDidUpdate(prevProps) {
    this.seconds = this.props.seconds
    if (this.props.maxSeconds > 0) {
      this.percentOfMax = this.seconds / this.props.maxSeconds
    }
    else {
      this.percentOfMax = 1
    }
    this.cancelTimer()
    this.setupTimer()
    this.clearBackground()
    this.drawBackground()
    this.updateCanvas()

    if (prevProps.paused != this.props.paused) {
      if (!this.props.paused) {
        this.startTimer()
      }
      else {
        this.pauseTimer()
      }
    }
  }

  componentDidMount() {
    this.seconds = this.props.seconds
    if (this.props.maxSeconds > 0) {
      this.percentOfMax = this.seconds / this.props.maxSeconds
    }
    else {
      this.percentOfMax = 1
    }
    this.setupTimer()
  }

  componentWillUnmount() {
    this.cancelTimer()
  }

  setupTimer() {
    this.setScale()
    this.setupCanvases()
    this.drawBackground()
    this.drawTimer()
    if (!this.props.paused) {
      this.startTimer()
    }
  }

  updateCanvas() {
    this.clearTimer()
    this.drawTimer()
  }

  setScale() {
    this.radius = this.props.size / 2
    this.fraction = 2 / this.seconds
    this.tickPeriod = this.calculateTick()
    if (this.props.weight) {
      this.innerRadius = this.radius - this.props.weight
    }
    else {
      this.innerRadius = this.radius / 1.8
    }
  }

  calculateTick() {
    //Tick period (milleseconds) needs to be fast for smaller time periods and slower
    //for longer ones. This provides smoother rendering. It should never exceed 1 second.
    const tickScale = 1.8
    const tick = this.props.maxSeconds * tickScale
    if (tick > 1000) {
      return 1000
    }
    return tick
  }

  setupCanvases() {
    this.background = this.backgroundNode.getContext("2d")
    this.timer = this.timerNode.getContext("2d")
    this.timer.textAlign = "center"
    this.timer.textBaseline = "middle"
    if (this.props.onClick) {
      this.componentNode.addEventListener("click", this.props.onClick)
    }
  }

  startTimer() {
    //Give it a moment to collect it's thoughts for smoother render
    this.timeoutIds.push(setTimeout(() => this.tick()), 200)
  }

  pauseTimer() {
    this.stopTimer()
    this.updateCanvas()
  }

  stopTimer() {
    this.timeoutIds.forEach(timeout => {
      clearTimeout(timeout)
    })
  }

  cancelTimer() {
    this.stopTimer()
    if (this.props.onClick) {
      this.componentNode.removeEventListener("click", this.props.onClick)
    }
  }

  tick() {
    const start = Date.now()
    this.timeoutIds.push(setTimeout(() => {
      const duration = (Date.now() - start) / 1000
      this.seconds -= duration

      if (this.seconds <= 0) {
        this.seconds = 0
        this.handleComplete()
        this.clearTimer()
      }
      else {
        if (this.props.showMilliseconds && this.tickPeriod > 100 && this.seconds <= 10) {
          this.tickPeriod = 100
        }
        this.updateCanvas()
        this.tick()
      }

    }, this.tickPeriod))
  }

  handleComplete() {
    if (this.onComplete) {
      this.props.onComplete()
    }
  }

  clearBackground() {
    this.background.clearRect(0, 0, this.timerNode.width, this.timerNode.height)
  }

  clearTimer() {
    this.timer.clearRect(0, 0, this.timerNode.width, this.timerNode.height)
  }

  drawBackground() {
    this.background.beginPath()
    this.background.globalAlpha = this.props.alpha / 3
    this.background.fillStyle = this.props.color
    this.background.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2, false)
    this.background.arc(this.radius, this.radius, this.innerRadius, Math.PI * 2, 0, true)
    this.background.closePath()
    this.background.fill()
  }

  formattedTime() {
    const decimals = (this.seconds <= 9.9 && this.props.showMilliseconds) ? 1 : 0

    if (this.props.timeFormat == "hms") {
      let hours = Math.floor(this.seconds / 3600)
      let minutes = Math.floor(this.seconds / 60)
      let seconds = (this.seconds % 60).toFixed(decimals)

      if (seconds == 60) {
        minutes += 1
        seconds = 0
      }
      if (hours < 10) hours = `0${hours}`
      if (minutes < 10) minutes = `0${minutes}`
      if (seconds < 10 && !decimals) seconds = `0${seconds}`

      const timeParts = []
      if (hours > 0) timeParts.push(hours)
      if (minutes > 0) timeParts.push(minutes)
      timeParts.push(seconds)

      return timeParts.join(":")
    }
    else {
      return this.seconds.toFixed(decimals)
    }
  }

  fontSize(timeString) {
    if (this.props.fontSize == "auto") {
      let scale
      switch (timeString.length) {
        case 8:
          scale = 4
          break
        case 5:
          scale = 3
          break
        default:
          scale = 2
      }
      const size = this.radius / scale
      return `${size}px`
    }
    else {
      this.props.fontSize
    }
  }

  drawTimer() {
    const percent = this.fraction * this.seconds * this.percentOfMax + 1.5
    const formattedTime = this.formattedTime()
    let text
    if (this.props.paused && this.props.pausedText) {
      text = this.props.pausedText
    }
    else {
      text = formattedTime
    }

    //Timer
    this.timer.globalAlpha = this.props.alpha
    this.timer.fillStyle = this.props.color
    this.timer.font = `bold ${this.fontSize(formattedTime)} ${this.props.font}`
    this.timer.fillText(text, this.radius, this.radius)
    this.timer.beginPath()
    this.timer.arc(this.radius, this.radius, this.radius, Math.PI * 1.5, Math.PI * percent, false)
    this.timer.arc(this.radius, this.radius, this.innerRadius, Math.PI * percent, Math.PI * 1.5, true)
    this.timer.closePath()
    this.timer.fill()
  }

  render() {
    return (
      <div ref={instance => this.componentNode = instance} className={this.props.className}>
        <canvas ref={instance => this.backgroundNode = instance} style={{ position: "absolute" }} width={this.props.size} height={this.props.size}></canvas>
        <canvas ref={instance => this.timerNode = instance} style={{ position: "absolute" }} width={this.props.size} height={this.props.size}></canvas>
      </div>
    )
  }

}

CountdownClock.propTypes = {
  seconds: PropTypes.number,
  maxSeconds: PropTypes.number,
  size: PropTypes.number,
  weight: PropTypes.number,
  color: PropTypes.string,
  fontSize: PropTypes.string,
  font: PropTypes.string,
  alpha: PropTypes.number,
  timeFormat: PropTypes.string,
  onComplete: PropTypes.func,
  onClick: PropTypes.func,
  showMilliseconds: PropTypes.bool,
  paused: PropTypes.bool,
  pausedText: PropTypes.string
}

CountdownClock.defaultProps = {
  seconds: 60,
  maxSeconds: 0,
  size: 60,
  color: "#000",
  alpha: 1,
  timeFormat: "hms",
  fontSize: "auto",
  font: "Arial",
  showMilliseconds: true,
  paused: false
}

export default CountdownClock