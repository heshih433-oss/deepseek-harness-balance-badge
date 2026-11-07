/**
 * Host half of dsh-balance-badge.
 *
 * The plugin is browser-only: it reads the account balance through the client
 * Remote namespace and renders a strip in the shell.bottom slot. This host
 * entry exists because every Loader row needs a module, and provides no
 * host-side behavior.
 */
export function apply() {}
