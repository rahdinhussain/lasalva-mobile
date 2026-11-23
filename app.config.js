// EAS makes file environment variables available as paths during native builds.
module.exports = ({ config }) => {
  const preview = process.env.LASALVA_DEVICE_PREVIEW === '1';
  const googleServicesFile = preview
    ? undefined
    : process.env.GOOGLE_SERVICES_JSON || config.android?.googleServicesFile;
  return {
    ...config,
    ...(preview && { name: 'Lasalva Preview', scheme: 'lasalvapreview' }),
    android: {
      ...config.android,
      ...(preview && { package: 'com.lasalva.mobile.preview' }),
      googleServicesFile,
    },
    extra: {
      ...config.extra,
      androidPushConfigured: Boolean(googleServicesFile),
    },
  };
};
