const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Fix for 'folly/coro/Coroutine.h' file not found when building RNReanimated
 * with React Native 0.81 / Expo 54 and New Architecture disabled.
 * Injects FOLLY_HAS_COROUTINES=0 into build settings to force-disable
 * folly coroutines when the headers are not shipped.
 */
function withFollyCoroutinesFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');

      const fix = `
  # withFollyCoroutinesFix: disable folly coroutines (RN 0.81 + Reanimated)
  def apply_folly_coroutines_fix(build_settings)
    # Use GCC_PREPROCESSOR_DEFINITIONS so Xcode passes -D correctly.
    current = build_settings['GCC_PREPROCESSOR_DEFINITIONS']
    values = current.is_a?(Array) ? current.dup : current.to_s.split(' ')
    values.reject! { |v| v.start_with?('FOLLY_HAS_COROUTINES=') }
    values << '$(inherited)' unless values.include?('$(inherited)')
    values << 'FOLLY_HAS_COROUTINES=0' unless values.include?('FOLLY_HAS_COROUTINES=0')
    build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = values
  end

  installer.pods_project.build_configurations.each do |cfg|
    apply_folly_coroutines_fix(cfg.build_settings)
  end
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |cfg|
      apply_folly_coroutines_fix(cfg.build_settings)
    end
  end

  # RNReanimated: disable Folly coroutines (folly/coro/Coroutine.h not found)
  installer.pods_project.targets.each do |target|
    if target.name == "RNReanimated"
      target.build_configurations.each do |config|
        config.build_settings["CLANG_ENABLE_OBJC_ARC"] = "YES"
        config.build_settings["GCC_PREPROCESSOR_DEFINITIONS"] ||= ['$(inherited)', 'FOLLY_NO_CONFIG']
      end
    end
  end
`;

      // Avoid duplicate insertion of this fix block.
      if (contents.includes('withFollyCoroutinesFix')) {
        return config;
      }

      // Insert at start of post_install block so `installer` is in scope.
      const anchor = /post_install\s+do\s+\|\s*installer\s*\|/;
      if (!anchor.test(contents)) {
        throw new Error('withFollyCoroutinesFix: Could not find post_install do |installer| in Podfile');
      }
      contents = contents.replace(anchor, (match) => match + fix);
      fs.writeFileSync(podfilePath, contents);
      return config;
    },
  ]);
}

module.exports = withFollyCoroutinesFix;
