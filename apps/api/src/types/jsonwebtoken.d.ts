declare module 'jsonwebtoken' {
  export function sign(
    payload: string | object,
    secretOrPrivateKey: string,
    options?: { expiresIn?: string | number; algorithm?: string },
  ): string

  export function verify(
    token: string,
    secretOrPublicKey: string,
  ): any
}
