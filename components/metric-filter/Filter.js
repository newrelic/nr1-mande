const filter = (value) {
  const SINGLE_ESCAPE = 'single'
  const DOUBLE_ESCAPE = 'double'

  const format = escapeType => {
    const formatted = value

    switch (escapeType) {
      case SINGLE_ESCAPE:
        formatted = formatted.replace(/'/g, "\\\'")
      case DOUBLE_ESCAPE:
        formatted = formatted.replace(/'/g, "\\\\'")
    }
    
    return formatted
  }
  
  const isNaN = () => {
    return value.isNaN()
  }
}