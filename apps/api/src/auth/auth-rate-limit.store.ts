export abstract class AuthRateLimitStore {
  abstract consume(
    scope: string,
    identity: string,
    limit: number,
    windowSeconds: number,
  ): Promise<boolean>;
}
