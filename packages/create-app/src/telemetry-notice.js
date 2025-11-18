/**
 * Telemetry Notice
 *
 * Displays privacy-respecting telemetry notice to users
 */

import kleur from 'kleur'

/**
 * Display telemetry notice
 */
export function displayTelemetryNotice() {
  console.log()
  console.log(kleur.dim('━'.repeat(60)))
  console.log()
  console.log(kleur.bold('📊 Anonymous Usage Analytics'))
  console.log()
  console.log(kleur.dim('SonicJS collects anonymous telemetry to improve the product.'))
  console.log(kleur.dim('We do NOT collect any personally identifiable information.'))
  console.log()
  console.log(kleur.dim('Collected data includes:'))
  console.log(kleur.dim('  • Installation success/failure rates'))
  console.log(kleur.dim('  • OS and Node.js version'))
  console.log(kleur.dim('  • Anonymous installation ID'))
  console.log()
  console.log(kleur.dim('To disable telemetry, set:'))
  console.log(kleur.cyan('  export SONICJS_TELEMETRY=false'))
  console.log()
  console.log(kleur.dim('Learn more: https://docs.sonicjs.com/telemetry'))
  console.log()
  console.log(kleur.dim('━'.repeat(60)))
  console.log()
}

/**
 * Display opt-out reminder in success message
 */
export function displayOptOutReminder() {
  console.log()
  console.log(kleur.dim('💡 Tip: To disable anonymous analytics, run:'))
  console.log(kleur.cyan('   export SONICJS_TELEMETRY=false'))
  console.log()
}
