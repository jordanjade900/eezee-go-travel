import { handleOperations } from '../../backend/api.mjs';

export default (request, context) => {
  const headers = new Headers(request.headers);
  headers.delete('x-ops-local-ip');
  headers.set('x-nf-client-connection-ip', context.ip || 'unknown');
  return handleOperations(new Request(request, { headers }));
};
export const config = { path: '/api/operations/*' };
