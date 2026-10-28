import { type NodeRequest, type NodeResponse } from '@nestjs/platform-node';

import { randomUUID } from 'node:crypto';

const requestIdPattern = /^[A-Za-z0-9_-]{1,64}$/;

export function requestIdMiddleware(
  request: NodeRequest & { requestId?: string },
  response: NodeResponse,
  next: () => void,
) {
  const incoming = request.headers['x-request-id'];
  const requestId =
    typeof incoming === 'string' && requestIdPattern.test(incoming)
      ? incoming
      : randomUUID();
  request.requestId = requestId;
  response.setHeader('X-Request-Id', requestId);
  next();
}
