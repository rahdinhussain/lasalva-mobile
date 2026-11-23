const { withGradleProperties } = require('expo/config-plugins');

module.exports = (config) => withGradleProperties(config, (result) => {
  const properties = result.modResults;
  const setting = properties.find((entry) => entry.type === 'property' && entry.key === 'org.gradle.jvmargs');
  const flags = (setting?.value || '').split(/\s+/).filter((flag) =>
    flag && !flag.startsWith('-Xmx') && !flag.startsWith('-XX:MaxMetaspaceSize=') && flag !== '-XX:+ExitOnOutOfMemoryError'
  );
  // Expo's default 512 MiB metaspace is exhausted by the Android release packaging tasks.
  flags.push('-Xmx4g', '-XX:MaxMetaspaceSize=2g', '-XX:+ExitOnOutOfMemoryError');
  const value = flags.join(' ');
  if (setting) setting.value = value;
  else properties.push({ type: 'property', key: 'org.gradle.jvmargs', value });
  return result;
});
