
export const environment = {
  production: true,
  serverWsUrl: window.location.protocol === 'http:' ? 
    'ws://' +  window.location.hostname + ':' + window.location.port + '/' :
    'wss://' +  window.location.hostname + ':' + window.location.port + '/', 
  serverHttpUrl: window.location.origin
};
