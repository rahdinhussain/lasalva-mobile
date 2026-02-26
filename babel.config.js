// NativeWind uses react-native-css-interop which adds "react-native-worklets/plugin".
// The worklets Babel plugin can cause build failures, so we replicate the
// NativeWind/CSS-interop Babel setup without it. New Architecture stays enabled in app.json.
function nativewindPresetWithoutWorklets() {
  return {
    plugins: [
      require('react-native-css-interop/dist/babel-plugin').default,
      [
        '@babel/plugin-transform-react-jsx',
        { runtime: 'automatic', importSource: 'react-native-css-interop' },
      ],
    ],
  };
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      nativewindPresetWithoutWorklets,
    ],
    plugins: [],
  };
};
