export class MessageBuffer {
  private buffer: string
  private delimiter: string

  constructor(delimiter: string) {
    this.delimiter = delimiter
    this.buffer = ""
  }

  public isFinished(): boolean {
    if (
      this.buffer.length === 0 ||
      this.buffer.indexOf(this.delimiter) === -1
    ) {
      return true
    }
    return false
  }

  public push(data: any): void {
    this.buffer += data
  }

  public getMessage(): string {
    const delimiterIndex = this.buffer.indexOf(this.delimiter)
    if (delimiterIndex !== -1) {
      const message = this.buffer.slice(0, delimiterIndex)
      this.buffer = this.buffer.replace(message + this.delimiter, "")
      return message
    }
    return ""
  }

  public handleData(): string {
    const message = this.getMessage()
    return message
  }
}