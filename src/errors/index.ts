export class UnauthorizedError extends Error {
  constructor(message?: string) {
    super(message ?? 'Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

export class ItemAlreadyExists extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ItemAlreadyExists'
  }
}

export class InvalidCategory extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidCategory'
  }
}
