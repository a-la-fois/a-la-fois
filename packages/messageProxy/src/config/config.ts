export default () => ({
  dapr: {
    host: process.env.DAPR_SIDECAR_HOST || '127.0.0.1',
    port: process.env.DAPR_SIDECAR_PORT || '3500',
  },
});
