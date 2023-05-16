interface DefaultAction {
  title: string
  type: 'button'
}

interface InputStringAction {
  title: string
  type: 'input'
  input: {
    type: 'text'
    default: string
    pattern?: RegExp
  }
}

interface InputNumberAction {
  title: string
  type: 'input'
  input: {
    type: 'number'
    default: number
    pattern?: never
  }
}

export type Action = DefaultAction | InputStringAction | InputNumberAction