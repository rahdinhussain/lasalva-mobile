// Expo supplies the file path for an EAS file environment variable at build time.
module.exports = ({ config }) => {
  const preview = process.env.LASALVA_DEVICE_PREVIEW === '1';
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON;
  return {
    ...config,
    ...(preview && { name: 'Lasalva Preview', scheme: 'lasalvapreview' }),
    android: {
      ...config.android,
      ...(preview && { package: 'com.lasalva.mobile.preview' }),
      ...(!preview && googleServicesFile && { googleServicesFile }),
    },
  };
};
