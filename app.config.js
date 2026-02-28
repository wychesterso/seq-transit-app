export default ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    typedRoutes: true,
  },
  extra: {
    ...config.extra,
    apiBaseUrl:
      "https://seq-transit-api-242569128358.australia-southeast1.run.app/",
    router: {
      origin: false,
    },
  },
});
